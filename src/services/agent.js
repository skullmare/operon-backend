const TopicCategory = require('../models/topic-category');
const Message = require('../models/message');
const { qdrantClient } = require('../../config/qdrant');
const { getEmbeddings } = require('./openrouter/get-embeddings');
const { chat } = require('./openrouter/chat');

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'knowledge_base';
const HISTORY_LIMIT = 10;

// Agent 1: determines which knowledge base category best matches the user's query
async function classifyCategory(userMessage, categories) {
    if (!categories.length) return null;

    const categoryList = categories
        .map(c => `- ${c.name}: ${c.description}`)
        .join('\n');

    const response = await chat([
        {
            role: 'system',
            content: `Ты классификатор запросов. Определи, к какой из перечисленных категорий базы знаний относится вопрос пользователя.
Доступные категории:
${categoryList}

Ответь ТОЛЬКО точным названием одной категории из списка (без кавычек и пояснений). Если ни одна категория не подходит — ответь словом: null`
        },
        { role: 'user', content: userMessage }
    ]);

    const trimmed = response?.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null') return null;

    const matched = categories.find(c => c.name === trimmed);
    return matched ? matched.name : null;
}

// Searches Qdrant for chunks accessible by the user's role, optionally filtered by category
async function searchChunks(queryVector, categoryName, roleId) {
    const mustFilters = [
        { key: 'metadata.accessibleByRoles', match: { value: roleId } }
    ];

    if (categoryName) {
        mustFilters.push({ key: 'metadata.category', match: { value: categoryName } });
    }

    return qdrantClient.search(COLLECTION_NAME, {
        vector: queryVector,
        filter: { must: mustFilters },
        limit: 5,
        with_payload: true
    });
}

// Agent 2: generates an answer grounded in the retrieved chunks
async function generateResponse(userMessage, chunks, history) {
    const context = chunks
        .map((hit, i) => `[${i + 1}] ${hit.payload.text}`)
        .join('\n\n');

    const systemPrompt = context
        ? `Ты ИИ-агент корпоративной базы знаний. Отвечай на вопросы пользователя строго на основе предоставленного контекста. Если в контексте нет нужной информации — честно скажи об этом.

Контекст:
${context}`
        : 'Ты ИИ-агент корпоративной базы знаний. По данному запросу в базе знаний ничего не найдено. Сообщи пользователю об этом вежливо.';

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
    ];

    return chat(messages);
}

async function processMessage(agentUser, userMessage) {
    const chatId = agentUser.chatId;
    const roleId = (agentUser.role._id ?? agentUser.role).toString();

    const [categories, [embeddingResult]] = await Promise.all([
        TopicCategory.find({}).lean(),
        getEmbeddings([userMessage], 'openai/text-embedding-3-small')
    ]);

    // Agent 1: classify category
    const categoryName = await classifyCategory(userMessage, categories);

    // Agent 2: retrieve relevant chunks
    const chunks = await searchChunks(embeddingResult.embedding, categoryName, roleId);

    // Load recent conversation history for context
    const history = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .lean();
    history.reverse();

    // Save user message
    await Message.create({
        agentUserId: agentUser._id,
        chatId,
        role: 'user',
        content: userMessage,
        category: categoryName
    });

    // Agent 2: generate grounded response
    const responseText = await generateResponse(userMessage, chunks, history);

    // Save assistant response
    await Message.create({
        agentUserId: agentUser._id,
        chatId,
        role: 'assistant',
        content: responseText,
        category: categoryName
    });

    return responseText;
}

module.exports = { processMessage };

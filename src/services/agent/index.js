const TopicCategory = require('../../models/topic-category');
const Message = require('../../models/message');
const { getEmbeddings } = require('../openrouter/get-embeddings');
const { classifyCategory } = require('./classify');
const { searchChunks } = require('./search');
const { generateResponse } = require('./respond');

const HISTORY_LIMIT = 10;

async function processMessage(agentUser, userMessage) {
    const { chatId, _id: agentUserId } = agentUser;
    const roleId = (agentUser.role._id ?? agentUser.role).toString();

    const [[embedding], categories] = await Promise.all([
        getEmbeddings([userMessage]),
        TopicCategory.find({}).lean()
    ]);

    const categoryName = await classifyCategory(userMessage, categories);
    const chunks = await searchChunks(embedding.embedding, categoryName, roleId);

    const history = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .limit(HISTORY_LIMIT)
        .lean()
        .then(msgs => msgs.reverse());

    await Message.create({ agentUserId, chatId, role: 'user', content: userMessage, category: categoryName });

    const responseText = await generateResponse(userMessage, chunks, history);

    await Message.create({ agentUserId, chatId, role: 'assistant', content: responseText, category: categoryName });

    return responseText;
}

module.exports = { processMessage };

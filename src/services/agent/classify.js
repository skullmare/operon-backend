const { chat } = require('../openrouter/chat');

async function classifyCategory(userMessage, categories) {
    if (!categories.length) return null;

    const list = categories.map(c => `- ${c.name}: ${c.description}`).join('\n');

    const result = await chat([
        {
            role: 'system',
            content: `Ты классификатор запросов. Определи, к какой из перечисленных категорий базы знаний относится вопрос пользователя. Доступные категории: ${list} Ответь ТОЛЬКО точным названием одной категории (без кавычек). Если ни одна не подходит — ответь: null`
        },
        { 
            role: 'user', 
            content: userMessage 
        }
    ]);

    const name = result?.trim();
    if (!name || name.toLowerCase() === 'null') return null;
    return categories.find(c => c.name === name)?.name ?? null;
}

module.exports = { classifyCategory };

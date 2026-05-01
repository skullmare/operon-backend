const { OpenRouter } = require('@openrouter/sdk');

const openrouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const CHAT_MODEL = process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-4o-mini';

async function chat(messages, model = CHAT_MODEL) {
    const response = await openrouter.chat.send({
        chatGenerationParams: { model, messages }
    });
    return response.choices[0].message.content;
}

module.exports = { chat };

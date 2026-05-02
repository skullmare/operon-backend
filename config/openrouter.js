const { OpenRouter } = require('@openrouter/sdk');

module.exports = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

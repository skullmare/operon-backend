const openrouter = require('../../../config/openrouter');

const MODEL = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

async function getEmbeddings(chunks) {
    const res = await openrouter.embeddings.generate({
        requestBody: { model: MODEL, input: chunks, encodingFormat: 'float' }
    });
    return res.data;
}

module.exports = { getEmbeddings };

const { QdrantClient } = require('@qdrant/js-client-rest');

const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});

console.log(`📦 Векторная база данных Qdrant инициализирована (адрес сервера: ${process.env.QDRANT_URL})`);

module.exports = { qdrantClient };
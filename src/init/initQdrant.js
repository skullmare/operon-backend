const { qdrantClient } = require('../../config/qdrant');

async function initQdrant() {
    const collectionName = "knowledge_base";

    try {
        const collections = await qdrantClient.getCollections();
        const exists = collections.collections.some(c => c.name === collectionName);

        if (!exists) {
            await qdrantClient.createCollection(collectionName, {
                vectors: {
                    size: 1536, // Размерность для OpenAI (text-embedding-3-small)
                    distance: 'Cosine' // Косинусное сходство — стандарт для текстов
                }
            });

            await qdrantClient.createPayloadIndex(collectionName, {
                field_name: "metadata.category",
                field_schema: "keyword"
            });

            await qdrantClient.createPayloadIndex(collectionName, {
                field_name: "metadata.accessibleByRoles",
                field_schema: "keyword"
            });

            console.log(`✅ Инициализация коллекции ${collectionName} в Qdrant успешно завершена`);
        } else {
            console.log(`ℹ️  Коллекции ${collectionName} уже существует, пропуск создания`);
        }
    } catch (error) {
        console.error("❌ Ошибка при инициализации коллекции в Qdrant:", error);
    }
}

module.exports = { initQdrant };
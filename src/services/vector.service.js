const axios = require('axios');
const FormData = require('form-data');
const { qdrantClient } = require('../../config/qdrant');
const crypto = require('crypto');

// Константы из .env
const UNSTRUCTURED_API_KEY = process.env.UNSTRUCTURED_API_KEY;
const UNSTRUCTURED_URL = "https://api.unstructuredapp.io/general/v0/general";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1";

/**
 * 1. Умная нарезка через Облако Unstructured.io
 */
async function getUnstructuredChunks(text) {
    try {
        const formData = new FormData();
        formData.append('files', Buffer.from(text), { 
            filename: 'content.txt',
            contentType: 'text/plain' 
        });
        
        // Настройки для качественного чанкинга
        formData.append('strategy', 'hi_res');
        formData.append('chunking_strategy', 'by_title'); // Режем по смысловым заголовкам
        formData.append('max_characters', '1500');
        formData.append('overlap', '200');

        const response = await axios.post(UNSTRUCTURED_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                'unstructured-api-key': UNSTRUCTURED_API_KEY
            }
        });

        // Unstructured возвращает массив элементов (заголовки, текст, таблицы)
        // Собираем их в массив текстовых чанков
        return response.data.map(element => element.text).filter(t => t.length > 20);
    } catch (error) {
        console.error("⚠️ Unstructured Cloud Error:", error.response?.data || error.message);
        // Резервный вариант: простой сплит
        return text.split('\n\n').filter(t => t.trim().length > 0);
    }
}

/**
 * 2. Получение векторов через OpenRouter
 */
async function getEmbeddings(chunks) {
    const response = await axios.post(`${OPENROUTER_URL}/embeddings`, {
        model: "openai/text-embedding-3-small",
        input: chunks
    }, {
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "Content-Type": "application/json"
        }
    });
    return response.data.data;
}

/**
 * 3. Итоговая функция: Текст -> Unstructured -> OpenRouter -> Qdrant
 */
async function syncTopicToQdrant(topic) {
    try {
        console.log(`⏳ Начинаю обработку статьи: "${topic.name}"...`);
        
        // Шаг 1: Нарезка в облаке
        const chunks = await getUnstructuredChunks(topic.content);
        
        // Шаг 2: Векторизация
        const embeddingData = await getEmbeddings(chunks);

        // Шаг 3: Подготовка данных для Qdrant
        const points = embeddingData.map((item, index) => ({
            id: crypto.randomUUID(),
            vector: item.embedding,
            payload: {
                text: chunks[index],
                metadata: {
                    topicId: topic._id.toString(),
                    name: topic.name,
                    category: topic.metadata.category.toString(),
                    accessibleByRoles: topic.metadata.accessibleByRoles.map(r => r.toString())
                }
            }
        }));

        // Шаг 4: Сохранение в локальный Qdrant (или облачный)
        await qdrantClient.upsert("knowledge_base", { wait: true, points });
        
        console.log(`✅ Успех! Статья "${topic.name}" теперь в векторной базе (${points.length} чанков).`);
    } catch (error) {
        console.error("❌ Ошибка в пайплайне синхронизации:", error.message);
    }
}

module.exports = { syncTopicToQdrant };
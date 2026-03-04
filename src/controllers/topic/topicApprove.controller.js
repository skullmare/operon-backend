const Topic = require('../../models/topic');
const Log = require('../../models/log');
const { syncTopicToQdrant } = require('../../services/vector.service');
const { getOneTopicSchema } = require('../../schemas/topic.schema');

/**
 * Одобрение темы и синхронизация с векторной базой Qdrant
 */
module.exports = async (req, res) => {
    try {
        // 1. Валидация ID (используем схему для получения одного объекта)
        const validation = await getOneTopicSchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            const formattedErrors = validation.error.issues.reduce((acc, issue) => {
                const path = issue.path.filter(p => p !== 'params').join('.');
                acc[path] = issue.message;
                return acc;
            }, {});

            return res.status(400).json({
                message: "Некорректный ID топика",
                errors: formattedErrors
            });
        }

        const { id } = validation.data.params;

        // 2. Находим топик и подтягиваем категорию
        const topic = await Topic.findById(id).populate('metadata.category');
        
        if (!topic) {
            return res.status(404).json({ message: 'Тема не найдена' });
        }

        // 3. Векторизация (синхронизация с Qdrant)
        // 
        console.log(`🚀 Начинаю синхронизацию топика ${id} с Qdrant...`);
        await syncTopicToQdrant(topic);

        // 4. Обновляем статус в MongoDB только после успеха в Qdrant
        topic.status = 'approved'; // Логичнее ставить published или approved
        topic.vectorData.isIndexed = true;
        topic.vectorData.lastIndexedAt = new Date();
        topic.updatedBy = req.user.id;
        
        await topic.save();

        // 5. Логируем успех (добавлено entityType)
        await Log.create({
            action: 'TOPIC_APPROVED',
            user: req.user.id,
            entityType: 'Topic',
            entityId: id,
            details: { message: 'Тема успешно векторизована и опубликована', name: topic.name }
        });

        res.json({ 
            message: 'Тема успешно одобрена и синхронизирована', 
            topic 
        });

    } catch (error) {
        console.error('❌ Ошибка при одобрении (Approve Error):', error);

        // 6. Логируем ошибку с указанием entityType
        await Log.create({
            action: 'TOPIC_APPROVE_ERROR',
            user: req.user.id,
            entityType: 'Topic',
            entityId: req.params.id,
            status: 'error',
            details: { message: error.message }
        });

        res.status(500).json({ 
            message: 'Ошибка при векторизации (процесс синхронизации провален)', 
            error: error.message 
        });
    }
};
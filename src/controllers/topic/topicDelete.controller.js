const Topic = require('../../models/topic');
const Log = require('../../models/log');
const { deleteTopicFromQdrant } = require('../../services/vector.service');
const { deleteTopicFiles } = require('../../services/storage.service'); // Путь к вашему S3 сервису
const { deleteTopicSchema } = require('../../schemas/topic.schema'); // Путь к схеме

module.exports = async (req, res) => {
    try {
        // 1. Валидация ID и проверка существования в БД через Zod
        // Используем safeParseAsync, так как в схеме есть асинхронные проверки (refine)
        const validation = await deleteTopicSchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            // Возвращаем первую ошибку из списка (например: "Топик с таким ID не найден")
            return res.status(404).json({ 
                message: validation.error.errors[0].message 
            });
        }

        const { id } = validation.data.params;

        // 2. Получаем данные топика перед удалением (нужны для логов и названия)
        // Мы уверены, что он существует, благодаря валидации выше
        const topic = await Topic.findById(id);

        // 3. Параллельное или последовательное удаление из сторонних сервисов
        // Сначала удаляем тяжелые данные (S3 и Векторная БД)
        await Promise.all([
            deleteTopicFiles(id),         // Удаляем файлы из Yandex Cloud
            deleteTopicFromQdrant(id)     // Удаляем эмбеддинги из Qdrant
        ]);

        // 4. Удаление основной записи из MongoDB
        await Topic.findByIdAndDelete(id);

        // 5. Логирование действия
        await Log.create({
            action: 'TOPIC_DELETED',
            user: req.user.id,
            entityType: 'Topic',
            entityId: id,
            details: { name: topic.name }
        });

        res.json({ message: 'Топик и связанные данные успешно удалены' });

    } catch (error) {
        console.error('❌ Ошибка в контроллере удаления топика:', error);
        res.status(500).json({ 
            message: 'Ошибка при выполнении операции удаления', 
            error: error.message 
        });
    }
};
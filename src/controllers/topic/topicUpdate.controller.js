const Topic = require('../../models/topic');
const Log = require('../../models/log');
const { processTopicFiles, deleteSingleFileFromS3 } = require('../../services/storage.service');
const { patchTopicSchema } = require('../../schemas/topic.schema');

module.exports = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Подготовка данных
        const bodyForValidation = { ...req.body };
        if (typeof bodyForValidation.metadata === 'string') bodyForValidation.metadata = JSON.parse(bodyForValidation.metadata);
        if (typeof bodyForValidation.filesToDelete === 'string') bodyForValidation.filesToDelete = JSON.parse(bodyForValidation.filesToDelete);
        if (typeof bodyForValidation.files_metadata === 'string') bodyForValidation.files_metadata = JSON.parse(bodyForValidation.files_metadata);

        const validation = await patchTopicSchema.safeParseAsync({
            params: req.params,
            body: bodyForValidation
        });

        if (!validation.success) {
            const formattedErrors = validation.error.issues.reduce((acc, issue) => {
                const path = issue.path.join('.');
                acc[path] = issue.message;
                return acc;
            }, {});

            return res.status(400).json({
                message: "Ошибка валидации данных",
                errors: formattedErrors
            });
        }

        const { name, content, metadata, filesToDelete, files_metadata } = validation.data.body;

        const topic = await Topic.findById(id);
        if (!topic) return res.status(404).json({ message: 'Не найден' });

        // 2. Подготовка операторов обновления
        const updateQuery = { $set: {}, $push: {} };
        const logs = [];

        // 3. Удаление файлов (сразу обновляем БД, чтобы не было конфликтов)
        if (filesToDelete && filesToDelete.length > 0) {
            // Проверка: удаляем только те файлы, что реально принадлежат этому топику
            const currentUrls = topic.files.map(f => f.url);
            const validToDelete = filesToDelete.filter(url => currentUrls.includes(url));

            if (validToDelete.length > 0) {
                validToDelete.forEach(url => deleteSingleFileFromS3(url));
                await Topic.findByIdAndUpdate(id, {
                    $pull: { files: { url: { $in: validToDelete } } }
                });
                logs.push(`удалено файлов: ${validToDelete.length}`);
            }
        }

        // 4. Новые файлы
        if (req.files && req.files.length > 0) {
            const newFiles = await processTopicFiles(req.files, files_metadata || {}, id);
            // Правильное использование $push
            updateQuery.$push.files = { $each: newFiles };
            logs.push(`добавлено файлов: ${newFiles.length}`);
        }

        // 5. Текстовые поля и метаданные
        if (name) updateQuery.$set.name = name;
        if (content) updateQuery.$set.content = content;

        if (metadata) {
            Object.keys(metadata).forEach(key => {
                updateQuery.$set[`metadata.${key}`] = metadata[key];
            });
        }

        // 6. Статус и индексация
        if (name || content) {
            updateQuery.$set.status = 'review';
            updateQuery.$set['vectorData.isIndexed'] = false;
        }

        // Убираем пустые операторы, чтобы Mongo не ругался
        if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;
        if (Object.keys(updateQuery.$push).length === 0) delete updateQuery.$push;

        // 7. Финальное обновление
        const updatedTopic = await Topic.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true, runValidators: true }
        ).populate('metadata.category', 'name');

        // 8. Лог
        await Log.create({
            action: 'TOPIC_PATCHED',
            user: req.user.id,
            entityType: 'Topic',
            entityId: id,
            details: { changes: logs, name: updatedTopic.name }
        });

        res.json(updatedTopic);

    } catch (error) {
        console.error('❌ PATCH Error:', error);
        res.status(500).json({ message: 'Ошибка PATCH', error: error.message });
    }
};
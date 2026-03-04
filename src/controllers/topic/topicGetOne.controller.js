const Topic = require('../../models/topic');
const { getOneTopicSchema } = require('../../schemas/topic.schema');

module.exports = async (req, res) => {
    try {
        // 1. Валидация ID из параметров запроса
        const validation = await getOneTopicSchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            // Используем твой метод формирования плоского объекта ошибок
            const formattedErrors = validation.error.issues.reduce((acc, issue) => {
                const path = issue.path.filter(p => p !== 'params').join('.');
                acc[path] = issue.message;
                return acc;
            }, {});

            return res.status(400).json({
                message: "Некорректные параметры запроса",
                errors: formattedErrors
            });
        }

        const { id } = validation.data.params;

        // 2. Поиск топика со всеми связями
        // Используем .lean() для ускорения, если не планируем вызывать методы модели .save()
        const topic = await Topic.findById(id)
            .populate('metadata.category', 'name')
            .populate('metadata.accessibleByRoles', 'label')
            .lean();

        // 3. Проверка на существование
        if (!topic) {
            return res.status(404).json({ message: 'Топик не найден' });
        }

        // 4. Отправка данных (без проверки ролей, так как на платформе доступ полный)
        res.json(topic);

    } catch (error) {
        console.error(`❌ Ошибка получения топика ${req.params.id}:`, error);
        res.status(500).json({ 
            message: 'Ошибка сервера при получении данных', 
            error: error.message 
        });
    }
};
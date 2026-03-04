const Topic = require('../../models/topic');
const { getTopicsSchema } = require('../../schemas/topic.schema');

module.exports = async (req, res) => {
    try {
        // 1. Валидация и трансформация query-параметров через Zod
        const validation = await getTopicsSchema.safeParseAsync({ query: req.query });
        
        if (!validation.success) {
            const formattedErrors = validation.error.issues.reduce((acc, issue) => {
                const path = issue.path.filter(p => p !== 'query').join('.');
                acc[path] = issue.message;
                return acc;
            }, {});

            return res.status(400).json({
                message: "Ошибка валидации фильтров",
                errors: formattedErrors
            });
        }

        const { page, limit, search, category, status } = validation.data.query;

        // 2. Построение запроса (без учета ролей пользователя платформы)
        const query = {};

        if (category) query['metadata.category'] = category;
        if (status) query.status = status;
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // 3. Параллельное выполнение запроса и подсчета общего количества
        const [topics, count] = await Promise.all([
            Topic.find(query)
                .populate('metadata.category', 'name')
                .populate('metadata.accessibleByRoles', 'label') // Популейт оставляем для отображения в таблицах
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ updatedAt: -1 })
                .lean(),
            Topic.countDocuments(query)
        ]);

        // 4. Ответ с метаданными пагинации
        res.json({ 
            topics, 
            pagination: {
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });

    } catch (error) {
        console.error('❌ Ошибка получения списка топиков:', error);
        res.status(500).json({ 
            message: 'Ошибка сервера при получении списка', 
            error: error.message 
        });
    }
};
const TopicCategory = require('../../models/topicCategory');
const { getAllCategoriesSchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');

module.exports = async (req, res) => {
    try {
        const validation = await getAllCategoriesSchema.safeParseAsync({ query: req.query });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Некорректные параметры запроса',
                validation.error.issues.map(err => ({
                    path: err.path.filter(p => p !== 'query').join('.'),
                    message: err.message
                }))
            );
        }

        const { search, page, limit } = validation.data.query;

        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            TopicCategory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            TopicCategory.countDocuments(filter)
        ]);

        return successHandler(res, 200, 'Список категорий получен', {
            categories,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при получении списка категорий', [{ path: 'server', message: error.message }]);
    }
};
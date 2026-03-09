const TopicCategory = require('../../models/topicCategory');
const { getOneCategorySchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');

module.exports = async (req, res) => {
    try {
        const validation = await getOneCategorySchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Некорректный идентификатор роли',
                validation.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            );
        }

        const { id } = validation.data.params;
        const category = await TopicCategory.findById(id);

        if (!category) {
            return errorHandler(res, 404, 'Категория не найдена');
        }

        return successHandler(res, 200, 'Категория получена', category);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при получении категории', [{ path: 'server', message: error.message }]);
    }
};
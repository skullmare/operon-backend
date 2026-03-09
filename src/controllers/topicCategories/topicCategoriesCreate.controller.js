const TopicCategory = require('../../models/topicCategory');
const { createCategorySchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await createCategorySchema.safeParseAsync({ body: req.body });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Ошибка валидации при создании категории',
                validation.error.issues.map(err => ({
                    path: err.path.filter(p => p !== 'body').join('.'),
                    message: err.message
                }))
            );
        }

        const { body: data } = validation.data;
        const newCategory = await TopicCategory.create(data);

        await logHandler({
            action: ACTIONS_CONFIG.TOPIC_CATEGORIES.actions.CREATE.key,
            message: `Создана новая категория: ${newCategory.name}`,
            userId: currentUserId,
            entityId: newCategory._id,
            status: 'success'
        });

        return successHandler(res, 201, 'Категория успешно создана', newCategory);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при создании категории', [{ path: 'server', message: error.message }]);
    }
};
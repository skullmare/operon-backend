const TopicCategory = require('../../models/topicCategory');
const { deleteCategorySchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await deleteCategorySchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Не удалось удалить категорию',
                validation.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            );
        }

        const { id } = validation.data.params;
        const category = await TopicCategory.findById(id);
        
        await TopicCategory.findByIdAndDelete(id);

        await logHandler({
            action: ACTIONS_CONFIG.TOPIC_CATEGORIES.actions.DELETE.key,
            message: `Удалена категория: ${category.name}`,
            userId: currentUserId,
            entityId: id,
            status: 'success'
        });

        return successHandler(res, 200, 'Категория успешно удалена');

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при удалении категории', [{ path: 'server', message: error.message }]);
    }
};
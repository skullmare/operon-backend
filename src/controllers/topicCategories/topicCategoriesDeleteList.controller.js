const TopicCategory = require('../../models/topicCategory');
const { deleteCategoryListSchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await deleteCategoryListSchema.safeParseAsync({ body: req.body });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Ошибка при массовом удалении категорий',
                validation.error.issues.map(err => ({
                    path: err.path.filter(p => p !== 'body').join('.'),
                    message: err.message
                }))
            );
        }

        const { ids } = validation.data.body;
        console.log(ids)
        await TopicCategory.deleteMany({ _id: { $in: ids } });

        await logHandler({
            action: ACTIONS_CONFIG.TOPIC_CATEGORIES.actions.DELETE.key, // Можно использовать общую метку DELETE
            message: `Массовое удаление категорий. Количество: ${ids.length}`,
            userId: currentUserId,
            status: 'success'
        });

        return successHandler(res, 200, `Успешно удалено категорий: ${ids.length}`);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при массовом удалении', [{ path: 'server', message: error.message }]);
    }
};
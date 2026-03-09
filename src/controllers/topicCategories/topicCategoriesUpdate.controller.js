const TopicCategory = require('../../models/topicCategory');
const { updateCategorySchema } = require('../../schemas/topicCategory.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await updateCategorySchema.safeParseAsync({ 
            params: req.params, 
            body: req.body 
        });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Ошибка валидации при обновлении категории',
                validation.error.issues.map(err => ({
                    path: err.path.filter(p => p !== 'body' && p !== 'params').join('.'),
                    message: err.message
                }))
            );
        }

        const { params: { id }, body: data } = validation.data;

        const updatedCategory = await TopicCategory.findByIdAndUpdate(
            id,
            { $set: data },
            { returnDocument: 'after' }
        );

        await logHandler({
            action: ACTIONS_CONFIG.TOPIC_CATEGORIES.actions.UPDATE.key,
            message: `Обновлена категория: ${updatedCategory.name}`,
            userId: currentUserId,
            entityId: updatedCategory._id,
            status: 'success'
        });

        return successHandler(res, 200, 'Категория успешно обновлена', updatedCategory);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при обновлении категории', [{ path: 'server', message: error.message }]);
    }
};
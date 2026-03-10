const TopicCategory = require('../../models/topicCategory');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;
    const data = req.validatedData.body;

    try {
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
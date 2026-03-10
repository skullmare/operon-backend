const Role = require('../../models/platformRole');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;
    const data = req.validatedData.body;

    try {

        const newRole = await Role.create(data);

        await logHandler({
            action: ACTIONS_CONFIG.PLATFORM_ROLES.actions.CREATE.key,
            message: `Создана новая роль: ${newRole.name}`,
            userId: currentUserId,
            entityId: newRole._id,
            status: 'success'
        });

        return successHandler(res, 201, 'Роль успешно создана', newRole);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при создании роли', [{ path: 'server', message: error.message }]);
    }
};
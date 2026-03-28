const Role = require('../../models/platform-role');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');
const logHandler = require('../../utils/log-handler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;
    const { params, body } = req.validatedData;

    try {

        const updatedRole = await Role.findByIdAndUpdate(
            params.id,
            { $set: body },
            { returnDocument: 'after' }
        );

        await logHandler({
            action: ACTIONS_CONFIG.PLATFORM_ROLES.actions.UPDATE.key,
            message: `Обновлена роль: ${updatedRole.name}`,
            userId: currentUserId,
            entityId: updatedRole._id,
            status: 'success'
        });

        return successHandler(res, 200, 'Роль успешно обновлена', updatedRole);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при обновлении роли', [{ path: 'server', message: error.message }]);
    }
};
const Role = require('../../models/platformRole');
const { updateRoleSchema } = require('../../schemas/platformRole.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await updateRoleSchema.safeParseAsync({ 
            params: req.params, 
            body: req.body 
        });

        if (!validation.success) {
            return errorHandler(
                res, 
                400, 
                'Ошибка валидации при обновлении роли', 
                validation.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            );
        }

        const { params, body } = validation.data;

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
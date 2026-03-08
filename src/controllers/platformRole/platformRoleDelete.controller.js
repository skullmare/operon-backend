const Role = require('../../models/platformRole');
const { deleteRoleSchema } = require('../../schemas/platformRole.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await deleteRoleSchema.safeParseAsync({ params: req.params });

        if (!validation.success) {
            return errorHandler(
                res, 
                400, 
                'Удаление невозможно', 
                validation.error.issues.map(err => ({ path: 'id', message: err.message }))
            );
        }

        const { id } = validation.data.params;
        const role = await Role.findByIdAndDelete(id);

        await logHandler({
            action: ACTIONS_CONFIG.PLATFORM_ROLES.actions.DELETE.key,
            message: `Удалена роль: ${role.name}`,
            userId: currentUserId,
            entityId: id,
            status: 'success'
        });

        return successHandler(res, 200, 'Роль успешно удалена', role);

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при удалении роли', [{ path: 'server', message: error.message }]);
    }
};
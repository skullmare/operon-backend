const Role = require('../../models/platformRole');
const { deleteRoleListSchema } = require('../../schemas/platformRole.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await deleteRoleListSchema.safeParseAsync({ body: req.body });

        if (!validation.success) {
            return errorHandler(res, 400, 'Ошибка при массовом удалении', 
                validation.error.issues.map(err => ({ path: 'ids', message: err.message }))
            );
        }

        const { ids } = validation.data.body;

        const result = await Role.deleteMany({ _id: { $in: ids } });

        await logHandler({
            action: ACTIONS_CONFIG.PLATFORM_ROLES.actions.DELETE_MANY.key,
            message: `Успешно удалено ролей: ${result.deletedCount}`,
            userId: currentUserId,
            status: 'success'
        });

        return successHandler(res, 200, 'Роли успешно удалены', { count: result.deletedCount });

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера', [{ path: 'server', message: error.message }]);
    }
};
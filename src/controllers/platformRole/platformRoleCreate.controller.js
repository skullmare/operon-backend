const Role = require('../../models/platformRole'); // Предполагаемое имя модели
const { createRoleSchema } = require('../../schemas/platformRole.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentUserId = req.user?.id;

    try {
        const validation = await createRoleSchema.safeParseAsync({ body: req.body });

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Ошибка валидации при создании роли',
                validation.error.issues.map(err => ({
                    path: err.path.filter(p => p !== 'body').join('.'),
                    message: err.message
                }))
            );
        }

        const { body: data } = validation.data;

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
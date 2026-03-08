const Role = require('../../models/platformRole'); // Убедитесь, что путь и название модели верны
const { getOneRoleSchema } = require('../../schemas/platformRole.schema');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');

module.exports = async (req, res) => {
    try {
        // 1. Валидация ID из параметров запроса (params.id)
        const validation = await getOneRoleSchema.safeParseAsync({ 
            params: req.params 
        });

        if (!validation.success) {
            return errorHandler(
                res, 
                400, 
                'Некорректный идентификатор роли', 
                validation.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            );
        }

        const { id } = validation.data.params;

        // 2. Поиск роли в БД
        const role = await Role.findById(id);

        if (!role) {
            return errorHandler(
                res, 
                404, 
                'Роль не найдена', 
                [{ path: 'id', message: `Роль с ID ${id} отсутствует в системе` }]
            );
        }

        // 3. Успешный ответ
        return successHandler(res, 200, 'Данные роли получены', role);

    } catch (error) {
        // Логирование ошибки сервера (опционально, можно добавить logHandler)
        return errorHandler(
            res, 
            500, 
            'Ошибка сервера при получении данных роли', 
            [{ path: 'server', message: error.message }]
        );
    }
};
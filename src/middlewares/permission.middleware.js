const User = require('../models/platformUser');
const errorHandler = require('../utils/errorHandler'); // Импорт утилиты

const checkPermission = (required) => {
    return async (req, res, next) => {
        try {
            const requiredArray = Array.isArray(required) ? required : [required];

            // Senior tip: Мы уже имеем данные в req.user. Если нужно актуальное состояние из БД:
            const user = await User.findById(req.user.id).populate('role').lean();
            
            if (!user?.role?.permissions) {
                return errorHandler(
                    res, 
                    403, 
                    'Доступ запрещен', 
                    [{ path: 'role', message: 'Роль или права пользователя не определены' }]
                );
            }

            const hasAll = requiredArray.every(p => user.role.permissions.includes(p));

            if (!hasAll) {
                return errorHandler(
                    res, 
                    403, 
                    'Недостаточно прав', 
                    [{ 
                        path: 'permissions', 
                        message: `Требуются права: ${requiredArray.join(', ')}` 
                    }]
                );
            }

            next();
        } catch (error) {
            // Обработка непредвиденных ошибок (БД, сеть и т.д.)
            return errorHandler(
                res, 
                500, 
                'Ошибка проверки прав', 
                [{ path: 'server', message: error.message }]
            );
        }
    };
};

module.exports = checkPermission;
// middlewares/permission.middleware.js
const User = require('../models/platformUser');

const checkPermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            // Превращаем в массив, если пришла одна строка
            const permissionsArray = Array.isArray(requiredPermissions) 
                ? requiredPermissions 
                : [requiredPermissions];

            const user = await User.findById(req.user.id).populate('role');
            
            if (!user || !user.role) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            // Проверяем: есть ли у юзера хотя бы одно из требуемых прав?
            const hasPermission = permissionsArray.some(p => 
                user.role.permissions.includes(p)
            );

            if (!hasPermission) {
                return res.status(403).json({ 
                    message: `Недостаточно прав. Требуется одно из: ${permissionsArray.join(', ')}` 
                });
            }

            next();
        } catch (e) {
            res.status(500).json({ message: 'Ошибка авторизации' });
        }
    };
};

module.exports = checkPermission;
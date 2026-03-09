const User = require('../../models/platformUser');
const { changePasswordSchema } = require('../../schemas/password.schema');
const { comparePassword, hashPassword } = require('../../utils/passwordHandler');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const userId = req.user?.id;

    try {
        // 1. Валидация входных данных (Zod проверит совпадение new и confirm)
        const validation = await changePasswordSchema.safeParseAsync(req.body);

        if (!validation.success) {
            return errorHandler(
                res,
                400,
                'Ошибка валидации',
                validation.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            );
        }

        const { oldPassword, newPassword } = validation.data;

        // 2. Поиск пользователя (обязательно .select('+password'))
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return errorHandler(res, 404, 'Пользователь не найден');
        }

        // 3. Проверка старого пароля через ваш хэндлер
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return errorHandler(res, 401, 'Неверный текущий пароль', [
                { path: 'oldPassword', message: 'Текущий пароль введен неверно' }
            ]);
        }

        // 4. Хеширование нового пароля и обновление
        const hashedNewPassword = await hashPassword(newPassword);
        
        // Используем findByIdAndUpdate, чтобы не затриггерить лишние pre-save middleware, 
        // если они у вас настроены на другие поля
        await User.findByIdAndUpdate(userId, { 
            $set: { password: hashedNewPassword } 
        });

        // 5. Логирование
        await logHandler({
            action: ACTIONS_CONFIG.PASSWORD.actions.PASSWORD_CHANGE.key,
            message: `Пользователь успешно сменил пароль`,
            userId,
            entityId: userId,
            status: 'success'
        });

        return successHandler(res, 200, 'Пароль успешно изменен');

    } catch (error) {
        await logHandler({
            action: ACTIONS_CONFIG.PROFILE.actions.SERVER_ERROR.key,
            message: `Критическая ошибка при смене пароля: ${error.message}`,
            userId,
            status: 'error'
        });

        return errorHandler(res, 500, 'Ошибка сервера', [
            { path: 'server', message: error.message }
        ]);
    }
};
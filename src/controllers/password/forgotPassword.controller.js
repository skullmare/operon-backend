const crypto = require('crypto');
const User = require('../../models/platformUser');
const { forgotPasswordSchema } = require('../../schemas/password.schema'); // Новая схема
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');
const passwordResetTemplate = require('../../utils/templates/passwordReset');
const sendEmail = require("../../services/email.service");

module.exports = async (req, res) => {
    try {
        // 1. Асинхронная валидация (проверяет формат и наличие пользователя в БД)
        const validation = await forgotPasswordSchema.safeParseAsync(req.body);

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

        const { email } = validation.data;

        // 2. Получаем пользователя (он гарантированно есть после валидации Zod)
        const user = await User.findOne({ email });

        // 3. Генерация токена сброса
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Хешируем токен для безопасного хранения в БД
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 4. Сохраняем хешированный токен и срок его жизни (1 час)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        // Сохраняем без запуска валидации всей схемы (так как пароль сейчас отсутствует в select)
        await user.save({ validateBeforeSave: false });

        const resetUrl = new URL(resetToken, process.env.RESET_PASSWORD_URL.replace(/\/?$/, '/')).href;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Восстановление пароля - Operon',
                html: passwordResetTemplate(resetUrl)
            });
        } catch (err) {
            // В случае ошибки с почтой, откатываем изменения в базе
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return errorHandler(res, 500, 'Не удалось отправить письмо', [{ path: 'email', message: err.message }]);
        }

        // 6. Логирование запроса
        await logHandler({
            action: ACTIONS_CONFIG.PASSWORD.actions.PASSWORD_RESET_REQUEST.key,
            message: `Запрошен сброс пароля для ${email}`,
            userId: user._id,
            status: 'success'
        });

        // Формируем объект данных для ответа
        const responseData = {};
        
        // Возвращаем токен в теле ответа только при разработке для удобства тестирования (Postman)
        if (process.env.NODE_ENV === 'development') {
            responseData.token = resetToken;
        }

        return successHandler(
            res, 
            200, 
            'Инструкции отправлены на почту', 
            responseData
        );

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка при запросе сброса пароля', [
            { path: 'server', message: error.message }
        ]);
    }
};
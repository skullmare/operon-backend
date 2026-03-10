const crypto = require('crypto');
const User = require('../../models/platformUser');
const { resetPasswordSchema } = require('../../schemas/password.schema');
const { hashPassword } = require('../../utils/passwordHandler');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const { token } = req.validatedData.params;
    const { password } = req.validatedData.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return errorHandler(res, 400, 'Ссылка недействительна или срок её действия истек', [{path: "token", message: "Некорректный токен"}]);
        }

        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        await logHandler({
            action: ACTIONS_CONFIG.PASSWORD.actions.PASSWORD_RESET_SUCCESS.key,
            message: `Пароль для ${user.email} успешно сброшен по токену`,
            userId: user._id,
            status: 'success'
        });

        return successHandler(res, 200, 'Пароль успешно изменен');

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера', [{ path: 'server', message: error.message }]);
    }
};
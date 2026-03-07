const User = require('../../models/platformUser');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('role');
        
        if (!user) {
            return errorHandler(res, 404, 'Пользователь не найден', [
                { path: 'id', message: 'Профиль не существует' }
            ]);
        }

        return successHandler(res, 200, 'Данные профиля получены', user);

    } catch (error) {
        await logHandler({
            action: ACTIONS_CONFIG.AUTH.actions.SERVER_ERROR.key,
            message: `Ошибка получения профиля: ${error.message}`,
            userId: req.user?.id,
            status: 'error'
        });

        return errorHandler(res, 500, 'Ошибка сервера', [
            { path: 'server', message: error.message }
        ]);
    }
};
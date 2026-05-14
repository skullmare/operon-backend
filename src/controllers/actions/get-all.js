const { getActionsForUI } = require('../../constants/actions');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');
module.exports = async (req, res) => {
    try {
        return successHandler(res, 200, 'Список событий получен', getActionsForUI());
    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при получении событий', [{ path: 'server', message: error.message }]);
    }
};
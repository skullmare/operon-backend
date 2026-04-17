const { getPermissionsForUI } = require('../../constants/permissions');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');
module.exports = async (req, res) => {
    try {
        return successHandler(res, 200, 'Список прав получен', getPermissionsForUI());
    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при получении прав', [{ path: 'server', message: error.message }]);
    }
};
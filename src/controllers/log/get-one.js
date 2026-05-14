const Log = require('../../models/log');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');
const { ACTION_LABEL_MAP, ACTION_GROUP_LABEL_MAP } = require('../../constants/actions');

module.exports = async (req, res) => {
    const { id } = req.validatedData.params;

    try {
        const log = await Log.findById(id)
            .populate('user', 'login firstName lastName email')
            .lean();

        if (!log) {
            return errorHandler(
                res,
                404,
                'Запись лога не найдена',
                [{ path: 'id', message: `Лог с ID ${id} отсутствует в базе` }]
            );
        }

        const localizedLog = {
            ...log,
            actionLabel: ACTION_LABEL_MAP[log.action] ?? log.action,
            entityTypeLabel: ACTION_GROUP_LABEL_MAP[log.action] ?? log.entityType,
        };

        return successHandler(
            res,
            200,
            'Детальная информация о логе получена',
            localizedLog
        );

    } catch (error) {
        return errorHandler(
            res,
            500,
            'Ошибка сервера при получении лога',
            [{ path: 'server', message: error.message }]
        );
    }
};
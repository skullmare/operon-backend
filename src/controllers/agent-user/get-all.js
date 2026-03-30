const AgentUser = require('../../models/agent-user');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');
const logHandler = require('../../utils/log-handler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const currentPlatformUserId = req.user?.id;
    const { page, limit, search, role, status, hasPhone } = req.validatedData.query;

    try {
        const filter = {};

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { chatId: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            filter.role = role;
        }

        if (status) {
            filter.status = status;
        }

        if (hasPhone !== undefined) {
            if (hasPhone) {
                filter.phone = { $exists: true, $ne: null, $ne: '' };
            } else {
                filter.phone = { $exists: false, $eq: null };
            }
        }

        const skip = (page - 1) * limit;

        const [agentUsers, totalCount] = await Promise.all([
            AgentUser.find(filter)
                .populate('role', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            AgentUser.countDocuments(filter)
        ]);

        await logHandler({
            action: ACTIONS_CONFIG.AGENT_USERS.actions.READ.key,
            message: `Получен список агентов`,
            userId: currentPlatformUserId,
            status: 'success'
        });

        const responseData = {
            items: agentUsers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };

        return successHandler(res, 200, 'Список агентов успешно получен', responseData);

    } catch (error) {
        await logHandler({
            action: ACTIONS_CONFIG.AGENT_USERS.actions.SERVER_ERROR.key,
            message: `Ошибка при получении списка агентов: ${error.message}`,
            userId: currentPlatformUserId,
            status: 'error'
        });

        return errorHandler(
            res,
            500,
            'Ошибка сервера при получении списка агентов',
            [{ path: 'server', message: error.message }]
        );
    }
};
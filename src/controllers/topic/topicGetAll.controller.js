const Topic = require('../../models/topic');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');
const logHandler = require('../../utils/logHandler');
const { ACTIONS_CONFIG } = require('../../constants/actions');

module.exports = async (req, res) => {
    const userId = req.user?.id;
    const { page, limit, search, category, status } = req.validatedData.query;

    try {
        const filter = {};
        if (category) filter['metadata.category'] = category;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const [result, total] = await Promise.all([
            Topic.find(filter)
                .populate('metadata.category', 'name')
                .populate('metadata.accessibleByRoles', 'name')
                .populate('createdBy', 'firstName lastName photoUrl')
                .populate('updatedBy', 'firstName lastName photoUrl')
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ updatedAt: -1 })
                .lean(),
            Topic.countDocuments(filter)
        ]);

        const pagination = {
            total,
            pages: Math.ceil(total / limit),
            current: page,
            limit
        };

        return successHandler(res, 200, 'Список тем успешно получен', result, pagination);

    } catch (error) {
        await logHandler({
            action: ACTIONS_CONFIG.TOPICS.actions.SERVER_ERROR.key,
            message: `Ошибка при получении списка тем: ${error.message}`,
            userId,
            status: 'error'
        });

        return errorHandler(
            res,
            500,
            'Ошибка сервера при получении списка тем',
            [{ path: 'server', message: error.message }]
        );
    }
};
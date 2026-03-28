const Role = require('../../models/platform-role');
const successHandler = require('../../utils/success-handler');
const errorHandler = require('../../utils/error-handler');

module.exports = async (req, res) => {
    const { search, isSystem, page, limit } = req.validatedData.query;

    try {
        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (typeof isSystem === 'boolean') {
            filter.isSystem = isSystem;
        }

        const skip = (page - 1) * limit;

        const [roles, total] = await Promise.all([
            Role.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
            Role.countDocuments(filter)
        ]);

        return successHandler(res, 200, 'Список ролей получен', {
            roles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        return errorHandler(res, 500, 'Ошибка сервера при получении ролей', [{ path: 'server', message: error.message }]);
    }
};
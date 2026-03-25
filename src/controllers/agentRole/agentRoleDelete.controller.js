const AgentRole = require('../../models/agentRole');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');

module.exports = async (req, res) => {
    const { id } = req.validatedData.params;

    try {
        const deletedRole = await AgentRole.findByIdAndDelete(id).lean();

        return successHandler(
            res,
            200,
            `Роль агента "${deletedRole.name}" успешно удалена`,
            { id }
        );

    } catch (error) {
        return errorHandler(
            res,
            500,
            'Ошибка сервера при удалении роли агента',
            [{ path: 'server', message: error.message }]
        );
    }
};
const AgentRole = require('../../models/agentRole');
const successHandler = require('../../utils/successHandler');
const errorHandler = require('../../utils/errorHandler');

module.exports = async (req, res) => {
    const { name, description } = req.validatedData.body;

    try {
        const newRole = await AgentRole.create({
            name,
            description
        });

        return successHandler(
            res, 
            201, 
            `Роль агента "${name}" успешно создана`, 
            newRole
        );

    } catch (error) {
        return errorHandler(
            res, 
            500, 
            'Ошибка сервера при создании роли агента', 
            [{ path: 'server', message: error.message }]
        );
    }
};
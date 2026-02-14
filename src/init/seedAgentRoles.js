const AgentRole = require('../models/agentRole');

const seedAgentRoles = async () => {
    const roles = [
        { label: 'Заказчик', key: 'client', description: 'Роль для доступа к ИИ агенту от имени заказчика' },
        { label: 'Партнер', key: 'partner', description: 'Роль для доступа к ИИ агенту от имени партнера' }
    ];

    try {
        for (const role of roles) {
            await AgentRole.findOneAndUpdate(
                { key: role.key },
                {
                    label: role.label,
                    description: role.description
                },
                { upsert: true, returnDocument: 'after', runValidators: true }
            );
        }
        console.log('✅ Инициализация базовых ролей для доступа к ИИ агенту успешно завершена');
    } catch (error) {
        console.error('❌ Ошибка при инициализации базовых ролей для доступа к ИИ агенту:', error);
    }
};

module.exports = { seedAgentRoles };
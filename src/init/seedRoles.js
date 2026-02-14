const Role = require('../models/role'); 
const { ALL_PERMISSIONS } = require('../constants/permissions');

const seedRoles = async () => {
    try {
        // Обновляем админа или создаем, если его нет
        await Role.findOneAndUpdate(
            { name: 'SuperAdmin' },
            {
                permissions: ALL_PERMISSIONS,
                isSystem: true,
                description: 'Полный доступ ко всем функциям системы'
            },
            { upsert: true, returnDocument: 'after' }
        );
        console.log('✅ Инициализация ролей успешно завершена');
    } catch (error) {
        console.error('❌ Ошибка при заполнении ролей:', error);
    }
};

module.exports = { seedRoles };
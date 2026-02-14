const Role = require('../models/platformRole'); 
const { ALL_PERMISSIONS } = require('../constants/permissions');

const seedRoles = async () => {
    try {
        // Обновляем админа или создаем, если его нет
        await Role.findOneAndUpdate(
            { key: 'superadmin' }, // Ищем по уникальному ключу 'key'
            {
                label: 'Системный администратор', // Название для отображения
                permissions: ALL_PERMISSIONS,
                isSystem: true,
                description: 'Полный доступ ко всем функциям системы'
            },
            { 
                upsert: true, 
                returnDocument: 'after',
                runValidators: true // Проверка соответствия схеме при вставке
            }
        );
        
        console.log('✅ Инициализация системных ролей для управления платформой успешно завершена');
    } catch (error) {
        // Выводим только сообщение, чтобы не загромождать лог стеком при ошибке схемы
        console.error('❌ Ошибка при инициализации системных ролей для управления платформой:', error.message);
    }
};

module.exports = { seedRoles };
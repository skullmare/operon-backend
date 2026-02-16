require('dotenv').config(); // Загружаем переменные окружения
const User = require('../models/platformUser');
const Role = require('../models/platformRole');
const bcrypt = require('bcryptjs');

const login = process.env.LOGIN_SUPER_ADMIN;
const password = process.env.PASSWORD_SUPER_ADMIN;

const seedSuperAdmin = async () => {
    try {
        // 1. Находим системную роль
        const adminRole = await Role.findOne({ key: 'superadmin' });

        if (!adminRole) {
            console.error('❌ Ошибка: Роль "superadmin" не найдена. Сначала запустите seedRoles!');
            return;
        }

        // 2. Проверяем, существует ли уже админ
        const adminExists = await User.findOne({ login: login });

        if (adminExists) {
            console.log('ℹ️  Аккаунт системного администратора уже существует, пропуск создания');
            return;
        }

        // 3. Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Создаем пользователя
        const superAdmin = new User({
            firstName: 'System',
            lastName: 'Administrator',
            login: 'admin',
            email: '',
            password: hashedPassword,
            role: adminRole._id, // Привязываем ID роли
            status: 'active'
        });

        await superAdmin.save();
        console.log(`✅ Инициализация аккаунта системного администратора успешно завершена (Логин: ${login} / Пароль: ${password})`);

    } catch (error) {
        console.error('❌ Ошибка при инициализации аккаунта системного администратора:', error.message);
    }
};

module.exports = { seedSuperAdmin };
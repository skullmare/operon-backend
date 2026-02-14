// server.js
require('dotenv').config(); // Загружаем переменные окружения
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./config/database');
const { seedRoles } = require('./src/init/seedRoles');

const PORT = process.env.PORT || 3000;
let server;

// Запуск сервера ПОСЛЕ подключения к БД
const startServer = async () => {
  try {
    // 1. Сначала подключаемся к БД
    await connectDB();
    // 2. Проверяем системные записи в базе данных
    await seedRoles();
    // 3. Потом запускаем сервер
    server = app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📥 Получен сигнал ${signal}`);

  if (server) {
    // Перестаем принимать новые запросы
    server.close(() => {
      console.log('🚫 Сервер остановлен');
    });
  }

  // Закрываем соединение с БД
  await disconnectDB();

  console.log('✅ Приложение остановлено');
  process.exit(0);
};

// Обработчики сигналов
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запускаем приложение
startServer();
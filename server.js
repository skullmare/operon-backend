
require('dotenv').config();
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./config/mongo');
const { seedRoles } = require('./src/init/seedRoles');
const { seedAgentRoles } = require('./src/init/seedAgentRoles');
const { seedSuperAdmin } = require('./src/init/seedSuperAdmin');
const { seedSystemSettings } = require('./src/init/seedSystemSettings');
const { seedTopicCategories } = require('./src/init/seedTopicCategories');
const { initQdrant } = require('./src/init/initQdrant');

const PORT = process.env.PORT || 3000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    await seedRoles();
    await seedAgentRoles();
    await seedSystemSettings();
    await seedTopicCategories();
    await seedSuperAdmin();
    await initQdrant();
    server = app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n📥 Получен сигнал ${signal}`);

  if (server) {
    server.close(() => {
      console.log('🚫 Сервер остановлен');
    });
  }

  await disconnectDB();

  console.log('✅ Приложение остановлено');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    });

    console.log(`✅ MongoDB подключена: ${conn.connection.host}`);
    console.log(`📦 База данных: ${conn.connection.name}`);
    
    // Слушаем события подключения
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB отключена');
    });

    return conn;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1); // Завершаем процесс при ошибке подключения
  }
};

// Функция для закрытия подключения (для graceful shutdown)
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB соединение закрыто');
  } catch (error) {
    console.error('❌ Ошибка при закрытии MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
    });
    console.log(`📦 База данных ${conn.connection.name} успешно подключена (адрес сервера: ${conn.connection.host}:${conn.connection.port})`);
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка подключения к базе данных MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB отключена');
    });

    return conn;
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных MongoDB:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB соединение закрыто');
  } catch (error) {
    console.error('❌ Ошибка при закрытии базы данных MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
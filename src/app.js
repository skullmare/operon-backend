// src/app.js
const express = require('express');
const app = express();

// ==================== MIDDLEWARE ====================
// Для парсинга JSON из тела запроса
app.use(express.json());

// Для парсинга данных из форм (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Health check для мониторинга
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Роуты API
const apiRoutes = require('./routes/user.routes');
app.use('/api/v1/user', apiRoutes);

// ==================== ОБРАБОТКА ОШИБОК ====================
// 404 - Роут не найден
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Маршрут ${req.method} ${req.url} не найден`
  });
});

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';
  
  res.status(status).json({
    status: status,
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
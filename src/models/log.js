const mongoose = require('mongoose');

// Определяем схему
const logSchema = new mongoose.Schema({

}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Создаем модель
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
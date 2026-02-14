const mongoose = require('mongoose');

// Определяем схему
const topicSchema = new mongoose.Schema({

}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Создаем модель
const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
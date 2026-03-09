const mongoose = require('mongoose');

const topicCategorySchema = new mongoose.Schema({
  // Название (например: "Техническая поддержка", "HR", "Продажи")
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Краткое описание, чтобы контент-менеджер не путался
  description: {
    type: String,
    trim: true
  },
}, {
  timestamps: true // Оставляем, чтобы знать, когда категория создана
});

const TopicCategory = mongoose.model('TopicCategory', topicCategorySchema);
module.exports = TopicCategory;
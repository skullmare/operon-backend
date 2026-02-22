const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true 
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'archived'],
    default: 'draft',
    index: true 
  },
  files: [{
    description: { type: String, trim: true },
    url: { type: String, required: true },
    fileType: { type: String } 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vectorData: {
    isIndexed: { type: Boolean, default: false },
    lastIndexedAt: { type: Date }
    // chunkIds не храним, чистим в Qdrant по metadata.topicId
  },
  metadata: {
    // Единственная категория для четкой классификации
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TopicCategory',
      required: true,
      index: true
    },
    // Роли для фильтрации доступа в векторной базе
    accessibleByRoles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgentRole',
      required: true // Важно для безопасности корпоративного консультанта
    }]
  }
}, {
  timestamps: true 
});

// Индекс для поиска в админке
topicSchema.index({ name: 'text', content: 'text' });

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;
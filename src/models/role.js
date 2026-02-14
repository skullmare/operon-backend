const mongoose = require('mongoose');
const { ALL_PERMISSIONS } = require('../constants/permissions');

const roleSchema = new mongoose.Schema({
  // Название: "Супервайзер", "Оператор", "Техподдержка"
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },

  // Массив ключей из вашего конфига
  permissions: [{
    type: String,
    enum: ALL_PERMISSIONS
  }],

  // Описание, чтобы админ понимал, зачем эта роль нужна
  description: {
    type: String,
    trim: true
  },

  // Защита: системные роли нельзя удалять через API
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true 
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
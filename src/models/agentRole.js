const mongoose = require('mongoose');

const agentRoleSchema = new mongoose.Schema({
  // Название на русском
  label: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  // Название на английском
  key: {
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  // Описание, чтобы админ понимал, зачем эта роль нужна
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true 
});

const AgentRole = mongoose.model('AgentRole', agentRoleSchema);
module.exports = AgentRole;
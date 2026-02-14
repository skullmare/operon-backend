const mongoose = require('mongoose');

const agentUserSchema = new mongoose.Schema({
    firstName: String,
    lastname: String,
    createdAt: {},
    phone: {},
    chatId: {},
    requestsCount: {},
    role: {},
    status: {}
}, {
    timestamps: true
});

const AgentUser = mongoose.model('AgentUser', agentUserSchema);
module.exports = AgentUser;
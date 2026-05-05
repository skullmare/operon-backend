const mongoose = require('mongoose');

const agentUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    chatId: {
        type: String,
        required: true,
        index: true
    },
    messenger: {
        type: String,
        enum: ['telegram', 'max'],
        default: 'telegram'
    },
    requestsCount: {
        type: Number,
        default: 0
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgentRole',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'blocked', 'pending'],
        default: 'pending'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

agentUserSchema.index({ chatId: 1, messenger: 1 }, { unique: true });

agentUserSchema.virtual('fullName').get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

const AgentUser = mongoose.model('AgentUser', agentUserSchema);
module.exports = AgentUser;
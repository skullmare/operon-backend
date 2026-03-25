const mongoose = require('mongoose');
const { ALL_ACTIONS, ACTIONS_CONFIG } = require('../constants/actions');

const ALL_ENTITIES = [...new Set(Object.values(ACTIONS_CONFIG).map(group => group.entity))];

const logSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ALL_ACTIONS,
        index: true
    },
    message: {
        type: String,
        required: true 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    entityType: {
        type: String,
        required: true,
        enum: ALL_ENTITIES,
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    status: {
        type: String,
        enum: ['success', 'error'],
        default: 'success'
    }
}, {
    timestamps: true 
});

logSchema.index({ entityType: 1, entityId: 1 });

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
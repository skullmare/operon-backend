const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    value: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    group: {
        type: String,
        enum: ['ai', 'logs', 'general', 'security'],
        default: 'general'
    },
    description: { 
        type: String, 
        trim: true 
    }
}, { 
    timestamps: true 
});

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
module.exports = SystemSetting;
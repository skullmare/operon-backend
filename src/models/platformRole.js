const mongoose = require('mongoose');
const { ALL_PERMISSIONS } = require('../constants/permissions');

const roleSchema = new mongoose.Schema({
    // Название: "Администратор", "Оператор"
    label: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Название на английском: "Admin", "Manager"
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Массив ключей из конфига
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
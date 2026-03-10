const mongoose = require('mongoose');
const { ALL_PERMISSIONS } = require('../constants/permissions');

const roleSchema = new mongoose.Schema({
    // Название: "Администратор", "Оператор"
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Массив ключей из конфига
    permissions: {
        type: [String],
        enum: ALL_PERMISSIONS,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Список прав не может быть пустым'
        }
    },

    // Описание, чтобы админ понимал, зачем эта роль нужна
    description: {
        type: String,
        required: true,
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
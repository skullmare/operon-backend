const mongoose = require('mongoose');
const { ALL_PERMISSIONS } = require('../constants/permissions');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
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
    description: {
        type: String,
        required: true,
        trim: true
    },
    isSystem: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
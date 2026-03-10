const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    photoUrl: {
        type: String,
        default: ''
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    // --- ПОЛЯ ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ ---
    resetPasswordToken: {
        type: String,
        select: false // Скрываем из обычных запросов
    },
    resetPasswordExpires: {
        type: Date,
        select: false // Скрываем из обычных запросов
    }
}, {
    timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: { // Исправлен регистр
        type: String,
        required: true,
        trim: true
    },
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true // Логин всегда в нижнем регистре
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Позволяет иметь null, если email не обязателен, но проверяет уникальность если он есть
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email']
    },
    password: {
        type: String,
        required: true,
        select: false // Пароль не будет возвращаться в обычных запросах (безопасность!)
    },
    photoUrl: {
        type: String,
        default: ''
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', // Связь с моделью Role
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    }
}, {
    // timestamps автоматически создаст createdAt и updatedAt
    timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;
const mongoose = require('mongoose');

const platformUserSchema = new mongoose.Schema({
    // Общие поля для всех
    firstName: String,
    lastname: String,
    createdAt: {},
    updatedAt: {},
    lastLogin: {},
    role: {},
    status: {},
    userName: {},
    password: {},
    email: {},
}, {
    timestamps: true
});

const PlatformUser = mongoose.model('PlatformUser', platformUserSchema);
module.exports = PlatformUser;
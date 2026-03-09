const { z } = require('zod');
const User = require('../models/platformUser');

const changePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(1, 'Введите текущий пароль'),
    newPassword: z
        .string()
        .min(10, 'Новый пароль должен содержать минимум 10 символов'),
    confirmPassword: z
        .string()
        .min(10, 'Подтвердите новый пароль')
})
.refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
})
.refine((data) => data.oldPassword !== data.newPassword, {
    message: "Новый пароль не должен совпадать со старым",
    path: ["newPassword"],
});

/**
 * 1. Схема для запроса сброса пароля (Forgot Password)
 * Используется, когда пользователь вводит email, чтобы получить ссылку.
 */
const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .lowercase()
        .email('Введите корректный email адрес')
})
.superRefine(async (data, ctx) => {
    const user = await User.findOne({ email: data.email });
    if (!user) {
        ctx.addIssue({
            message: "Пользователь с таким email не найден",
            path: ["email"],
        });
    }
});

/**
 * 2. Схема для установки нового пароля (Reset Password)
 * Используется, когда пользователь уже перешел по ссылке из письма.
 */
const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(10, 'Новый пароль должен содержать минимум 10 символов'),
    confirmPassword: z
        .string()
        .min(10, 'Подтвердите пароль'),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

module.exports = {
    changePasswordSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
};
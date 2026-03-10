const express = require('express');
const router = express.Router();

// Контроллеры
const { 
    changePassword, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/password/index');

// Мидлвары
const { auth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Схемы валидации
const { 
    changePasswordSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} = require('../schemas/password.schema');

/**
 * Смена пароля авторизованным пользователем
 */
router.put(
    '/change', 
    auth, 
    validate(changePasswordSchema), 
    changePassword
);

/**
 * Запрос ссылки на восстановление пароля (на email)
 */
router.post(
    '/forgot', 
    validate(forgotPasswordSchema), 
    forgotPassword
);

/**
 * Установка нового пароля по токену из письма
 */
router.post(
    '/reset/:token', 
    validate(resetPasswordSchema), 
    resetPassword
);

module.exports = router;
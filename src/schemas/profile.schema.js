const { z } = require('zod');
const User = require('../models/platformUser');

const updateMeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Имя не может быть пустым')
    .optional(),
    
  lastName: z
    .string()
    .trim()
    .min(1, 'Фамилия не может быть пустой')
    .optional(),

  login: z
    .string()
    .trim()
    .lowercase()
    .min(3, 'Логин должен быть не менее 3 символов')
    .optional(),

  email: z
    .string()
    .trim()
    .lowercase()
    .email('Некорректный формат email')
    .optional(),

  photoUrl: z
    .string()
    .url('Некорректная ссылка на фото')
    .or(z.literal('')) // Позволяет пустую строку, как в default модели
    .optional(),
});


module.exports = { 
    updateMeSchema
};
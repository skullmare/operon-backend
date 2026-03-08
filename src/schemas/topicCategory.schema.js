const mongoose = require('mongoose');
const { z } = require('zod');

// --- Вспомогательные функции ---

/**
 * Валидация ObjectId
 */
const objectId = z.string()
    .trim()
    .refine(v => mongoose.Types.ObjectId.isValid(v), "Некорректный ID категории");

/**
 * Проверка уникальности названия категории
 */
const categoryNameIsUnique = (currentCategoryId = null) => async (name, ctx) => {
    const query = { name: name.trim() };
    if (currentCategoryId) {
        query._id = { $ne: currentCategoryId };
    }

    const exists = await mongoose.model('TopicCategory').exists(query);
    if (exists) {
        ctx.addIssue({
            code: 'custom',
            path: ['name'],
            message: 'Категория с таким названием уже существует'
        });
    }
};

// --- Схемы для контроллеров ---

/**
 * Схема создания категории
 */
const createCategorySchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Название обязательно" })
            .trim()
            .min(2, "Название должно быть не менее 2 символов")
            .max(50, "Название слишком длинное")
            .superRefine(categoryNameIsUnique()),
        description: z.string().trim().optional()
    })
});

/**
 * Схема обновления категории
 */
const updateCategorySchema = z.object({
    params: z.object({
        id: objectId
    }),
    body: z.object({
        name: z.string().trim().min(2, "Название не может быть пустым").optional(),
        description: z.string().trim().optional()
    })
}).superRefine(async (data, ctx) => {
    // Проверка существования
    const category = await mongoose.model('TopicCategory').findById(data.params.id);
    if (!category) {
        ctx.addIssue({ code: 'custom', path: ['params', 'id'], message: 'Категория не найдена' });
        return;
    }

    // Если меняется имя, проверяем на уникальность
    if (data.body.name) {
        await categoryNameIsUnique(data.params.id)(data.body.name, ctx);
    }
});

/**
 * Схема удаления категории (перенос логики из pre-hook)
 */
const deleteCategorySchema = z.object({
    params: z.object({
        id: objectId
    })
}).superRefine(async (data, ctx) => {
    const category = await mongoose.model('TopicCategory').findById(data.params.id);
    
    if (!category) {
        ctx.addIssue({ code: 'custom', path: ['params', 'id'], message: 'Категория не найдена' });
        return;
    }

    // Проверка использования в топиках (аналог вашего pre-hook)
    const Topic = mongoose.model('Topic');
    const count = await Topic.countDocuments({ 'metadata.category': data.params.id });

    if (count > 0) {
        ctx.addIssue({
            code: 'custom',
            path: ['params', 'id'],
            message: `Нельзя удалить категорию "${category.name}", так как она используется в топиках (${count} шт.)`
        });
    }
});

/**
 * Схема получения списка категорий
 */
const getAllCategoriesSchema = z.object({
    query: z.object({
        search: z.string().trim().optional(),
        page: z.string()
            .regex(/^\d+$/, "Должно быть числом")
            .transform(Number)
            .default("1"),
        limit: z.string()
            .regex(/^\d+$/, "Должно быть числом")
            .transform(Number)
            .default("20")
    })
});

const getOneCategorySchema = z.object({
    params: z.object({
        id: objectId
    })
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
    getOneCategorySchema,
    getAllCategoriesSchema
};
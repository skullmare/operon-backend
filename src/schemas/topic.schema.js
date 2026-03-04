const mongoose = require('mongoose');
const { z } = require('zod');

// Выносим проверку ID в переиспользуемый компонент
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Некорректный формат ID"
});

const createTopicSchema = z.object({
    name: z.string().trim().min(1, "Наименование топика обязательно"),
    content: z.string().trim().min(1, "Содержание топика обязательно"),
    metadata: z.object({
        // Проверка категории
        category: objectIdSchema.refine(async (id) => {
            return await mongoose.model('TopicCategory').exists({ _id: id });
        }, "Указанная категория не существует"),

        // Проверка ролей
        accessibleByRoles: z.array(objectIdSchema)
            .min(1, "Укажите хотя бы одну роль")
            .superRefine(async (ids, ctx) => {
                const uniqueIds = [...new Set(ids)]; // Убираем дубликаты перед запросом
                const count = await mongoose.model('AgentRole').countDocuments({ _id: { $in: uniqueIds } });

                if (count !== uniqueIds.length) {
                    ctx.addIssue({
                        code: 'custom',
                        message: "Одна или несколько указанных ролей не существуют в базе",
                        fatal: true // Предотвращает дальнейшие проверки, если это критично
                    });
                }
            })
    }),
    files_metadata: z.record(
        z.string(),
        z.object({
            name: z.string().trim().min(1, "Имя файла обязательно"),
            description: z.string().trim().min(1, "Описание файла обязательно")
        }).strict()
    ).optional()
});

/**
 * Схема для удаления топика
 * Проверяет формат ID и физическое наличие записи в БД
 */
const deleteTopicSchema = z.object({
    params: z.object({
        id: objectIdSchema.refine(async (id) => {
            // Замените 'Topic' на имя вашей модели, если оно другое
            const exists = await mongoose.model('Topic').exists({ _id: id });
            return !!exists;
        }, {
            message: "Топик с таким ID не найден"
        })
    })
});

const patchTopicSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }),
    body: z.object({
        name: z.string().trim().min(1, "Наименование топика обязательно").optional(),
        content: z.string().trim().min(1, "Содержание топика обязательно").optional(),
        metadata: z.object({
            // Проверка категории
            category: objectIdSchema.optional().refine(async (id) => {
                if (!id) return true;
                return await mongoose.model('TopicCategory').exists({ _id: id });
            }, "Указанная категория не существует"),

            // Проверка ролей
            accessibleByRoles: z.array(objectIdSchema).min(1, "У топика должна быть хотя бы одна роль").optional().superRefine(async (ids, ctx) => {
                if (!ids || ids.length === 0) return;
                const uniqueIds = [...new Set(ids)];
                const count = await mongoose.model('AgentRole').countDocuments({ _id: { $in: uniqueIds } });

                if (count !== uniqueIds.length) {
                    ctx.addIssue({
                        code: 'custom',
                        message: "Одна или несколько указанных ролей не существуют"
                    });
                }
            })
        }).optional(),

        filesToDelete: z.array(
            z.string()
                .trim()
                .startsWith(`https://storage.yandexcloud.net/${process.env.BUCKET_NAME}`, {
                    message: "URL должен принадлежать вашему хранилищу S3"
                })
        ).optional(),

        files_metadata: z.record(
            z.string(),
            z.object({
                name: z.string().trim().min(1, "Поле наименование файла обязательно для заполнения"),
                description: z.string().trim().min(1, "Поле описание файла обязательно для заполнения")
            })
        ).optional()
    })
});

const getTopicsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).default("1"),
        limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
        search: z.string().optional(),
        category: objectIdSchema.optional(),
        status: z.enum(['published', 'review', 'draft']).optional()
    })
});

const getOneTopicSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});

// Добавляем в экспорт
module.exports = {
    createTopicSchema, deleteTopicSchema, patchTopicSchema, getTopicsSchema,
    getOneTopicSchema
};
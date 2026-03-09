const express = require('express');
const router = express.Router();

// Импортируем фасад контроллеров категорий
const topicCategoryController = require('../controllers/topicCategories/index');

// Middleware
const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');

/**
 * 1. Получение списка всех категорий
 * Права: topicCategories.read
 */
router.get(
    '/',
    auth,
    checkPermission('topicCategories.read'),
    topicCategoryController.getAllCategories
);

/**
 * 2. Получение данных конкретной категории
 * Права: topicCategories.read
 */
router.get(
    '/:id',
    auth,
    checkPermission('topicCategories.read'),
    topicCategoryController.getOneCategory
);

/**
 * 3. Создание новой категории
 * Права: topicCategories.create
 */
router.post(
    '/',
    auth,
    checkPermission('topicCategories.create'),
    topicCategoryController.createCategory
);

/**
 * 4. Редактирование категории
 * Права: topicCategories.update
 */
router.patch(
    '/:id',
    auth,
    checkPermission('topicCategories.update'),
    topicCategoryController.updateCategory
);

/**
 * 5. Массовое удаление категорий
 * Права: topicCategories.delete
 * Важно: стоит выше /:id, чтобы избежать конфликта путей
 */
router.delete(
    '/delete/many',
    auth,
    checkPermission('topicCategories.delete'),
    topicCategoryController.deleteCategoryList
);

/**
 * 6. Удаление одной категории
 * Права: topicCategories.delete
 */
router.delete(
    '/:id',
    auth,
    checkPermission('topicCategories.delete'),
    topicCategoryController.deleteCategory
);

module.exports = router;
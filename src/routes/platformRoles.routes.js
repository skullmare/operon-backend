const express = require('express');
const router = express.Router();

// Импортируем фасад контроллеров ролей
const roleController = require('../controllers/platformRole/index');

// Middleware
const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');

/**
 * 1. Получение списка всех ролей
 * Права: role.read
 */
router.get(
    '/',
    auth,
    checkPermission('role.read'),
    roleController.getAllRoles
);

/**
 * 2. Получение данных конкретной роли
 * Права: role.read
 */
router.get(
    '/:id',
    auth,
    checkPermission('role.read'),
    roleController.getOneRole // Убедитесь, что этот контроллер экспортирован в index.js
);

/**
 * 3. Создание новой роли
 * Права: role.create
 */
router.post(
    '/',
    auth,
    checkPermission('role.create'),
    roleController.createRole
);

/**
 * 4. Редактирование роли
 * Права: role.update
 */
router.patch(
    '/:id',
    auth,
    checkPermission('role.update'),
    roleController.updateRole
);

/**
 * 5. Массовое удаление ролей
 * Права: role.delete
 * Важно: ставим выше одиночного удаления, чтобы роут не подхватился как :id
 */
router.delete(
    '/delete/many',
    auth,
    checkPermission('role.delete'),
    roleController.deleteRoleList
);

/**
 * 6. Удаление одной роли
 * Права: role.delete
 */
router.delete(
    '/:id',
    auth,
    checkPermission('role.delete'),
    roleController.deleteRole
);

module.exports = router;
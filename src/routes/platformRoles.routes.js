const express = require('express');
const router = express.Router();

// Импортируем фасад контроллеров ролей
const roleController = require('../controllers/platformRole/index');

// Middleware
const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

const { getAllRolesSchema, getOneRoleSchema, deleteRoleListSchema, deleteRoleSchema, updateRoleSchema, createRoleSchema} = require('../schemas/platformRole.schema')

/**
 * 1. Получение списка всех ролей
 * Права: role.read
 */
router.get(
    '/',
    auth,
    checkPermission('role.read'),
    validate(getAllRolesSchema),
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
    validate(getOneRoleSchema),
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
    validate(createRoleSchema),
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
    validate(updateRoleSchema),
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
    validate(deleteRoleListSchema),
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
    validate(deleteRoleSchema),
    roleController.deleteRole
);

module.exports = router;
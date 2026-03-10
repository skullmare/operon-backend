const express = require('express');
const router = express.Router();

const roleController = require('../controllers/platformRole/index');

const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

const { getAllRolesSchema, getOneRoleSchema, deleteRoleListSchema, deleteRoleSchema, updateRoleSchema, createRoleSchema} = require('../schemas/platformRole.schema')

router.get(
    '/',
    auth,
    checkPermission('role.read'),
    validate(getAllRolesSchema),
    roleController.getAllRoles
);

router.get(
    '/:id',
    auth,
    checkPermission('role.read'),
    validate(getOneRoleSchema),
    roleController.getOneRole
);

router.post(
    '/',
    auth,
    checkPermission('role.create'),
    validate(createRoleSchema),
    roleController.createRole
);

router.patch(
    '/:id',
    auth,
    checkPermission('role.update'),
    validate(updateRoleSchema),
    roleController.updateRole
);

router.delete(
    '/delete/many',
    auth,
    checkPermission('role.delete'),
    validate(deleteRoleListSchema),
    roleController.deleteRoleList
);

router.delete(
    '/:id',
    auth,
    checkPermission('role.delete'),
    validate(deleteRoleSchema),
    roleController.deleteRole
);

module.exports = router;
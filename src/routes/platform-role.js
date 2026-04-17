const express = require('express');
const router = express.Router();

const roleController = require('../controllers/platform-role/export');

const { auth } = require('../middlewares/auth');
const checkPermission = require('../middlewares/permission');
const validate = require('../middlewares/validate');

const { getAllPlatformRolesSchema, getOnePlatformRoleSchema, deletePlatformRoleListSchema, deletePlatformRoleSchema, updatePlatformRoleSchema, createPlatformRoleSchema } = require('../schemas/platform-role')

router.get(
    '/',
    auth,
    checkPermission('platformRoles.read'),
    validate(getAllPlatformRolesSchema),
    roleController.getAllRoles
);

router.get(
    '/:id',
    auth,
    checkPermission('platformRoles.read'),
    validate(getOnePlatformRoleSchema),
    roleController.getOneRole
);

router.post(
    '/',
    auth,
    checkPermission('platformRoles.create'),
    validate(createPlatformRoleSchema),
    roleController.createRole
);

router.patch(
    '/:id',
    auth,
    checkPermission('platformRoles.update'),
    validate(updatePlatformRoleSchema),
    roleController.updateRole
);

router.delete(
    '/delete/many',
    auth,
    checkPermission('platformRoles.delete'),
    validate(deletePlatformRoleListSchema),
    roleController.deleteRoleList
);

router.delete(
    '/:id',
    auth,
    checkPermission('platformRoles.delete'),
    validate(deletePlatformRoleSchema),
    roleController.deleteRole
);

module.exports = router;
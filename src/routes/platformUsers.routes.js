const express = require('express');
const router = express.Router();

const userController = require('../controllers/platformUser/index');

const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

const { getAllUsersSchema, getOneUserSchema, deleteUserSchema, createUserSchema, updateUserSchema} = require('../schemas/user.schema')

router.get(
    '/',
    auth,
    checkPermission('platformUsers.read'),
    validate(getAllUsersSchema),
    userController.getAllUsers
);

router.get(
    '/:id',
    auth,
    checkPermission('platformUsers.read'),
    validate(getOneUserSchema),
    userController.getOneUser
);

router.post(
    '/',
    auth,
    checkPermission('platformUsers.create'),
    validate(createUserSchema),
    userController.createUser
);

router.patch(
    '/:id',
    auth,
    checkPermission('platformUsers.update'),
    validate(updateUserSchema),
    userController.updateUser
);

router.delete(
    '/:id',
    auth,
    checkPermission('platformUsers.delete'),
    validate(deleteUserSchema),
    userController.deleteUser
);

module.exports = router;
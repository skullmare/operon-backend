const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/permissions/export');

router.get(
    '/',
    permissionController.getAllPermissions
);
module.exports = router;
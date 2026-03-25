const express = require('express');
const router = express.Router();

const logsControllers = require('../controllers/log/index');
const { getLogsSchema, getLogSchema } = require('../schemas/LogSchema');
const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

router.get(
    '/',
    auth,
    checkPermission('logs.read'),
    validate(getLogsSchema),
    logsControllers.getAllLogs
);

router.get(
    '/:id',
    auth,
    checkPermission('logs.read'),
    validate(getLogSchema),
    logsControllers.getOneLog
);

module.exports = router;
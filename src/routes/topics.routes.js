const express = require('express');
const router = express.Router();
const multer = require('multer');

const topicsController = require('../controllers/topic/index');

const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get(
    '/',
    auth,
    checkPermission('topics.read'),
    topicsController.getAll
);

router.get(
    '/:id',
    auth,
    checkPermission('topics.read'),
    topicsController.getOne
);

router.post(
    '/',
    auth,
    checkPermission('topics.create'),
    topicsController.createTopic
);

router.patch(
    '/:id',
    auth,
    checkPermission('topics.update'),
    topicsController.updateTopic
);

router.post(
    '/:id/approve',
    auth,
    checkPermission('topics.approve'),
    topicsController.approveTopic
);

router.delete(
    '/:id',
    auth,
    checkPermission('topics.delete'),
    topicsController.deleteTopic
);

module.exports = router;
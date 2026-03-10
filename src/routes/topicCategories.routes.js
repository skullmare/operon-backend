const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategories/index');

const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');

router.get(
    '/',
    auth,
    checkPermission('topicCategories.read'),
    topicCategoryController.getAllCategories
);

router.get(
    '/:id',
    auth,
    checkPermission('topicCategories.read'),
    topicCategoryController.getOneCategory
);

router.post(
    '/',
    auth,
    checkPermission('topicCategories.create'),
    topicCategoryController.createCategory
);

router.patch(
    '/:id',
    auth,
    checkPermission('topicCategories.update'),
    topicCategoryController.updateCategory
);

router.delete(
    '/delete/many',
    auth,
    checkPermission('topicCategories.delete'),
    topicCategoryController.deleteCategoryList
);

router.delete(
    '/:id',
    auth,
    checkPermission('topicCategories.delete'),
    topicCategoryController.deleteCategory
);

module.exports = router;
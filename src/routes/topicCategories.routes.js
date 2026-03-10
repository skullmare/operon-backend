const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategories/index');

const { auth } = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/permission.middleware');

const validate = require('../middlewares/validate.middleware');
const { 
    createCategorySchema,
    updateCategorySchema,
    deleteCategorySchema,
    deleteCategoryListSchema,
    getOneCategorySchema,
    getAllCategoriesSchema
 } = require('../schemas/topicCategory.schema');

router.get(
    '/',
    auth,
    checkPermission('topicCategories.read'),
    validate(getAllCategoriesSchema),
    topicCategoryController.getAllCategories
);

router.get(
    '/:id',
    auth,
    checkPermission('topicCategories.read'),
    validate(getOneCategorySchema),
    topicCategoryController.getOneCategory
);

router.post(
    '/',
    auth,
    checkPermission('topicCategories.create'),
    validate(createCategorySchema),
    topicCategoryController.createCategory
);

router.patch(
    '/:id',
    auth,
    checkPermission('topicCategories.update'),
    validate(updateCategorySchema),
    topicCategoryController.updateCategory
);

router.delete(
    '/delete/many',
    auth,
    checkPermission('topicCategories.delete'),
    validate(deleteCategoryListSchema),
    topicCategoryController.deleteCategoryList
);

router.delete(
    '/:id',
    auth,
    checkPermission('topicCategories.delete'),
    validate(deleteCategorySchema),
    topicCategoryController.deleteCategory
);

module.exports = router;
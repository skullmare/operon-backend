const createCategory = require('./topicCategoriesCreate.controller');
const updateCategory = require('./topicCategoriesUpdate.controller');
const deleteCategory = require('./topicCategoriesDelete.controller');
const deleteCategoryList = require('./topicCategoriesDeleteList.controller');
const getAllCategories = require('./topicCategoriesGetAll.controller');
const getOneCategory = require('./topicCategoriesGetOne.controller');

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    deleteCategoryList,
    getAllCategories,
    getOneCategory
};
const createTopic = require('./topicCreate.controller');
const getAll = require('./topicGetAll.controller');
const getOne = require('./topicGetOne.controller');
const updateTopic = require('./topicUpdate.controller');
const approveTopic = require('./topicApprove.controller');
const deleteTopic = require('./topicDelete.controller');

module.exports = {
    createTopic,
    getAll,
    getOne,
    updateTopic,
    approveTopic,
    deleteTopic
};
const createAgentRole = require('./agentRoleCreate.controller');
const updateAgentRole = require('./agentRoleUpdate.controller');
const deleteAgentRole = require('./agentRoleDelete.controller');
const deleteAgentRoleList = require('./agentRoleDeleteList.controller');
const getAllAgentRoles = require('./agentRoleGetAll.controller');
const getOneAgentRole = require('./agentRoleGetOne.controller');

module.exports = {
    createAgentRole,
    updateAgentRole,
    deleteAgentRole,
    deleteAgentRoleList,
    getAllAgentRoles,
    getOneAgentRole
};
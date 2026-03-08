const createRole = require('./platformRoleCreate.controller');
const updateRole = require('./platformRoleUpdate.controller');
const deleteRole = require('./platformRoleDelete.controller');
const deleteRoleList = require('./platformRoleDeleteList.controller');
const getAllRoles = require('./platformRoleGetAll.controller');
const getOneRole = require('./platformRoleGetOne.controller');

module.exports = {
    createRole,
    updateRole,
    deleteRole,
    deleteRoleList,
    getAllRoles,
    getOneRole
};
const express = require('express');
const router = express.Router();

const agentUserController = require('../controllers/agent-user/export');

const { auth } = require('../middlewares/auth');
const checkPermission = require('../middlewares/permission');
const validate = require('../middlewares/validate');

const { 
    getAllAgentUsersSchema, 
    getOneAgentUserSchema, 
    updateAgentUserSchema,
    deleteAgentUserSchema
} = require('../schemas/agent-user');

router.get(
    '/',
    auth,
    checkPermission('agentUsers.read'),
    validate(getAllAgentUsersSchema),
    agentUserController.getAllAgentUsers
);

router.get(
    '/:id',
    auth,
    checkPermission('agentUsers.read'),
    validate(getOneAgentUserSchema),
    agentUserController.getOneAgentUser
);

router.patch(
    '/:id',
    auth,
    checkPermission('agentUsers.update'),
    validate(updateAgentUserSchema),
    agentUserController.updateAgentUser
);

router.delete(
    '/:id',
    auth,
    checkPermission('agentUsers.delete'),
    validate(deleteAgentUserSchema),
    agentUserController.deleteAgentUser
);

module.exports = router;
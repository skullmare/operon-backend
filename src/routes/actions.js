const express = require('express');
const router = express.Router();

const actionController = require('../controllers/actions/export');

router.get(
    '/',
    actionController.getAllActions
);
module.exports = router;
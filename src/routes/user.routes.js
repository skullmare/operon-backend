// routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

router.get('/:id', UserController.getUserById);

module.exports = router;
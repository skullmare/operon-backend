const express = require('express');
const router = express.Router();
const { login, refresh} = require('../controllers/auth/index');

// Публичные роуты
// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

module.exports = router;
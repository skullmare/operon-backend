const express = require('express');
const router = express.Router();
const { login, refresh} = require('../controllers/auth/index');

router.post('/login', login);
router.post('/refresh', refresh);

module.exports = router;
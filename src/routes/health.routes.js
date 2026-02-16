const router = require('express').Router();
const { health } = require('../controllers/health.controller');

// Сначала проверяем, что юзер залогинен (auth), 
// потом — есть ли у него право (checkPermission)
router.get('/', health);

module.exports = router;
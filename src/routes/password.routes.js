const express = require('express');
const router = express.Router();
const { changePassword, forgotPassword, resetPassword } = require('../controllers/password/index');
const { auth } = require('../middlewares/auth.middleware');

router.put('/change', auth, changePassword);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);

module.exports = router;
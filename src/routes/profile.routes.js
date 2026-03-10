const express = require('express');
const router = express.Router();
const { me, updateMe} = require('../controllers/profile/index');
const { auth } = require('../middlewares/auth.middleware');

router.get('/', auth, me);
router.patch('/update', auth, updateMe);

module.exports = router;
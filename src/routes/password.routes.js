const express = require('express');
const router = express.Router();

const { 
    changePassword, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/password/index');

const { auth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const { 
    changePasswordSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema 
} = require('../schemas/password.schema');

router.put(
    '/change', 
    auth, 
    validate(changePasswordSchema), 
    changePassword
);

router.post(
    '/forgot', 
    validate(forgotPasswordSchema), 
    forgotPassword
);

router.post(
    '/reset/:token', 
    validate(resetPasswordSchema), 
    resetPassword
);

module.exports = router;
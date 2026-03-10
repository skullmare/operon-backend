// validate.middleware.js
const errorHandler = require("../utils/errorHandler");

const validate = (schema, errorMessage = 'Ошибка валидации') => async (req, res, next) => {
    const validation = await schema.safeParseAsync({
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (!validation.success) {
        const errors = validation.error.issues.map(err => ({
            path: err.path.filter(p => !['body', 'params', 'query'].includes(p)).join('.') || 'id',
            message: err.message
        }));

        return errorHandler(res, 400, errorMessage, errors);
    }

    req.validatedData = validation.data; 
    next();
};

module.exports = validate;
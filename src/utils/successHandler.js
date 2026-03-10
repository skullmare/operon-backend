module.exports = (res, statusCode, message, data, pagination = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};
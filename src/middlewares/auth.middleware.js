const authService = require('../services/auth.service');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

    try {
        const decoded = authService.validateAccessToken(token);
        req.user = decoded; // Передаем данные дальше (id, role)
        next();
    } catch (e) {
        res.status(401).json({ message: 'Неверный или просроченный токен' });
    }
};

module.exports = { auth };
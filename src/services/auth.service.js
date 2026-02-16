const jwt = require('jsonwebtoken');

class AuthService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    verifyRefresh(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    validateAccessToken(token) {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    }
}

module.exports = new AuthService();
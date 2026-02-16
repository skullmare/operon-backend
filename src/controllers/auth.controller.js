const authService = require('../services/auth.service');
const User = require('../models/platformUser');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  const { login, password } = req.body;
  const user = await User.findOne({ login }).select('+password');

  if (user && (await bcrypt.compare(password, user.password))) {
    const tokens = authService.generateTokens({ id: user._id, role: user.role });

    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    return res.json({ accessToken: tokens.accessToken });
  }
  else {
    res.status(401).json({ message: 'Неправильный логин или пароль!' });
  }
  
  res.status(401).json({ message: 'Ошибка аутентификации!' });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = authService.verifyRefresh(token);
    const tokens = authService.generateTokens({ id: decoded.id, role: decoded.role });

    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
    res.json({ accessToken: tokens.accessToken });
  } catch (e) {
    res.sendStatus(403);
  }
};

module.exports = { login, refresh };
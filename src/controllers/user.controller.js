// controllers/user.controller.js

class UserController {
  async getUserById(req, res, next) {
    try {
      res.json(req.params.id);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
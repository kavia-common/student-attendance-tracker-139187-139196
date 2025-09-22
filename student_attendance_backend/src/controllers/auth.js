'use strict';
const { login } = require('../services/auth');

class AuthController {
  // PUBLIC_INTERFACE
  async login(req, res, next) {
    /** Authenticate user and return JWT. */
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        const err = new Error('email and password are required');
        err.status = 400;
        throw err;
      }
      const data = await login(email, password);
      res.json({ status: 'ok', ...data });
    } catch (e) { next(e); }
  }
}

module.exports = new AuthController();

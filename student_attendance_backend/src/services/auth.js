'use strict';
/**
 * Authentication service using JWT. Uses repository users table when available.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getRepository } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1d';

async function findUserByEmail(email) {
  const repo = getRepository();
  // For InMemoryRepo we keep users in memory
  if (repo.knex) {
    const user = await repo.knex('users').where({ email }).first();
    return user || null;
  }
  // in-memory fallback
  const u = repo.users.find(x => x.email === email);
  return u || null;
}

async function ensureDemoAdmin() {
  const repo = getRepository();
  if (repo.knex) {
    const existing = await repo.knex('users').where({ email: 'admin@example.com' }).first();
    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await repo.knex('users').insert({ email: 'admin@example.com', passwordHash, role: 'admin' });
    }
  } else {
    const existing = await findUserByEmail('admin@example.com');
    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      repo.users.push({ id: 1, email: 'admin@example.com', passwordHash, role: 'admin' });
    }
  }
}

// PUBLIC_INTERFACE
async function login(email, password) {
  /** Authenticate a user by email and password and return a JWT token. */
  await ensureDemoAdmin();
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const payload = { sub: user.id, email: user.email, role: user.role || 'teacher' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return { token, user: { id: user.id, email: user.email, role: user.role || 'teacher' } };
}

// PUBLIC_INTERFACE
function authMiddleware(req, res, next) {
  /** Express middleware to validate Bearer Token and set req.user. */
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Missing Authorization header' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

module.exports = { login, authMiddleware };

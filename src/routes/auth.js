const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../db');
const config = require('../config/env');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(), // 72 = limita bcrypt
  name: Joi.string().trim().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// POST /auth/register — întotdeauna rol USER (rolul nu se citește din body)
router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.length) throw new HttpError(409, 'Email already registered');

  const hash = await bcrypt.hash(password, 10);
  const [created] = await db.query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'USER') RETURNING id",
    [email, hash, name]
  );
  res.status(201).json({ id: created.id, email, name, role: 'USER' });
}));

// POST /auth/login — returnează JWT
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const rows = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  // Același mesaj pentru email inexistent și parolă greșită (nu dezvăluim ce conturi există)
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new HttpError(401, 'Invalid email or password');

  const token = jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.expiresIn,
  });
  res.json({ token, tokenType: 'Bearer', expiresIn: config.jwt.expiresIn, user: publicUser(user) });
}));

// GET /auth/me — utilizatorul curent (util pentru a verifica tokenul)
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const rows = await db.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
  if (!rows.length) throw new HttpError(401, 'User no longer exists');
  res.json(publicUser(rows[0]));
}));

module.exports = router;

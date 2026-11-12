const jwt = require('jsonwebtoken');
const config = require('../config/env');
const HttpError = require('../utils/httpError');

/** Cere header-ul `Authorization: Bearer <token>`. Setează req.user = { id, role }. */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Missing or malformed Authorization header (expected: Bearer <token>)'));
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (err) {
    next(new HttpError(401, err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'));
  }
}

/** Permite accesul doar rolurilor date. Se folosește după `authenticate`. */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};

const adminOnly = [authenticate, authorize('ADMIN')];

module.exports = { authenticate, authorize, adminOnly };

const jwt = require('jsonwebtoken');

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function signResetToken(payload) {
  const RESET_TTL = process.env.RESET_TOKEN_TTL || '15m';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: RESET_TTL });
}
module.exports = { signAccessToken, signRefreshToken, verifyToken, signResetToken };

// module.exports = { signAccessToken, signRefreshToken, verifyToken };

const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  tokenHash: { type: String, required: true, index: true },   // hash of the refresh token
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// helper to hash a raw token (HMAC or sha256)
refreshTokenSchema.statics.hash = function(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

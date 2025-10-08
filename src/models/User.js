const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.googleId; } }, // only required if not Google
  googleId: { type: String, default: null },
  name: String,
  verified: { type: Boolean, default: false },
  verificationTokenHash: String,
  verificationTokenExpiry: Date,
  resetTokenHash: String,
  resetTokenExpiry: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
module.exports = mongoose.model('User', userSchema);

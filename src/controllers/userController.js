const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const { signResetToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken, signRefreshToken, verifyToken, signResetToken } = require('../utils/jwt');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1️⃣ Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false
    });

    // 2️⃣ Generate verification token
    const verifyToken = signResetToken({ id: user._id });
    const hashed = crypto.createHash('sha256').update(verifyToken).digest('hex');
    user.verificationTokenHash = hashed;
    user.verificationTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // 3️⃣ Send verification link
    const verifyLink = `http://localhost:5000/api/users/verify-email/${verifyToken}`;
    console.log(`📩 Verification link for ${user.email}: ${verifyLink}`);

    // 4️⃣ Respond
    res.status(201).json({
      message: 'User registered successfully. Please verify your email to continue.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.verified)
  return res.status(403).json({ message: 'Email not verified. Please check your inbox.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // issue short-lived access token
    const accessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });

    // issue long-lived refresh token (opaque to client)
    const refreshToken = signRefreshToken({ id: user._id }); // payload minimal
    const tokenHash = RefreshToken.hash(refreshToken);
    const decoded = verifyToken(refreshToken); // get exp
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ME (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/refresh
// body: { refreshToken }
exports.refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let decoded;
    try {
      decoded = verifyToken(refreshToken);  // verifies signature & expiry
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokenHash = RefreshToken.hash(refreshToken);
    const doc = await RefreshToken.findOne({ userId: decoded.id, tokenHash, revokedAt: null });
    if (!doc) return res.status(401).json({ message: 'Refresh token not recognized/revoked' });
    if (doc.expiresAt < new Date()) return res.status(401).json({ message: 'Refresh token expired' });

    // ROTATE: revoke old + issue new pair
    doc.revokedAt = new Date();
    await doc.save();

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const accessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id });
    const newHash = RefreshToken.hash(newRefreshToken);
    const newDecoded = verifyToken(newRefreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newHash,
      expiresAt: new Date(newDecoded.exp * 1000)
    });

    res.json({
      message: 'Session refreshed',
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/logout
// body: { refreshToken }  (revoke just that session)
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch {
      // even if invalid/expired, we try to revoke by hash (best-effort)
      decoded = null;
    }
    const tokenHash = RefreshToken.hash(refreshToken);
    const q = decoded ? { userId: decoded.id, tokenHash, revokedAt: null } : { tokenHash, revokedAt: null };
    await RefreshToken.updateOne(q, { $set: { revokedAt: new Date() } });

    res.json({ message: 'Logged out (refresh token revoked). Discard your access token client-side.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with this email' });

    // 1️⃣ generate short-lived token
    const resetToken = signResetToken({ id: user._id });

    // 2️⃣ save hashed version in DB (optional but safer)
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenHash = hashed;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // 3️⃣ send email (for now, just log the link)
    const resetLink = `http://localhost:5000/api/users/reset-password/${resetToken}`;
    console.log(`📩 Password reset link for ${email}: ${resetLink}`);

    // later you can send using nodemailer (below)
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: '"Inito Support" <no-reply@inito.com>',
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 min.</p>`
    });
    */

    res.json({ message: 'Reset link sent (check console / email)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be ≥ 6 chars' });

    // verify token validity
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: decoded.id,
      resetTokenHash: hashed,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // clear reset fields
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: 'Password reset successful. Please login again.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: decoded.id,
      verificationTokenHash: hashed,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    if (user.verified) return res.status(200).json({ message: 'Already verified' });

    user.verified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No such user' });
    if (user.verified) return res.status(400).json({ message: 'Already verified' });

    const verifyToken = signResetToken({ id: user._id });
    const hashed = crypto.createHash('sha256').update(verifyToken).digest('hex');
    user.verificationTokenHash = hashed;
    user.verificationTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const link = `http://localhost:5000/api/users/verify-email/${verifyToken}`;
    console.log(`📩 Resent verification link for ${email}: ${link}`);

    res.json({ message: 'Verification email resent (check console / email)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    // issue tokens
    const accessToken = signAccessToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user._id });
    const tokenHash = RefreshToken.hash(refreshToken);
    const decoded = verifyToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // redirect with tokens (for now, simple JSON)
    res.json({
      message: 'Google login successful',
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Google login failed' });
  }
};


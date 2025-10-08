const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, refreshSession, logoutUser } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
const { forgotPassword, resetPassword } = require('../controllers/userController');
const { verifyEmail, resendVerification } = require('../controllers/userController');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/userController');

router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuthCallback
);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshSession);
router.post('/logout', logoutUser);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// protected route
router.get('/me', auth, getMe);

module.exports = router;

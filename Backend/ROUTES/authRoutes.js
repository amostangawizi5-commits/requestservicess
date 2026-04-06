const express = require('express');
const { register, login, me, logout } = require('../CONTROLLES/authController');
const { protect } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;

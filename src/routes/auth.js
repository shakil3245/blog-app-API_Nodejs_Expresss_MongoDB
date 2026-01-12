const express = require('express');
const { register, login,changePassword,forgotPassword,resetPassword } = require('../controllers/authController');
const router = express.Router();
const protect = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/changepassword', protect, changePassword);

//this end point dont work 
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);


module.exports = router;
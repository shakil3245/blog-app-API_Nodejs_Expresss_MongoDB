const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, deleteUser} = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);



module.exports = router;

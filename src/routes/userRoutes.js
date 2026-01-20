const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { getProfile, updateProfile, getAllUsers, deleteUser} = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');

router.get('/me', protect, getProfile);
router.put(
  '/me',
  protect,
  upload.single('avatar'),
  updateProfile
);
router.get('/', protect, authorize('admin'), getAllUsers);
router.delete('/:id', protect, authorize('admin'), deleteUser);



module.exports = router;

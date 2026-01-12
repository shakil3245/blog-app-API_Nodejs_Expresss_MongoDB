const express = require('express');
const { reviewByAdmin } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
const router = express.Router();

router.put('/journal/:id', protect, authorize('admin'), reviewByAdmin);

module.exports = router;
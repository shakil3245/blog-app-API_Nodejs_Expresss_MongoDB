const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs-extra');
//users profile CRUD

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// exports.updateProfile = async (req, res) => {
//   const updates = { name: req.body.name, bio: req.body.bio, avatar: req.body.avatar };
//   const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
//   res.json(user);
// };


//update profile

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update basic fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;

    // Upload new avatar if provided
    if (req.file) {
      // Remove old image
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'user-avatars',
        width: 300,
        crop: 'scale'
      });
       // 🧹 Remove temp file
      await fs.unlink(req.file.path);

      user.avatar = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// admin tasks
exports.getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const users = await User.find().select('-password');
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Delete avatar from Cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
};

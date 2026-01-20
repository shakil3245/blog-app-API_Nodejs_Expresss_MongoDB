const mongoose = require('mongoose');
// const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'author', 'reader'], default: 'reader' },
  bio: {
      type: String,
      maxlength: 300
    },
  avatar: {
      public_id: String,
      url: String
    },
  resetPasswordToken: String,
  resetPasswordExpire: Date
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
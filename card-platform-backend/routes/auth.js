const express = require('express');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'File upload error' });
  }
  next();
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, upload.single('avatar'), handleUploadError, updateProfile);
router.post('/change-password', auth, changePassword);

module.exports = router;
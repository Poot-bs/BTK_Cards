const express = require('express');
const { 
  getAllCards, 
  getAllUsers, 
  getStats, 
  adminUpdateCard 
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/cards', adminAuth, getAllCards);
router.get('/users', adminAuth, getAllUsers);
router.get('/stats', adminAuth, getStats);
router.put('/cards/:id', adminAuth, upload.single('image'), adminUpdateCard);

module.exports = router;
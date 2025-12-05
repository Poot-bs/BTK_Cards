const express = require('express');
const { 
  createCard, 
  getCardByShortCode, 
  getUserCards, 
  updateCard, 
  deleteCard 
} = require('../controllers/cardController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes (must come first)
router.get('/:shortCode', getCardByShortCode);

// Protected routes
router.get('/', auth, getUserCards);
router.post('/', auth, upload.single('image'), createCard);
router.put('/:id', auth, upload.single('image'), updateCard);
router.delete('/:id', auth, deleteCard);

module.exports = router;
const Card = require('../models/Card');
const shortid = require('shortid');

// Helper function to format card response
const formatCardResponse = (card, req) => {
  const cardObj = card.toObject ? card.toObject() : card;
  
  // If imageUrl is a relative path, convert to absolute URL
  if (cardObj.imageUrl && cardObj.imageUrl.startsWith('/uploads/')) {
    cardObj.imageUrl = `${req.protocol}://${req.get('host')}${cardObj.imageUrl}`;
  }
  
  return cardObj;
};

// Create new card
exports.createCard = async (req, res) => {
  try {
    const { title, content, backgroundColor, textColor, buttonColor } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const card = new Card({
      title,
      content,
      imageUrl,
      backgroundColor,
      textColor,
      buttonColor,
      createdBy: req.user._id,
      shortCode: shortid.generate()
    });

    await card.save();
    await card.populate('createdBy', 'username email');

    const formattedCard = formatCardResponse(card, req);
    res.status(201).json({
      message: 'Card created successfully',
      card: formattedCard
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating card',
      error: error.message
    });
  }
};

// Get card by short code
exports.getCardByShortCode = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const card = await Card.findOne({ shortCode, isActive: true })
      .populate('createdBy', 'username email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Increment views
    card.views += 1;
    await card.save();

    const formattedCard = formatCardResponse(card, req);
    res.json({ card: formattedCard });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching card',
      error: error.message
    });
  }
};

// Get user's cards
exports.getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username email');

    res.json({ cards });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching cards',
      error: error.message
    });
  }
};

// Update card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      updates.imageUrl = imageUrl;
    }

    const card = await Card.findOne({
      _id: id,
      $or: [
        { createdBy: req.user._id },
        { ...(req.user.role === 'admin' && {}) }
      ]
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found or access denied' });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        card[key] = updates[key];
      }
    });

    await card.save();
    await card.populate('createdBy', 'username email');

    // Format imageUrl to absolute URL so frontend can display it
    const cardObj = card.toObject ? card.toObject() : card;
    if (cardObj.imageUrl && cardObj.imageUrl.startsWith('/uploads/')) {
      cardObj.imageUrl = `${req.protocol}://${req.get('host')}${cardObj.imageUrl}`;
    }

    res.json({
      message: 'Card updated successfully',
      card: cardObj
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating card',
      error: error.message
    });
  }
};

// Delete card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findOne({
      _id: id,
      $or: [
        { createdBy: req.user._id },
        { ...(req.user.role === 'admin' && {}) }
      ]
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found or access denied' });
    }

    await Card.findByIdAndDelete(id);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting card',
      error: error.message
    });
  }
};
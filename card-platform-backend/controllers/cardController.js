const Card = require('../models/Card');
const shortid = require('shortid');
const { uploadImage, deleteImage, isSupabaseUrl } = require('../services/supabaseStorage');

// Create new card
exports.createCard = async (req, res) => {
  try {
    const { 
      title, subtitle, content, backgroundColor, textColor, buttonColor, fontFamily, 
      titleFont, subtitleFont, titleLayout, titleLines, subtitleSize,
      titleBold, subtitleBold,
      description, descriptionFont, descriptionSize, descriptionColor, descriptionAlign, descriptionBold
    } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      // Upload to Supabase Storage
      const uploadResult = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user._id.toString()
      );
      imageUrl = uploadResult.url;
    }

    const card = new Card({
      title,
      subtitle: subtitle || '',
      content,
      imageUrl,
      backgroundColor,
      textColor,
      buttonColor,
      fontFamily: fontFamily || 'Inter',
      titleFont: titleFont || 'Inter',
      subtitleFont: subtitleFont || 'Inter',
      titleLayout: titleLayout || 'inline',
      titleLines: titleLines || '3',
      titleBold: titleBold === 'true' || titleBold === true,
      subtitleSize: subtitleSize || 'xl',
      subtitleBold: subtitleBold === 'true' || subtitleBold === true,
      description: description || '',
      descriptionFont: descriptionFont || 'Inter',
      descriptionSize: descriptionSize || 'base',
      descriptionColor: descriptionColor || textColor || '#000000',
      descriptionAlign: descriptionAlign || 'left',
      descriptionBold: descriptionBold === 'true' || descriptionBold === true,
      createdBy: req.user._id,
      shortCode: shortid.generate()
    });

    await card.save();
    await card.populate('createdBy', 'username email');

    res.status(201).json({
      message: 'Card created successfully',
      card: card.toObject()
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

    res.json({ card: card.toObject() });
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

    // Handle image upload to Supabase
    if (req.file) {
      // Delete old image from Supabase if it exists
      if (card.imageUrl && isSupabaseUrl(card.imageUrl)) {
        await deleteImage(card.imageUrl);
      }

      // Upload new image to Supabase
      const uploadResult = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user._id.toString()
      );
      updates.imageUrl = uploadResult.url;
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        // Handle boolean conversions for updates
        if (['titleBold', 'subtitleBold', 'descriptionBold'].includes(key)) {
          card[key] = updates[key] === 'true' || updates[key] === true;
        } else {
          card[key] = updates[key];
        }
      }
    });

    await card.save();
    await card.populate('createdBy', 'username email');

    res.json({
      message: 'Card updated successfully',
      card: card.toObject()
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

    // Delete image from Supabase if it exists
    if (card.imageUrl && isSupabaseUrl(card.imageUrl)) {
      await deleteImage(card.imageUrl);
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
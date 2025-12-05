const Card = require('../models/Card');
const User = require('../models/User');

// Get all cards (admin only)
exports.getAllCards = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cards = await Card.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Card.countDocuments();

    res.json({
      cards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching cards',
      error: error.message
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const totalCards = await Card.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalViews = await Card.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const recentCards = await Card.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalCards,
        totalUsers,
        totalViews: totalViews[0]?.total || 0
      },
      recentCards
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Admin update any card
exports.adminUpdateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      updates.imageUrl = imageUrl;
    }

    const card = await Card.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Ensure returned imageUrl is absolute so admin/updating clients can display it
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
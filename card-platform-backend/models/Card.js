const mongoose = require('mongoose');
const shortid = require('shortid');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    default: ''
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    default: shortid.generate
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  buttonColor: {
    type: String,
    default: '#3b82f6'
  },
  fontFamily: {
    type: String,
    default: 'Inter'
  },
  titleFont: {
    type: String,
    default: 'Inter'
  },
  subtitleFont: {
    type: String,
    default: 'Inter'
  },
  titleLayout: {
    type: String,
    enum: ['inline', 'stacked'],
    default: 'inline'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Card', cardSchema);
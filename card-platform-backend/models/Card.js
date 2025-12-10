const mongoose = require('mongoose');
const shortid = require('shortid');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  subtitle: {
    type: String,
    default: '',
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
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
  titleLines: {
    type: String,
    default: '3'
  },
  titleBold: {
    type: Boolean,
    default: true
  },
  subtitleSize: {
    type: String,
    default: 'xl'
  },
  subtitleBold: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  descriptionFont: {
    type: String,
    default: 'Inter'
  },
  descriptionSize: {
    type: String,
    default: 'base'
  },
  descriptionColor: {
    type: String,
    default: '#000000'
  },
  descriptionAlign: {
    type: String,
    default: 'left'
  },
  descriptionBold: {
    type: Boolean,
    default: false
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
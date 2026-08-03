const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a notice title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add notice content'],
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'Meeting', 'Exam', 'Urgent', 'Event'],
    default: 'General'
  },
  authorName: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['HOD', 'Staff'],
    required: true
  },
  targetAudience: {
    type: String,
    default: 'All Department'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', noticeSchema);

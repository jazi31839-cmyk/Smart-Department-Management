const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    default: 'Student'
  },
  targetType: {
    type: String,
    enum: ['Material', 'Staff Lecture'],
    default: 'Material'
  },
  targetTitle: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comments: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

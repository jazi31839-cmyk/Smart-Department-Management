const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  classSection: {
    type: String,
    required: [true, 'Class Section is required (e.g., II-IT-A, III-IT-B)'],
    trim: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    required: true
  },
  hourSlot: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  staffEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  staffName: {
    type: String,
    default: 'Faculty Member'
  },
  roomNo: {
    type: String,
    default: 'Lab 204'
  },
  isConflict: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Pending Approval', 'Rejected'],
    default: 'Active'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index to detect duplicate slot for staff or class section
timetableSchema.index({ day: 1, hourSlot: 1, staffEmail: 1 });
timetableSchema.index({ day: 1, hourSlot: 1, classSection: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);

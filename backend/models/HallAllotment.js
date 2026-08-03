const mongoose = require('mongoose');

const hallAllotmentSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: [true, 'Please add an exam name (e.g. Mid-Term Semester Test 2026)'],
    trim: true
  },
  classSection: {
    type: String,
    required: [true, 'Please add target class section (e.g. IV-IT-A, III-IT-B)'],
    trim: true
  },
  examHall: {
    type: String,
    required: [true, 'Please add exam hall/room designation (e.g. Hall 304 - IT Building)'],
    trim: true
  },
  examDate: {
    type: String,
    required: [true, 'Please add exam date'],
    trim: true
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add exam time slot (e.g. 10:00 AM - 01:00 PM)'],
    trim: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  invigilatorStaff: {
    type: String,
    default: 'Prof. Shruthi'
  },
  allocatedSeatsCount: {
    type: Number,
    default: 40
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HallAllotment', hallAllotmentSchema);

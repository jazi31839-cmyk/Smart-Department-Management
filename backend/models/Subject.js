const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a subject code (e.g., CS-301)'],
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    trim: true
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  classSection: {
    type: String,
    required: [true, 'Please add a target class section (e.g. II-IT-A, III-IT-B)'],
    trim: true
  },
  assignedStaffEmail: {
    type: String,
    required: [true, 'Please assign a staff member Gmail'],
    lowercase: true,
    trim: true
  },
  assignedStaffName: {
    type: String,
    default: 'Faculty Instructor'
  },
  credits: {
    type: Number,
    default: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);

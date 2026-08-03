const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classSection: {
    type: String,
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
  markedByStaff: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    default: 'Monday'
  },
  hourSlot: {
    type: Number,
    min: 1,
    max: 8,
    default: 1
  },
  records: [
    {
      studentEmail: { type: String, required: true },
      rollNumber: { type: String, required: true },
      studentName: { type: String, required: true },
      status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
    }
  ]
});

module.exports = mongoose.model('Attendance', attendanceSchema);

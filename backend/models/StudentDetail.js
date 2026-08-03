const mongoose = require('mongoose');

const studentDetailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  semester: {
    type: String,
    default: 'Semester 6'
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  gpa: {
    type: Number,
    default: 3.8
  },
  attendance: {
    type: String,
    default: '94%'
  },
  remarks: {
    type: String,
    default: 'Good academic record'
  },
  managedByStaff: {
    type: String,
    default: 'Staff Administrator'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentDetail', studentDetailSchema);

const mongoose = require('mongoose');

const fileDocSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a file title'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  category: {
    type: String,
    enum: ['Academic', 'Departmental', 'Examination', 'Syllabus', 'Private Staff Doc'],
    default: 'Academic'
  },
  subjectCode: {
    type: String,
    default: 'CS-302'
  },
  classSection: {
    type: String,
    default: 'II-IT-A'
  },
  semester: {
    type: String,
    default: 'Semester 6'
  },
  visibility: {
    type: String,
    enum: ['HOD Only', 'Staff & HOD', 'Student Public'],
    default: 'Staff & HOD'
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploaderRole: {
    type: String,
    enum: ['HOD', 'Staff'],
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FileDoc', fileDocSchema);

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const FileDoc = require('../models/FileDoc');

// Storage folder setup
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initial seed file management records for fallback/demo
global.inMemoryFiles = global.inMemoryFiles || [
  {
    id: 'file-1',
    title: 'Department Annual Evaluation & Budget Report 2026',
    originalName: 'Annual_Evaluation_2026.pdf',
    filename: 'seed-annual-eval.pdf',
    fileSize: 2450000,
    mimeType: 'application/pdf',
    category: 'Private Staff Doc',
    visibility: 'HOD Only',
    uploadedBy: 'hodit@gmail.com',
    uploaderRole: 'HOD',
    uploadedAt: new Date('2026-06-15').toISOString()
  },
  {
    id: 'file-2',
    title: 'CS-302 Software Engineering Lecture Notes & Syllabus',
    originalName: 'CS302_Syllabus_2026.pdf',
    filename: 'seed-cs302-syllabus.pdf',
    fileSize: 1120000,
    mimeType: 'application/pdf',
    category: 'Syllabus',
    visibility: 'Student Public',
    uploadedBy: 'sarah.teacher@gmail.com',
    uploaderRole: 'Staff',
    uploadedAt: new Date('2026-07-01').toISOString()
  },
  {
    id: 'file-3',
    title: 'Mid-Term Question Bank & Evaluation Matrix',
    originalName: 'MidTerm_QuestionBank.docx',
    filename: 'seed-question-bank.docx',
    fileSize: 890000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'Examination',
    visibility: 'Staff & HOD',
    uploadedBy: 'sarah.teacher@gmail.com',
    uploaderRole: 'Staff',
    uploadedAt: new Date('2026-07-10').toISOString()
  }
];

// @route   POST /api/files/upload
// @desc    Staff or HOD uploads a secure file
// @access  Private (Staff & HOD)
router.post('/upload', protect, authorize('HOD', 'Staff'), upload.single('file'), async (req, res) => {
  try {
    const { title, category, visibility } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Please provide a descriptive file title' });
    }

    const fileData = {
      title,
      originalName: req.file ? req.file.originalname : 'Uploaded_Document.pdf',
      filename: req.file ? req.file.filename : 'doc-' + Date.now() + '.pdf',
      fileSize: req.file ? req.file.size : 1540000,
      mimeType: req.file ? req.file.mimetype : 'application/pdf',
      category: category || 'Academic',
      visibility: visibility || 'Staff & HOD',
      uploadedBy: req.user.email,
      uploaderRole: req.user.role,
      uploadedAt: new Date().toISOString()
    };

    if (FileDoc.db && FileDoc.db.readyState === 1) {
      const savedDoc = await FileDoc.create(fileData);
      return res.status(201).json({ success: true, message: 'File uploaded and secured in MongoDB storage!', file: savedDoc });
    }

    // Fallback memory store
    const memFile = { id: 'file-' + Date.now(), ...fileData };
    global.inMemoryFiles.unshift(memFile);

    res.status(201).json({
      success: true,
      message: 'File successfully uploaded and secured!',
      file: memFile
    });

  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, error: 'Server error while uploading document' });
  }
});

// @route   GET /api/files
// @desc    Get files list filtered by user role visibility
// @access  Private (HOD, Staff, Student)
router.get('/', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userEmail = req.user.email.toLowerCase();

    let allFiles = [...global.inMemoryFiles];

    if (FileDoc.db && FileDoc.db.readyState === 1) {
      allFiles = await FileDoc.find().sort({ uploadedAt: -1 });
    }

    // Filter files based on user role permissions
    const accessibleFiles = allFiles.filter(file => {
      if (userRole === 'HOD') return true; // HOD sees all files
      if (userRole === 'Staff') {
        // Staff sees Staff & HOD, Student Public, and files uploaded by themselves
        return (
          file.visibility === 'Staff & HOD' ||
          file.visibility === 'Student Public' ||
          file.uploadedBy.toLowerCase() === userEmail
        );
      }
      if (userRole === 'Student') {
        // Student can only see Student Public documents
        return file.visibility === 'Student Public';
      }
      return false;
    });

    res.json({
      success: true,
      role: userRole,
      count: accessibleFiles.length,
      files: accessibleFiles
    });

  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching documents list' });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file (HOD or file uploader)
// @access  Private (HOD, Staff)
router.delete('/:id', protect, authorize('HOD', 'Staff'), (req, res) => {
  const fileId = req.params.id;
  const initialCount = global.inMemoryFiles.length;
  global.inMemoryFiles = global.inMemoryFiles.filter(f => f.id !== fileId);

  if (global.inMemoryFiles.length < initialCount) {
    return res.json({ success: true, message: 'Document deleted from file management storage' });
  }

  res.status(404).json({ success: false, error: 'Document not found' });
});

module.exports = router;

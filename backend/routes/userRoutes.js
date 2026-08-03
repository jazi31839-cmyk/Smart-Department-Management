const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const StudentDetail = require('../models/StudentDetail');

// Rich sample student details dataset for IV-IT-A
const sampleStudentsData = [
  {
    id: 'sd-1',
    userEmail: 'kiresh.student@gmail.com',
    studentName: 'Kiresh',
    rollNumber: 'IV-IT-001',
    classSection: 'IV-IT-A',
    semester: 'Semester 7',
    department: 'Information Technology',
    gpa: 3.88,
    attendance: '96%',
    remarks: 'Outstanding performance in Big Data Analytics and Cloud Security.',
    managedByStaff: 'Prof. Shruthi (shruthi.teacher@gmail.com)'
  },
  {
    id: 'sd-2',
    userEmail: 'dharun.student@gmail.com',
    studentName: 'Dharun',
    rollNumber: 'IV-IT-002',
    classSection: 'IV-IT-A',
    semester: 'Semester 7',
    department: 'Information Technology',
    gpa: 3.75,
    attendance: '92%',
    remarks: 'Strong analytical skills in Database Optimization.',
    managedByStaff: 'Prof. Shruthi (shruthi.teacher@gmail.com)'
  },
  {
    id: 'sd-3',
    userEmail: 'kamalesh.student@gmail.com',
    studentName: 'Kamalesh',
    rollNumber: 'IV-IT-003',
    classSection: 'IV-IT-A',
    semester: 'Semester 7',
    department: 'Information Technology',
    gpa: 3.91,
    attendance: '98%',
    remarks: 'Top department scorer in Full Stack Development.',
    managedByStaff: 'Prof. Shruthi (shruthi.teacher@gmail.com)'
  },
  {
    id: 'sd-4',
    userEmail: 'jazy.student@gmail.com',
    studentName: 'Jazy',
    rollNumber: 'IV-IT-004',
    classSection: 'IV-IT-A',
    semester: 'Semester 7',
    department: 'Information Technology',
    gpa: 3.68,
    attendance: '89%',
    remarks: 'Lead coordinator for National Tech Symposium.',
    managedByStaff: 'Prof. Shruthi (shruthi.teacher@gmail.com)'
  }
];

// Fallback in-memory storage for student details
global.inMemoryStudentDetails = global.inMemoryStudentDetails || [...sampleStudentsData];

// Ensure fallback in-memory users has corresponding student accounts
const sampleStudentUsers = sampleStudentsData.map(s => ({
  id: 'u-' + s.id,
  name: s.studentName,
  email: s.userEmail,
  passwordHash: bcrypt.hashSync('student123', 10),
  role: 'Student',
  department: s.department,
  createdBy: 'sarah.teacher@gmail.com'
}));

sampleStudentUsers.forEach(su => {
  if (!global.inMemoryUsers.find(u => u.email === su.email)) {
    global.inMemoryUsers.push(su);
  }
});

// Auto-seed MongoDB with sample students if DB is connected
const seedMongoStudents = async () => {
  try {
    if (User.db && User.db.readyState === 1) {
      const studentCount = await User.countDocuments({ role: 'Student' });
      if (studentCount === 0) {
        console.log('[Seeder] Populating sample student details into MongoDB...');
        for (const s of sampleStudentsData) {
          const createdUser = await User.create({
            name: s.studentName,
            email: s.userEmail,
            password: 'student123',
            role: 'Student',
            department: s.department,
            createdBy: 'sarah.teacher@gmail.com'
          });

          await StudentDetail.create({
            user: createdUser._id,
            studentEmail: s.userEmail,
            rollNumber: s.rollNumber,
            semester: s.semester,
            department: s.department,
            gpa: s.gpa,
            attendance: s.attendance,
            remarks: s.remarks,
            managedByStaff: s.managedByStaff
          });
        }
        console.log('[Seeder] Sample students successfully seeded in MongoDB!');
      }
    }
  } catch (err) {
    console.warn('[Seeder] Seed warning:', err.message);
  }
};

setTimeout(seedMongoStudents, 1500);

// ==========================================
// HOD MANAGED ROUTES
// HOD only can manage HOD logins & Staff logins
// ==========================================

// @route   POST /api/users/hod-manage/create
// @desc    HOD creates a new HOD or Staff account
// @access  Private (HOD Only)
router.post('/hod-manage/create', protect, authorize('HOD'), async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Please provide all required fields' });
  }

  if (role !== 'HOD' && role !== 'Staff') {
    return res.status(400).json({
      success: false,
      error: 'Security Policy Error: HOD is authorized to create HOD and Staff accounts only.'
    });
  }

  if (!email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({
      success: false,
      error: 'Gmail Validation Error: Account ID must be a valid @gmail.com address'
    });
  }

  try {
    if (User.db && User.db.readyState === 1) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, error: 'User with this Gmail address already exists' });
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        department: department || 'Computer Science & Engineering',
        createdBy: req.user.email
      });

      return res.status(201).json({
        success: true,
        message: `${role} account created successfully!`,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

    const existingMem = global.inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingMem) {
      return res.status(400).json({ success: false, error: 'User with this Gmail address already exists' });
    }

    const newMemUser = {
      id: 'u-' + Date.now(),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      department: department || 'Computer Science & Engineering',
      createdBy: req.user.email
    };

    global.inMemoryUsers.push(newMemUser);

    res.status(201).json({
      success: true,
      message: `${role} account created successfully!`,
      user: { id: newMemUser.id, name: newMemUser.name, email: newMemUser.email, role: newMemUser.role }
    });

  } catch (err) {
    console.error('HOD account creation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error creating user account' });
  }
});

// @route   GET /api/users/hod-manage/list
// @desc    Get all HOD and Staff logins managed by HOD
// @access  Private (HOD Only)
router.get('/hod-manage/list', protect, authorize('HOD'), async (req, res) => {
  try {
    if (User.db && User.db.readyState === 1) {
      const users = await User.find({ role: { $in: ['HOD', 'Staff'] } }).select('-password');
      return res.json({ success: true, count: users.length, users });
    }

    const memUsers = global.inMemoryUsers
      .filter(u => u.role === 'HOD' || u.role === 'Staff')
      .map(({ passwordHash, ...rest }) => rest);

    res.json({ success: true, count: memUsers.length, users: memUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch HOD/Staff management records' });
  }
});


// ==========================================
// STAFF MANAGED ROUTES
// Staff can manage Staff details & Student logins
// ==========================================

// @route   POST /api/users/staff-manage/create-student
// @desc    Staff creates a Student login & details profile
// @access  Private (Staff & HOD)
router.post('/staff-manage/create-student', protect, authorize('Staff', 'HOD'), async (req, res) => {
  const { name, email, password, rollNumber, semester, department, gpa, attendance, remarks } = req.body;

  if (!name || !email || !password || !rollNumber) {
    return res.status(400).json({ success: false, error: 'Please provide student name, Gmail, password, and roll number' });
  }

  if (!email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({
      success: false,
      error: 'Gmail Validation Error: Student User ID must end with @gmail.com'
    });
  }

  try {
    if (User.db && User.db.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'A user with this Gmail already exists' });
      }

      const studentUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'Student',
        department: department || 'Computer Science & Engineering',
        createdBy: req.user.email
      });

      const studentDetail = await StudentDetail.create({
        user: studentUser._id,
        studentEmail: email.toLowerCase(),
        rollNumber,
        semester: semester || 'Semester 6',
        department: department || 'Computer Science & Engineering',
        gpa: parseFloat(gpa) || 3.5,
        attendance: attendance || '90%',
        remarks: remarks || 'Created by Staff',
        managedByStaff: `${req.user.name} (${req.user.email})`
      });

      return res.status(201).json({
        success: true,
        message: 'Student account and academic record created successfully!',
        student: { user: studentUser, detail: studentDetail }
      });
    }

    // Fallback Memory Store
    const existingMem = global.inMemoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingMem) {
      return res.status(400).json({ success: false, error: 'A student account with this Gmail already exists' });
    }

    const newStudentUser = {
      id: 'u-' + Date.now(),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'Student',
      department: department || 'Computer Science & Engineering',
      createdBy: req.user.email
    };
    global.inMemoryUsers.push(newStudentUser);

    const newStudentDetail = {
      id: 'sd-' + Date.now(),
      userEmail: email.toLowerCase(),
      studentName: name,
      rollNumber,
      semester: semester || 'Semester 6',
      department: department || 'Computer Science & Engineering',
      gpa: parseFloat(gpa) || 3.5,
      attendance: attendance || '90%',
      remarks: remarks || 'Created by Staff Administrator',
      managedByStaff: `${req.user.name} (${req.user.email})`
    };
    global.inMemoryStudentDetails.push(newStudentDetail);

    res.status(201).json({
      success: true,
      message: 'Student account and academic record created successfully!',
      student: newStudentDetail
    });

  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error creating student account' });
  }
});

// @route   PUT /api/users/staff-manage/update-student/:id
// @desc    Staff updates existing student academic details
// @access  Private (Staff & HOD)
router.put('/staff-manage/update-student/:id', protect, authorize('Staff', 'HOD'), async (req, res) => {
  const targetId = req.params.id;
  const { semester, gpa, attendance, remarks } = req.body;

  try {
    if (User.db && User.db.readyState === 1) {
      const updatedDoc = await StudentDetail.findByIdAndUpdate(
        targetId,
        {
          ...(semester && { semester }),
          ...(gpa && { gpa: parseFloat(gpa) }),
          ...(attendance && { attendance }),
          ...(remarks && { remarks }),
          updatedAt: Date.now()
        },
        { new: true }
      ).populate('user', 'name email role department');

      if (updatedDoc) {
        return res.json({ success: true, message: 'Student academic record updated!', student: updatedDoc });
      }
    }

    // Memory Store update
    const index = global.inMemoryStudentDetails.findIndex(s => s.id === targetId || s._id === targetId);
    if (index !== -1) {
      if (semester) global.inMemoryStudentDetails[index].semester = semester;
      if (gpa) global.inMemoryStudentDetails[index].gpa = parseFloat(gpa);
      if (attendance) global.inMemoryStudentDetails[index].attendance = attendance;
      if (remarks) global.inMemoryStudentDetails[index].remarks = remarks;

      return res.json({
        success: true,
        message: 'Student academic record updated successfully!',
        student: global.inMemoryStudentDetails[index]
      });
    }

    res.status(404).json({ success: false, error: 'Student record not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update student details' });
  }
});

// @route   GET /api/users/staff-manage/list-students
// @desc    Staff gets all Student accounts & academic details
// @access  Private (Staff & HOD)
router.get('/staff-manage/list-students', protect, authorize('Staff', 'HOD'), async (req, res) => {
  try {
    if (User.db && User.db.readyState === 1) {
      const details = await StudentDetail.find().populate('user', 'name email role department');
      if (details && details.length > 0) {
        return res.json({ success: true, count: details.length, students: details });
      }
    }

    res.json({ success: true, count: global.inMemoryStudentDetails.length, students: global.inMemoryStudentDetails });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch student details list' });
  }
});


// ==========================================
// STUDENT REVIEW ROUTE
// Student User login can only review Student Details
// ==========================================

// @route   GET /api/users/student/my-details
// @desc    Student reviews their own personal student details
// @access  Private (Student, Staff, HOD)
router.get('/student/my-details', protect, (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();

    // Check memory or MongoDB
    const studentRecord = global.inMemoryStudentDetails.find(
      sd => sd.userEmail.toLowerCase() === userEmail
    ) || global.inMemoryStudentDetails[0];

    res.json({
      success: true,
      rolePermission: 'Read-Only (Student Review Access)',
      user: req.user,
      studentDetails: studentRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve student details record' });
  }
});

module.exports = router;

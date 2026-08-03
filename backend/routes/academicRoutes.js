const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const StudentDetail = require('../models/StudentDetail');
const FileDoc = require('../models/FileDoc');

// In-Memory dataset fallbacks
global.inMemorySubjects = global.inMemorySubjects || [
  { id: 'sub-1', code: 'CS-301', name: 'Software Engineering', department: 'Computer Science & Engineering', classSection: 'IV-IT-A', assignedStaffEmail: 'sarah.teacher@gmail.com', assignedStaffName: 'Prof. Sarah Jenkins', credits: 4 },
  { id: 'sub-2', code: 'CS-302', name: 'Database Management Systems', department: 'Computer Science & Engineering', classSection: 'IV-IT-A', assignedStaffEmail: 'sarah.teacher@gmail.com', assignedStaffName: 'Prof. Sarah Jenkins', credits: 4 },
  { id: 'sub-3', code: 'IT-401', name: 'Cloud Computing Architecture', department: 'Computer Science & Engineering', classSection: 'III-IT-B', assignedStaffEmail: 'sarah.teacher@gmail.com', assignedStaffName: 'Prof. Sarah Jenkins', credits: 3 },
  { id: 'sub-4', code: 'IT-402', name: 'Artificial Intelligence & Neural Networks', department: 'Computer Science & Engineering', classSection: 'III-IT-B', assignedStaffEmail: 'sarah.teacher@gmail.com', assignedStaffName: 'Prof. Sarah Jenkins', credits: 4 },
  { id: 'sub-5', code: 'IT-305', name: 'Big Data Analytics', department: 'Information Technology', classSection: 'IV-IT-A', assignedStaffEmail: 'shruthi.teacher@gmail.com', assignedStaffName: 'Prof. Shruthi', credits: 4 }
];

global.inMemoryNotices = global.inMemoryNotices || [
  {
    id: 'not-1',
    title: 'Upcoming Parent-Teacher Meeting (PTM)',
    content: 'Tomorrow is a Parents-Teachers Meeting (PTM) starting at 10:00 AM in the Main Auditorium. So kindly bring your parents for the academic performance discussion.',
    category: 'Meeting',
    authorName: 'Dr. Robert Vance (HOD)',
    authorEmail: 'hodit@gmail.com',
    authorRole: 'HOD',
    targetAudience: 'All Department Students & Staff',
    createdAt: new Date().toISOString()
  },
  {
    id: 'not-2',
    title: 'Mid-Semester Big Data Project Submission',
    content: 'All IV-IT-A students must submit their Big Data Analytics project documentation by Friday to Prof. Shruthi.',
    category: 'General',
    authorName: 'Prof. Shruthi',
    authorEmail: 'shruthi.teacher@gmail.com',
    authorRole: 'Staff',
    targetAudience: 'IV-IT-A Section',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

global.inMemoryTimetables = global.inMemoryTimetables || [
  // Monday
  { id: 'tt-1', classSection: 'IV-IT-A', day: 'Monday', hourSlot: 1, subjectCode: 'CS-301', subjectName: 'Software Engineering', staffEmail: 'sarah.teacher@gmail.com', staffName: 'Prof. Sarah Jenkins', roomNo: 'Lab 204', isConflict: false, status: 'Active' },
  { id: 'tt-2', classSection: 'IV-IT-A', day: 'Monday', hourSlot: 2, subjectCode: 'IT-305', subjectName: 'Big Data Analytics', staffEmail: 'shruthi.teacher@gmail.com', staffName: 'Prof. Shruthi', roomNo: 'Lab 301', isConflict: false, status: 'Active' },
  { id: 'tt-3', classSection: 'III-IT-B', day: 'Monday', hourSlot: 3, subjectCode: 'IT-401', subjectName: 'Cloud Computing Architecture', staffEmail: 'sarah.teacher@gmail.com', staffName: 'Prof. Sarah Jenkins', roomNo: 'Hall 102', isConflict: false, status: 'Active' },
  
  // Tuesday
  { id: 'tt-4', classSection: 'III-IT-B', day: 'Tuesday', hourSlot: 1, subjectCode: 'IT-402', subjectName: 'Artificial Intelligence', staffEmail: 'sarah.teacher@gmail.com', staffName: 'Prof. Sarah Jenkins', roomNo: 'Hall 102', isConflict: false, status: 'Active' },
  { id: 'tt-5', classSection: 'IV-IT-A', day: 'Tuesday', hourSlot: 4, subjectCode: 'IT-305', subjectName: 'Big Data Analytics', staffEmail: 'shruthi.teacher@gmail.com', staffName: 'Prof. Shruthi', roomNo: 'Lab 301', isConflict: false, status: 'Active' },

  // Wednesday
  { id: 'tt-6', classSection: 'IV-IT-A', day: 'Wednesday', hourSlot: 2, subjectCode: 'CS-302', subjectName: 'Database Systems', staffEmail: 'sarah.teacher@gmail.com', staffName: 'Prof. Sarah Jenkins', roomNo: 'Lab 204', isConflict: false, status: 'Active' },
  { id: 'tt-7', classSection: 'III-IT-B', day: 'Wednesday', hourSlot: 5, subjectCode: 'IT-401', subjectName: 'Cloud Computing', staffEmail: 'sarah.teacher@gmail.com', staffName: 'Prof. Sarah Jenkins', roomNo: 'Hall 102', isConflict: false, status: 'Active' }
];

global.inMemoryHallAllotments = global.inMemoryHallAllotments || [
  {
    id: 'hall-1',
    examName: 'Mid-Term Semester Test 2026',
    classSection: 'IV-IT-A',
    examHall: 'Exam Hall 304 (IT Block)',
    examDate: '2026-08-10',
    timeSlot: '10:00 AM - 01:00 PM',
    subjectCode: 'IT-305 Big Data Analytics',
    invigilatorStaff: 'Prof. Shruthi',
    allocatedSeatsCount: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'hall-2',
    examName: 'Mid-Term Semester Test 2026',
    classSection: 'III-IT-B',
    examHall: 'Main Auditorium Hall B',
    examDate: '2026-08-11',
    timeSlot: '02:00 PM - 05:00 PM',
    subjectCode: 'IT-401 Cloud Computing',
    invigilatorStaff: 'Prof. Sarah Jenkins',
    allocatedSeatsCount: 60,
    createdAt: new Date().toISOString()
  }
];

global.inMemoryTimetableRequests = global.inMemoryTimetableRequests || [
  {
    id: 'ttr-1',
    staffEmail: 'sarah.teacher@gmail.com',
    staffName: 'Prof. Sarah Jenkins',
    classSection: 'II-IT-A',
    currentSlot: 'Monday - Hour 1 (CS-301)',
    proposedSlot: 'Thursday - Hour 3 (CS-301)',
    reason: 'Department Faculty Workshop',
    status: 'Pending Approval',
    createdAt: new Date().toISOString()
  }
];

global.inMemoryFeedbacks = global.inMemoryFeedbacks || [
  {
    id: 'fb-1',
    studentEmail: 'alex.student@gmail.com',
    studentName: 'Alex Johnson',
    targetType: 'Material',
    targetTitle: 'CS-302 Database Management Systems Lecture Notes',
    rating: 5,
    comments: 'Very clear explanation of normalization and index optimization!',
    createdAt: new Date().toISOString()
  }
];

// ==========================================
// 1. SUBJECT ASSIGNMENT (HOD MODULE)
// ==========================================

// @route   POST /api/academic/subjects/assign
// @desc    HOD assigns subject to staff member
// @access  Private (HOD Only)
router.post('/subjects/assign', protect, authorize('HOD'), async (req, res) => {
  const { code, name, classSection, assignedStaffEmail, assignedStaffName, credits } = req.body;

  if (!code || !name || !classSection || !assignedStaffEmail) {
    return res.status(400).json({ success: false, error: 'Subject code, title, section, and assigned staff are required.' });
  }

  try {
    if (Subject.db && Subject.db.readyState === 1) {
      const existing = await Subject.findOne({ code: code.toUpperCase() });
      if (existing) {
        existing.assignedStaffEmail = assignedStaffEmail.toLowerCase();
        existing.assignedStaffName = assignedStaffName || existing.assignedStaffName;
        existing.classSection = classSection;
        await existing.save();
        return res.json({ success: true, message: `Subject ${code} updated and assigned to ${assignedStaffEmail}`, subject: existing });
      }

      const newSub = await Subject.create({
        code: code.toUpperCase(),
        name,
        classSection,
        assignedStaffEmail: assignedStaffEmail.toLowerCase(),
        assignedStaffName: assignedStaffName || 'Faculty Instructor',
        credits: credits || 4
      });

      return res.status(201).json({ success: true, message: `Subject ${code} created and assigned to ${assignedStaffEmail}`, subject: newSub });
    }

    // Memory Fallback
    const existingMem = global.inMemorySubjects.find(s => s.code.toUpperCase() === code.toUpperCase());
    if (existingMem) {
      existingMem.assignedStaffEmail = assignedStaffEmail.toLowerCase();
      existingMem.assignedStaffName = assignedStaffName || existingMem.assignedStaffName;
      existingMem.classSection = classSection;
      return res.json({ success: true, message: `Subject ${code} updated and assigned!`, subject: existingMem });
    }

    const newMemSub = {
      id: 'sub-' + Date.now(),
      code: code.toUpperCase(),
      name,
      classSection,
      assignedStaffEmail: assignedStaffEmail.toLowerCase(),
      assignedStaffName: assignedStaffName || 'Faculty Instructor',
      credits: credits || 4
    };
    global.inMemorySubjects.push(newMemSub);

    res.status(201).json({ success: true, message: `Subject ${code} assigned successfully!`, subject: newMemSub });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Error assigning subject' });
  }
});

// @route   GET /api/academic/subjects/list
// @desc    Get assigned subjects for HOD or logged in Staff
// @access  Private (HOD, Staff, Student)
router.get('/subjects/list', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userEmail = req.user.email.toLowerCase();

    let allSubs = [...global.inMemorySubjects];
    if (Subject.db && Subject.db.readyState === 1) {
      allSubs = await Subject.find();
    }

    if (userRole === 'Staff') {
      allSubs = allSubs.filter(s => s.assignedStaffEmail.toLowerCase() === userEmail);
    }

    res.json({ success: true, count: allSubs.length, subjects: allSubs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error loading subjects list' });
  }
});


// ==========================================
// 2. TIMETABLE GRID & CONFLICT DETECTION (HOD & STAFF MODULE)
// ==========================================

// Helper: Conflict Detection Engine
const detectConflict = (day, hourSlot, staffEmail, classSection, currentSlotId = null) => {
  const allSlots = global.inMemoryTimetables;

  // Check 1: Is staff already teaching another class section at the same day & hour?
  const staffConflict = allSlots.find(s => 
    s.id !== currentSlotId &&
    s.day === day &&
    s.hourSlot === Number(hourSlot) &&
    s.staffEmail.toLowerCase() === staffEmail.toLowerCase() &&
    s.status !== 'Rejected'
  );

  if (staffConflict) {
    return {
      hasConflict: true,
      reason: `Staff Double-Booking Alert: ${staffEmail} is already assigned to section '${staffConflict.classSection}' for subject '${staffConflict.subjectName}' on ${day} Hour ${hourSlot}.`
    };
  }

  // Check 2: Is class section already occupied at the same day & hour?
  const sectionConflict = allSlots.find(s =>
    s.id !== currentSlotId &&
    s.day === day &&
    s.hourSlot === Number(hourSlot) &&
    s.classSection === classSection &&
    s.status !== 'Rejected'
  );

  if (sectionConflict) {
    return {
      hasConflict: true,
      reason: `Section Overlap Alert: Class '${classSection}' already has '${sectionConflict.subjectName}' scheduled with ${sectionConflict.staffName} on ${day} Hour ${hourSlot}.`
    };
  }

  return { hasConflict: false };
};

// @route   GET /api/academic/timetable
// @desc    Get timetable grid slots (filter by section or staff)
// @access  Private
router.get('/timetable', protect, (req, res) => {
  const { classSection, staffEmail } = req.query;

  let slots = [...global.inMemoryTimetables];

  if (classSection) {
    slots = slots.filter(s => s.classSection === classSection);
  } else if (staffEmail) {
    slots = slots.filter(s => s.staffEmail.toLowerCase() === staffEmail.toLowerCase());
  }

  res.json({ success: true, count: slots.length, slots });
});

// @route   POST /api/academic/timetable/slot
// @desc    Create/Update timetable slot with Conflict Engine validation
// @access  Private (HOD Only)
router.post('/timetable/slot', protect, authorize('HOD'), (req, res) => {
  const { classSection, day, hourSlot, subjectCode, subjectName, staffEmail, staffName, roomNo } = req.body;

  if (!classSection || !day || !hourSlot || !subjectCode || !staffEmail) {
    return res.status(400).json({ success: false, error: 'Section, Day, Hour Slot, Subject, and Staff Email are required.' });
  }

  // Run Conflict Engine
  const conflictResult = detectConflict(day, Number(hourSlot), staffEmail, classSection);

  if (conflictResult.hasConflict) {
    return res.status(409).json({
      success: false,
      conflictFlag: true,
      error: conflictResult.reason
    });
  }

  // Create slot
  const newSlot = {
    id: 'tt-' + Date.now(),
    classSection,
    day,
    hourSlot: Number(hourSlot),
    subjectCode: subjectCode.toUpperCase(),
    subjectName: subjectName || subjectCode,
    staffEmail: staffEmail.toLowerCase(),
    staffName: staffName || 'Faculty Instructor',
    roomNo: roomNo || 'Lab 204',
    isConflict: false,
    status: 'Active'
  };

  global.inMemoryTimetables.push(newSlot);

  res.status(201).json({
    success: true,
    message: `Timetable slot added for ${classSection} on ${day} Hour ${hourSlot}`,
    slot: newSlot
  });
});

// @route   POST /api/academic/timetable/request-swap
// @desc    Staff submits timetable change request for HOD approval
// @access  Private (Staff)
router.post('/timetable/request-swap', protect, authorize('Staff'), (req, res) => {
  const { classSection, currentSlot, proposedSlot, reason } = req.body;

  if (!classSection || !currentSlot || !proposedSlot) {
    return res.status(400).json({ success: false, error: 'Please specify current slot, proposed slot, and reason.' });
  }

  const newRequest = {
    id: 'ttr-' + Date.now(),
    staffEmail: req.user.email,
    staffName: req.user.name,
    classSection,
    currentSlot,
    proposedSlot,
    reason: reason || 'Timetable schedule adjustment',
    status: 'Pending Approval',
    createdAt: new Date().toISOString()
  };

  global.inMemoryTimetableRequests.unshift(newRequest);

  res.status(201).json({
    success: true,
    message: 'Timetable change request submitted to HOD approval inbox!',
    request: newRequest
  });
});

// @route   GET /api/academic/timetable/pending-requests
// @desc    HOD views pending timetable change requests
// @access  Private (HOD Only)
router.get('/timetable/pending-requests', protect, authorize('HOD'), (req, res) => {
  res.json({
    success: true,
    count: global.inMemoryTimetableRequests.length,
    requests: global.inMemoryTimetableRequests
  });
});

// @route   POST /api/academic/timetable/approve-request/:id
// @desc    HOD approves or rejects timetable change request
// @access  Private (HOD Only)
router.post('/timetable/approve-request/:id', protect, authorize('HOD'), (req, res) => {
  const reqId = req.params.id;
  const { decision } = req.body; // 'Approve' or 'Reject'

  const request = global.inMemoryTimetableRequests.find(r => r.id === reqId);
  if (!request) {
    return res.status(404).json({ success: false, error: 'Request not found' });
  }

  request.status = decision === 'Approve' ? 'Approved' : 'Rejected';

  res.json({
    success: true,
    message: `Timetable request ${decision === 'Approve' ? 'Approved' : 'Rejected'} successfully!`,
    request
  });
});


// ==========================================
// 3. ATTENDANCE MARKING MODULE (STAFF MODULE)
// ==========================================

// @route   GET /api/academic/attendance/sheets
// @desc    Get attendance form sheets for a teacher/class/subject
// @access  Private (Staff & HOD)
router.get('/attendance/sheets', protect, authorize('Staff', 'HOD'), async (req, res) => {
  try {
    const { classSection, subjectCode, day } = req.query;
    const userRole = req.user.role;
    const userEmail = req.user.email.toLowerCase();

    let query = {};
    if (classSection) query.classSection = classSection;
    if (subjectCode) query.subjectCode = subjectCode;
    if (day) query.day = day;

    if (userRole === 'Staff') {
      query.markedByStaff = userEmail;
    }

    if (Attendance.db && Attendance.db.readyState === 1) {
      const sheets = await Attendance.find(query).sort({ date: -1 });
      return res.json({ success: true, count: sheets.length, sheets });
    }

    // In-memory fallback
    let memSheets = global.inMemoryAttendanceSheets || [];
    if (classSection) memSheets = memSheets.filter(s => s.classSection === classSection);
    if (subjectCode) memSheets = memSheets.filter(s => s.subjectCode === subjectCode);
    if (userRole === 'Staff') memSheets = memSheets.filter(s => s.markedByStaff.toLowerCase() === userEmail);

    res.json({ success: true, count: memSheets.length, sheets: memSheets });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch attendance form sheets' });
  }
});

// @route   POST /api/academic/attendance/mark
// @desc    Staff marks attendance for a specific class session (Assigned Teacher ONLY)
// @access  Private (Staff & HOD)
router.post('/attendance/mark', protect, authorize('Staff', 'HOD'), async (req, res) => {
  const { classSection, subjectCode, subjectName, day, hourSlot, records } = req.body;

  if (!classSection || !subjectCode || !records || !Array.isArray(records)) {
    return res.status(400).json({ success: false, error: 'Class Section, Subject Code, and attendance records list are required.' });
  }

  const userRole = req.user.role;
  const userEmail = req.user.email.toLowerCase();
  const userName = req.user.name;

  try {
    // 1. Verify Teacher Authorization for this Subject/Class Section
    let assignedStaffEmail = null;
    let assignedStaffName = null;

    if (Subject.db && Subject.db.readyState === 1) {
      const targetSubject = await Subject.findOne({ code: subjectCode.toUpperCase() });
      if (targetSubject) {
        assignedStaffEmail = targetSubject.assignedStaffEmail.toLowerCase();
        assignedStaffName = targetSubject.assignedStaffName;
      }
    }

    if (!assignedStaffEmail) {
      const memSub = global.inMemorySubjects.find(s => s.code.toUpperCase() === subjectCode.toUpperCase());
      if (memSub) {
        assignedStaffEmail = memSub.assignedStaffEmail.toLowerCase();
        assignedStaffName = memSub.assignedStaffName;
      }
    }

    // Enforce rule: Attendance for a subject can ONLY be modified by assigned teacher or HOD
    if (userRole === 'Staff' && assignedStaffEmail && assignedStaffEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Attendance form sheet for ${subjectCode} (${classSection}) can ONLY be modified by the assigned teacher (${assignedStaffName || assignedStaffEmail}) for their scheduled hour slots.`
      });
    }

    // 2. Persist in MongoDB if active
    if (Attendance.db && Attendance.db.readyState === 1) {
      await Attendance.create({
        classSection,
        subjectCode: subjectCode.toUpperCase(),
        subjectName: subjectName || subjectCode,
        markedByStaff: userEmail,
        day: day || 'Monday',
        hourSlot: Number(hourSlot) || 1,
        date: new Date(),
        records
      });

      // Update student details attendance percentages in MongoDB
      for (const rec of records) {
        const studentDetail = await StudentDetail.findOne({ studentEmail: rec.studentEmail.toLowerCase() });
        if (studentDetail) {
          const currentVal = parseInt(studentDetail.attendance) || 90;
          const updatedVal = rec.status === 'Present' ? Math.min(100, currentVal + 1) : Math.max(50, currentVal - 2);
          studentDetail.attendance = `${updatedVal}%`;
          await studentDetail.save();
        }
      }
    }

    // 3. Update in-memory storage fallback
    records.forEach(rec => {
      const student = global.inMemoryStudentDetails.find(
        s => s.userEmail && s.userEmail.toLowerCase() === rec.studentEmail.toLowerCase()
      );
      if (student) {
        const currentVal = parseInt(student.attendance) || 90;
        const updatedVal = rec.status === 'Present' ? Math.min(100, currentVal + 1) : Math.max(50, currentVal - 2);
        student.attendance = `${updatedVal}%`;
      }
    });

    global.inMemoryAttendanceSheets = global.inMemoryAttendanceSheets || [];
    global.inMemoryAttendanceSheets.unshift({
      id: 'att-' + Date.now(),
      classSection,
      subjectCode: subjectCode.toUpperCase(),
      subjectName: subjectName || subjectCode,
      markedByStaff: userEmail,
      markedByStaffName: userName,
      day: day || 'Monday',
      hourSlot: Number(hourSlot) || 1,
      date: new Date().toISOString(),
      records
    });

    res.json({
      success: true,
      message: `Attendance sheet updated successfully for teacher ${userName} (${records.length} students recorded for ${classSection} - ${subjectCode})!`
    });

  } catch (err) {
    console.error('Mark attendance error:', err);
    res.status(500).json({ success: false, error: err.message || 'Error updating attendance sheet' });
  }
});


// ==========================================
// 4. STUDENT FEEDBACK MODULE (STUDENT MODULE)
// ==========================================

// @route   POST /api/academic/feedback/submit
// @desc    Student submits rating and review for materials or staff
// @access  Private (Student)
router.post('/feedback/submit', protect, authorize('Student'), (req, res) => {
  const { targetType, targetTitle, rating, comments } = req.body;

  if (!targetTitle || !rating) {
    return res.status(400).json({ success: false, error: 'Material/Lecture title and star rating are required.' });
  }

  const newFeedback = {
    id: 'fb-' + Date.now(),
    studentEmail: req.user.email,
    studentName: req.user.name,
    targetType: targetType || 'Material',
    targetTitle,
    rating: Number(rating),
    comments: comments || 'Good material',
    createdAt: new Date().toISOString()
  };

  global.inMemoryFeedbacks.unshift(newFeedback);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your feedback and rating have been recorded.',
    feedback: newFeedback
  });
});

// @route   GET /api/academic/feedback/list
// @desc    Get all feedback entries
// @access  Private
router.get('/feedback/list', protect, (req, res) => {
  res.json({
    success: true,
    count: global.inMemoryFeedbacks.length,
    feedbacks: global.inMemoryFeedbacks
  });
});


// ==========================================
// 5. OVERALL DEPARTMENT REPORT (HOD MODULE)
// ==========================================

// @route   GET /api/academic/department-report
// @desc    HOD views overall department KPI metrics
// @access  Private (HOD Only)
router.get('/department-report', protect, authorize('HOD'), (req, res) => {
  const totalStudents = global.inMemoryStudentDetails.length;
  const totalStaff = global.inMemoryUsers.filter(u => u.role === 'Staff').length;
  const totalFiles = global.inMemoryFiles.length;

  // Calculate average attendance
  let totalAtt = 0;
  global.inMemoryStudentDetails.forEach(s => {
    totalAtt += parseInt(s.attendance) || 90;
  });
  const avgAttendance = totalStudents > 0 ? (totalAtt / totalStudents).toFixed(1) + '%' : '92%';

  // Count active timetable slots and conflict alerts
  const totalSlots = global.inMemoryTimetables.length;
  const conflictsCount = global.inMemoryTimetables.filter(s => s.isConflict).length;
  const pendingRequestsCount = global.inMemoryTimetablesRequests ? global.inMemoryTimetableRequests.filter(r => r.status === 'Pending Approval').length : 1;

  res.json({
    success: true,
    report: {
      department: 'Computer Science & Engineering',
      avgAttendance,
      totalStudents,
      totalStaff,
      totalFilesUploaded: totalFiles,
      totalTimetableSlots: totalSlots,
      timetableConflicts: conflictsCount,
      pendingTimetableRequests: pendingRequestsCount
    }
  });
});

// ==========================================
// 6. NOTICE BOARD MODULE (HOD & STAFF OPERATED)
// ==========================================
const Notice = require('../models/Notice');

// @route   GET /api/academic/notices/list
// @desc    Get all department notices
// @access  Private (HOD, Staff, Student)
router.get('/notices/list', protect, async (req, res) => {
  try {
    if (Notice.db && Notice.db.readyState === 1) {
      const dbNotices = await Notice.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: dbNotices.length, notices: dbNotices });
    }
    res.json({ success: true, count: global.inMemoryNotices.length, notices: global.inMemoryNotices });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching notice board updates' });
  }
});

// @route   POST /api/academic/notices/create
// @desc    HOD & Staff create notice board update
// @access  Private (HOD, Staff)
router.post('/notices/create', protect, authorize('HOD', 'Staff'), async (req, res) => {
  const { title, content, category, targetAudience } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Notice title and message content are required.' });
  }

  try {
    const noticeObj = {
      title,
      content,
      category: category || 'General',
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorRole: req.user.role,
      targetAudience: targetAudience || 'All Department',
      createdAt: new Date()
    };

    if (Notice.db && Notice.db.readyState === 1) {
      const createdNotice = await Notice.create(noticeObj);
      return res.status(201).json({ success: true, message: 'Notice posted successfully to Notice Board!', notice: createdNotice });
    }

    const newMemNotice = {
      id: 'not-' + Date.now(),
      ...noticeObj,
      createdAt: new Date().toISOString()
    };
    global.inMemoryNotices.unshift(newMemNotice);

    res.status(201).json({ success: true, message: 'Notice posted successfully to Notice Board!', notice: newMemNotice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Error posting notice' });
  }
});

// @route   PUT /api/academic/notices/:id
// @desc    Edit/Update notice board entry
// @access  Private (HOD, Staff)
router.put('/notices/:id', protect, authorize('HOD', 'Staff'), async (req, res) => {
  const noticeId = req.params.id;
  const { title, content, category, targetAudience } = req.body;

  try {
    if (Notice.db && Notice.db.readyState === 1) {
      const updatedNotice = await Notice.findByIdAndUpdate(
        noticeId,
        { title, content, category, targetAudience },
        { new: true }
      );
      return res.json({ success: true, message: 'Notice updated successfully!', notice: updatedNotice });
    }

    const memNotice = global.inMemoryNotices.find(n => n.id === noticeId);
    if (memNotice) {
      memNotice.title = title || memNotice.title;
      memNotice.content = content || memNotice.content;
      memNotice.category = category || memNotice.category;
      memNotice.targetAudience = targetAudience || memNotice.targetAudience;
      return res.json({ success: true, message: 'Notice updated successfully!', notice: memNotice });
    }

    res.status(404).json({ success: false, error: 'Notice not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update notice' });
  }
});

// @route   DELETE /api/academic/notices/:id
// @desc    Delete notice board entry
// @access  Private (HOD, Staff)
router.delete('/notices/:id', protect, authorize('HOD', 'Staff'), async (req, res) => {
  const noticeId = req.params.id;
  try {
    if (Notice.db && Notice.db.readyState === 1) {
      await Notice.findByIdAndDelete(noticeId);
      return res.json({ success: true, message: 'Notice deleted successfully' });
    }
    global.inMemoryNotices = global.inMemoryNotices.filter(n => n.id !== noticeId);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete notice' });
  }
});


// ==========================================
// 7. HOD STUDENT ATTENDANCE REVIEW MODULE
// ==========================================

// @route   GET /api/academic/hod/student-attendances
// @desc    HOD views overall student attendance list
// @access  Private (HOD Only)
router.get('/hod/student-attendances', protect, authorize('HOD'), async (req, res) => {
  try {
    let studentsList = [];
    if (StudentDetail.db && StudentDetail.db.readyState === 1) {
      studentsList = await StudentDetail.find().populate('user', 'name email department');
    } else {
      studentsList = global.inMemoryStudentDetails;
    }

    res.json({
      success: true,
      count: studentsList.length,
      students: studentsList
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error loading student attendance records' });
  }
});

// ==========================================
// 8. HALL ALLOTMENT FOR EXAM TESTS (HOD MODULE)
// ==========================================
const HallAllotment = require('../models/HallAllotment');

// @route   GET /api/academic/halls/list
// @desc    Get all exam hall allotments
// @access  Private (HOD, Staff, Student)
router.get('/halls/list', protect, async (req, res) => {
  try {
    if (HallAllotment.db && HallAllotment.db.readyState === 1) {
      const dbHalls = await HallAllotment.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: dbHalls.length, allotments: dbHalls });
    }
    res.json({ success: true, count: global.inMemoryHallAllotments.length, allotments: global.inMemoryHallAllotments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error loading exam hall allotments' });
  }
});

// @route   POST /api/academic/halls/allocate
// @desc    HOD creates new exam hall allotment
// @access  Private (HOD Only)
router.post('/halls/allocate', protect, authorize('HOD'), async (req, res) => {
  const { examName, classSection, examHall, examDate, timeSlot, subjectCode, invigilatorStaff, allocatedSeatsCount } = req.body;

  if (!examName || !classSection || !examHall || !examDate || !timeSlot || !subjectCode) {
    return res.status(400).json({ success: false, error: 'Exam title, class section, hall name, date, time slot, and subject are required.' });
  }

  try {
    const hallObj = {
      examName,
      classSection,
      examHall,
      examDate,
      timeSlot,
      subjectCode,
      invigilatorStaff: invigilatorStaff || 'Faculty Invigilator',
      allocatedSeatsCount: Number(allocatedSeatsCount) || 40,
      createdAt: new Date()
    };

    if (HallAllotment.db && HallAllotment.db.readyState === 1) {
      const createdHall = await HallAllotment.create(hallObj);
      return res.status(201).json({ success: true, message: `Exam hall ${examHall} successfully allocated for ${classSection}!`, allotment: createdHall });
    }

    const newMemHall = {
      id: 'hall-' + Date.now(),
      ...hallObj,
      createdAt: new Date().toISOString()
    };
    global.inMemoryHallAllotments.unshift(newMemHall);

    res.status(201).json({ success: true, message: `Exam hall ${examHall} successfully allocated for ${classSection}!`, allotment: newMemHall });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Error allocating exam hall' });
  }
});

// @route   DELETE /api/academic/halls/:id
// @desc    HOD removes an exam hall allotment
// @access  Private (HOD Only)
router.delete('/halls/:id', protect, authorize('HOD'), async (req, res) => {
  const hallId = req.params.id;
  try {
    if (HallAllotment.db && HallAllotment.db.readyState === 1) {
      await HallAllotment.findByIdAndDelete(hallId);
      return res.json({ success: true, message: 'Hall allotment deleted' });
    }
    global.inMemoryHallAllotments = global.inMemoryHallAllotments.filter(h => h.id !== hallId);
    res.json({ success: true, message: 'Hall allotment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete hall allotment' });
  }
});

module.exports = router;

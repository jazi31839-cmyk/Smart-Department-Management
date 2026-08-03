const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const StudentDetail = require('../models/StudentDetail');

const seedTeachers = [
  {
    name: 'Ezhilarasi',
    email: 'ezhilarasi.teacher@gmail.com',
    password: 'staff123',
    role: 'Staff',
    department: 'Information Technology'
  },
  {
    name: 'Priyadharshini',
    email: 'priyadharshini.teacher@gmail.com',
    password: 'staff123',
    role: 'Staff',
    department: 'Information Technology'
  },
  {
    name: 'Ganesh kumar',
    email: 'ganeshkumar.teacher@gmail.com',
    password: 'staff123',
    role: 'Staff',
    department: 'Computer Science & Engineering'
  },
  {
    name: 'Nagul',
    email: 'nagul.teacher@gmail.com',
    password: 'staff123',
    role: 'Staff',
    department: 'Information Technology'
  }
];

const seedStudents = [
  // Section II-IT-A
  { name: 'Kiresh', email: 'kiresh.student@gmail.com', rollNumber: 'II-IT-001', classSection: 'II-IT-A', gpa: 3.88, attendance: '96%', remarks: 'Top academic performance' },
  { name: 'Dharun', email: 'dharun.student@gmail.com', rollNumber: 'II-IT-002', classSection: 'II-IT-A', gpa: 3.75, attendance: '92%', remarks: 'Good analytical skills' },
  // Section II-IT-B
  { name: 'Kamalesh', email: 'kamalesh.student@gmail.com', rollNumber: 'II-IT-003', classSection: 'II-IT-B', gpa: 3.91, attendance: '98%', remarks: 'Excellent project lead' },
  { name: 'Jazy', email: 'jazy.student@gmail.com', rollNumber: 'II-IT-004', classSection: 'II-IT-B', gpa: 3.68, attendance: '89%', remarks: 'Active participant' },
  // Section III-IT-A
  { name: 'Aravind', email: 'aravind.student@gmail.com', rollNumber: 'III-IT-001', classSection: 'III-IT-A', gpa: 3.82, attendance: '94%', remarks: 'Strong programming logic' },
  { name: 'Bhavana', email: 'bhavana.student@gmail.com', rollNumber: 'III-IT-002', classSection: 'III-IT-A', gpa: 3.79, attendance: '91%', remarks: 'Consistent assignment submissions' },
  // Section III-IT-B
  { name: 'Chetan', email: 'chetan.student@gmail.com', rollNumber: 'III-IT-003', classSection: 'III-IT-B', gpa: 3.85, attendance: '95%', remarks: 'High attendance record' },
  { name: 'Divya', email: 'divya.student@gmail.com', rollNumber: 'III-IT-004', classSection: 'III-IT-B', gpa: 3.70, attendance: '90%', remarks: 'Good problem solver' },
  // Section IV-IT-A
  { name: 'Elango', email: 'elango.student@gmail.com', rollNumber: 'IV-IT-001', classSection: 'IV-IT-A', gpa: 3.95, attendance: '97%', remarks: 'Department topper candidate' },
  { name: 'Farhana', email: 'farhana.student@gmail.com', rollNumber: 'IV-IT-002', classSection: 'IV-IT-A', gpa: 3.80, attendance: '93%', remarks: 'Active technical researcher' }
];

const seedSubjects = [
  // Ezhilarasi
  { code: 'CS-301', name: 'Web Technology & UI Design', classSection: 'II-IT-A', assignedStaffEmail: 'ezhilarasi.teacher@gmail.com', assignedStaffName: 'Ezhilarasi', credits: 4 },
  { code: 'CS-302', name: 'Software Engineering & Agile', classSection: 'II-IT-B', assignedStaffEmail: 'ezhilarasi.teacher@gmail.com', assignedStaffName: 'Ezhilarasi', credits: 4 },
  // Priyadharshini
  { code: 'IT-401', name: 'Data Structures & Algorithms', classSection: 'II-IT-A', assignedStaffEmail: 'priyadharshini.teacher@gmail.com', assignedStaffName: 'Priyadharshini', credits: 4 },
  { code: 'IT-402', name: 'Python Programming & AI', classSection: 'III-IT-A', assignedStaffEmail: 'priyadharshini.teacher@gmail.com', assignedStaffName: 'Priyadharshini', credits: 4 },
  // Ganesh kumar
  { code: 'CS-501', name: 'Operating Systems & Linux Kernel', classSection: 'III-IT-B', assignedStaffEmail: 'ganeshkumar.teacher@gmail.com', assignedStaffName: 'Ganesh kumar', credits: 4 },
  { code: 'CS-502', name: 'Computer Networks & Security', classSection: 'IV-IT-A', assignedStaffEmail: 'ganeshkumar.teacher@gmail.com', assignedStaffName: 'Ganesh kumar', credits: 4 },
  // Nagul
  { code: 'IT-601', name: 'Database Management Systems & NoSQL', classSection: 'III-IT-B', assignedStaffEmail: 'nagul.teacher@gmail.com', assignedStaffName: 'Nagul', credits: 4 },
  { code: 'IT-602', name: 'Cloud Computing & DevOps', classSection: 'IV-IT-A', assignedStaffEmail: 'nagul.teacher@gmail.com', assignedStaffName: 'Nagul', credits: 4 }
];

const seedTimetables = [
  // Monday (8 Hours)
  { classSection: 'II-IT-A', day: 'Monday', hourSlot: 1, subjectCode: 'CS-301', subjectName: 'Web Technology & UI Design', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Lab 101' },
  { classSection: 'II-IT-A', day: 'Monday', hourSlot: 2, subjectCode: 'IT-401', subjectName: 'Data Structures & Algorithms', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Hall 201' },
  { classSection: 'III-IT-B', day: 'Monday', hourSlot: 3, subjectCode: 'CS-501', subjectName: 'Operating Systems & Linux Kernel', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Lab 204' },
  { classSection: 'III-IT-B', day: 'Monday', hourSlot: 4, subjectCode: 'IT-601', subjectName: 'Database Management Systems', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Lab 305' },
  { classSection: 'II-IT-B', day: 'Monday', hourSlot: 5, subjectCode: 'CS-302', subjectName: 'Software Engineering & Agile', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Hall 202' },
  { classSection: 'III-IT-A', day: 'Monday', hourSlot: 6, subjectCode: 'IT-402', subjectName: 'Python Programming & AI', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Lab 102' },
  { classSection: 'IV-IT-A', day: 'Monday', hourSlot: 7, subjectCode: 'CS-502', subjectName: 'Computer Networks & Security', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Hall 301' },
  { classSection: 'IV-IT-A', day: 'Monday', hourSlot: 8, subjectCode: 'IT-602', subjectName: 'Cloud Computing & DevOps', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Hall 402' },

  // Tuesday (8 Hours)
  { classSection: 'III-IT-A', day: 'Tuesday', hourSlot: 1, subjectCode: 'IT-402', subjectName: 'Python Programming & AI', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Lab 102' },
  { classSection: 'IV-IT-A', day: 'Tuesday', hourSlot: 2, subjectCode: 'CS-502', subjectName: 'Computer Networks & Security', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Hall 301' },
  { classSection: 'II-IT-B', day: 'Tuesday', hourSlot: 3, subjectCode: 'CS-302', subjectName: 'Software Engineering & Agile', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Hall 202' },
  { classSection: 'IV-IT-A', day: 'Tuesday', hourSlot: 4, subjectCode: 'IT-602', subjectName: 'Cloud Computing & DevOps', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Hall 402' },
  { classSection: 'II-IT-A', day: 'Tuesday', hourSlot: 5, subjectCode: 'IT-401', subjectName: 'Data Structures & Algorithms', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Hall 201' },
  { classSection: 'II-IT-A', day: 'Tuesday', hourSlot: 6, subjectCode: 'CS-301', subjectName: 'Web Technology & UI Design', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Lab 101' },
  { classSection: 'III-IT-B', day: 'Tuesday', hourSlot: 7, subjectCode: 'CS-501', subjectName: 'Operating Systems & Linux Kernel', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Lab 204' },
  { classSection: 'III-IT-B', day: 'Tuesday', hourSlot: 8, subjectCode: 'IT-601', subjectName: 'Database Management Systems', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Lab 305' },

  // Wednesday (8 Hours)
  { classSection: 'III-IT-B', day: 'Wednesday', hourSlot: 1, subjectCode: 'CS-501', subjectName: 'Operating Systems & Linux Kernel', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Lab 204' },
  { classSection: 'II-IT-A', day: 'Wednesday', hourSlot: 2, subjectCode: 'CS-301', subjectName: 'Web Technology & UI Design', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Lab 101' },
  { classSection: 'III-IT-B', day: 'Wednesday', hourSlot: 3, subjectCode: 'IT-601', subjectName: 'Database Management Systems', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Lab 305' },
  { classSection: 'II-IT-A', day: 'Wednesday', hourSlot: 4, subjectCode: 'IT-401', subjectName: 'Data Structures & Algorithms', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Hall 201' },
  { classSection: 'IV-IT-A', day: 'Wednesday', hourSlot: 5, subjectCode: 'CS-502', subjectName: 'Computer Networks & Security', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Hall 301' },
  { classSection: 'II-IT-B', day: 'Wednesday', hourSlot: 6, subjectCode: 'CS-302', subjectName: 'Software Engineering & Agile', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Hall 202' },
  { classSection: 'III-IT-A', day: 'Wednesday', hourSlot: 7, subjectCode: 'IT-402', subjectName: 'Python Programming & AI', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Lab 102' },
  { classSection: 'IV-IT-A', day: 'Wednesday', hourSlot: 8, subjectCode: 'IT-602', subjectName: 'Cloud Computing & DevOps', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Hall 402' },

  // Thursday (8 Hours)
  { classSection: 'IV-IT-A', day: 'Thursday', hourSlot: 1, subjectCode: 'IT-602', subjectName: 'Cloud Computing & DevOps', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Hall 402' },
  { classSection: 'III-IT-A', day: 'Thursday', hourSlot: 2, subjectCode: 'IT-402', subjectName: 'Python Programming & AI', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Lab 102' },
  { classSection: 'II-IT-A', day: 'Thursday', hourSlot: 3, subjectCode: 'CS-301', subjectName: 'Web Technology & UI Design', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Lab 101' },
  { classSection: 'III-IT-B', day: 'Thursday', hourSlot: 4, subjectCode: 'CS-501', subjectName: 'Operating Systems & Linux Kernel', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Lab 204' },
  { classSection: 'III-IT-B', day: 'Thursday', hourSlot: 5, subjectCode: 'IT-601', subjectName: 'Database Management Systems', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Lab 305' },
  { classSection: 'II-IT-A', day: 'Thursday', hourSlot: 6, subjectCode: 'IT-401', subjectName: 'Data Structures & Algorithms', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Hall 201' },
  { classSection: 'IV-IT-A', day: 'Thursday', hourSlot: 7, subjectCode: 'CS-502', subjectName: 'Computer Networks & Security', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Hall 301' },
  { classSection: 'II-IT-B', day: 'Thursday', hourSlot: 8, subjectCode: 'CS-302', subjectName: 'Software Engineering & Agile', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Hall 202' },

  // Friday (8 Hours)
  { classSection: 'II-IT-A', day: 'Friday', hourSlot: 1, subjectCode: 'CS-301', subjectName: 'Web Technology & UI Design', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Lab 101' },
  { classSection: 'III-IT-B', day: 'Friday', hourSlot: 2, subjectCode: 'CS-501', subjectName: 'Operating Systems & Linux Kernel', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Lab 204' },
  { classSection: 'II-IT-A', day: 'Friday', hourSlot: 3, subjectCode: 'IT-401', subjectName: 'Data Structures & Algorithms', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Hall 201' },
  { classSection: 'III-IT-B', day: 'Friday', hourSlot: 4, subjectCode: 'IT-601', subjectName: 'Database Management Systems', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Lab 305' },
  { classSection: 'II-IT-B', day: 'Friday', hourSlot: 5, subjectCode: 'CS-302', subjectName: 'Software Engineering & Agile', staffEmail: 'ezhilarasi.teacher@gmail.com', staffName: 'Ezhilarasi', roomNo: 'Hall 202' },
  { classSection: 'III-IT-A', day: 'Friday', hourSlot: 6, subjectCode: 'IT-402', subjectName: 'Python Programming & AI', staffEmail: 'priyadharshini.teacher@gmail.com', staffName: 'Priyadharshini', roomNo: 'Lab 102' },
  { classSection: 'IV-IT-A', day: 'Friday', hourSlot: 7, subjectCode: 'CS-502', subjectName: 'Computer Networks & Security', staffEmail: 'ganeshkumar.teacher@gmail.com', staffName: 'Ganesh kumar', roomNo: 'Hall 301' },
  { classSection: 'IV-IT-A', day: 'Friday', hourSlot: 8, subjectCode: 'IT-602', subjectName: 'Cloud Computing & DevOps', staffEmail: 'nagul.teacher@gmail.com', staffName: 'Nagul', roomNo: 'Hall 402' }
];

const seedDatabase = async () => {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.log('[Seeder] Skipping MongoDB seed: Connection not active');
      return;
    }

    console.log('[Seeder] Starting MongoDB database seed operation...');

    // 0. Seed HOD Account
    const existingHOD = await User.findOne({ email: 'hodit@gmail.com' });
    if (!existingHOD) {
      await User.create({
        name: 'Dr. Robert Vance (HOD)',
        email: 'hodit@gmail.com',
        password: 'hod123',
        role: 'HOD',
        department: 'Information Technology',
        createdBy: 'System Root'
      });
      console.log('[Seeder] Created HOD account: Dr. Robert Vance (hodit@gmail.com)');
    }

    // 1. Seed Teacher Accounts
    for (const t of seedTeachers) {
      const existingUser = await User.findOne({ email: t.email.toLowerCase() });
      if (!existingUser) {
        await User.create({
          name: t.name,
          email: t.email.toLowerCase(),
          password: t.password,
          role: t.role,
          department: t.department,
          createdBy: 'System Root'
        });
        console.log(`[Seeder] Created Teacher account: ${t.name} (${t.email})`);
      }
    }

    // 2. Seed Student Accounts & Details
    for (const s of seedStudents) {
      let uObj = await User.findOne({ email: s.email.toLowerCase() });
      if (!uObj) {
        uObj = await User.create({
          name: s.name,
          email: s.email.toLowerCase(),
          password: 'student123',
          role: 'Student',
          department: 'Information Technology',
          createdBy: 'System Root'
        });
        console.log(`[Seeder] Created Student account: ${s.name} (${s.email})`);
      }

      const existingDetail = await StudentDetail.findOne({ studentEmail: s.email.toLowerCase() });
      if (!existingDetail) {
        await StudentDetail.create({
          user: uObj._id,
          studentEmail: s.email.toLowerCase(),
          rollNumber: s.rollNumber,
          semester: 'Semester 6',
          department: 'Information Technology',
          gpa: s.gpa,
          attendance: s.attendance,
          remarks: s.remarks,
          managedByStaff: 'Faculty Member'
        });
      }
    }

    // 3. Seed Subjects
    for (const sub of seedSubjects) {
      const existingSub = await Subject.findOne({ code: sub.code });
      if (!existingSub) {
        await Subject.create(sub);
        console.log(`[Seeder] Created Subject: ${sub.code} - ${sub.name} (Assigned to: ${sub.assignedStaffName})`);
      }
    }

    // 4. Seed Timetable
    for (const tt of seedTimetables) {
      const existingSlot = await Timetable.findOne({
        day: tt.day,
        hourSlot: tt.hourSlot,
        classSection: tt.classSection
      });
      if (!existingSlot) {
        await Timetable.create(tt);
      }
    }

    // 5. Seed Attendance Sheets for each Teacher's subject
    const today = new Date();
    const attendanceSheets = [
      {
        classSection: 'II-IT-A',
        subjectCode: 'CS-301',
        subjectName: 'Web Technology & UI Design',
        markedByStaff: 'ezhilarasi.teacher@gmail.com',
        date: today,
        records: [
          { studentEmail: 'kiresh.student@gmail.com', rollNumber: 'II-IT-001', studentName: 'Kiresh', status: 'Present' },
          { studentEmail: 'dharun.student@gmail.com', rollNumber: 'II-IT-002', studentName: 'Dharun', status: 'Present' }
        ]
      },
      {
        classSection: 'II-IT-A',
        subjectCode: 'IT-401',
        subjectName: 'Data Structures & Algorithms',
        markedByStaff: 'priyadharshini.teacher@gmail.com',
        date: today,
        records: [
          { studentEmail: 'kiresh.student@gmail.com', rollNumber: 'II-IT-001', studentName: 'Kiresh', status: 'Present' },
          { studentEmail: 'dharun.student@gmail.com', rollNumber: 'II-IT-002', studentName: 'Dharun', status: 'Absent' }
        ]
      },
      {
        classSection: 'III-IT-B',
        subjectCode: 'CS-501',
        subjectName: 'Operating Systems & Linux Kernel',
        markedByStaff: 'ganeshkumar.teacher@gmail.com',
        date: today,
        records: [
          { studentEmail: 'chetan.student@gmail.com', rollNumber: 'III-IT-003', studentName: 'Chetan', status: 'Present' },
          { studentEmail: 'divya.student@gmail.com', rollNumber: 'III-IT-004', studentName: 'Divya', status: 'Present' }
        ]
      },
      {
        classSection: 'III-IT-B',
        subjectCode: 'IT-601',
        subjectName: 'Database Management Systems & NoSQL',
        markedByStaff: 'nagul.teacher@gmail.com',
        date: today,
        records: [
          { studentEmail: 'chetan.student@gmail.com', rollNumber: 'III-IT-003', studentName: 'Chetan', status: 'Present' },
          { studentEmail: 'divya.student@gmail.com', rollNumber: 'III-IT-004', studentName: 'Divya', status: 'Absent' }
        ]
      }
    ];

    for (const att of attendanceSheets) {
      const existingAtt = await Attendance.findOne({
        classSection: att.classSection,
        subjectCode: att.subjectCode,
        markedByStaff: att.markedByStaff
      });
      if (!existingAtt) {
        await Attendance.create(att);
      }
    }

    console.log('[Seeder] MongoDB Database successfully seeded with Teachers (Ezhilarasi, Priyadharshini, Ganesh kumar, Nagul), assigned subjects, timetables, and attendance sheets!');

  } catch (err) {
    console.error('[Seeder] Database Seeding Error:', err.message);
  }
};

// Also sync with in-memory fallbacks
const syncInMemoryStore = () => {
  global.inMemoryUsers = global.inMemoryUsers || [];
  global.inMemoryStudentDetails = global.inMemoryStudentDetails || [];
  global.inMemorySubjects = global.inMemorySubjects || [];
  global.inMemoryTimetables = global.inMemoryTimetables || [];
  global.inMemoryAttendanceSheets = global.inMemoryAttendanceSheets || [];

  // Sync inMemoryUsers
  seedTeachers.forEach(t => {
    if (!global.inMemoryUsers.find(u => u.email === t.email)) {
      global.inMemoryUsers.push({
        id: 'u-' + Date.now() + Math.random(),
        name: t.name,
        email: t.email,
        passwordHash: bcrypt.hashSync(t.password, 10),
        role: t.role,
        department: t.department,
        createdBy: 'System Root'
      });
    }
  });

  seedStudents.forEach(s => {
    if (!global.inMemoryUsers.find(u => u.email === s.email)) {
      global.inMemoryUsers.push({
        id: 'u-st-' + s.rollNumber,
        name: s.name,
        email: s.email,
        passwordHash: bcrypt.hashSync('student123', 10),
        role: 'Student',
        department: 'Information Technology',
        createdBy: 'System Root'
      });
    }

    if (!global.inMemoryStudentDetails.find(sd => sd.userEmail === s.email)) {
      global.inMemoryStudentDetails.push({
        id: 'sd-' + s.rollNumber,
        userEmail: s.email,
        studentName: s.name,
        rollNumber: s.rollNumber,
        classSection: s.classSection,
        semester: 'Semester 6',
        department: 'Information Technology',
        gpa: s.gpa,
        attendance: s.attendance,
        remarks: s.remarks,
        managedByStaff: 'Faculty Member'
      });
    }
  });

  // Sync inMemorySubjects
  seedSubjects.forEach(sub => {
    if (!global.inMemorySubjects.find(s => s.code === sub.code)) {
      global.inMemorySubjects.push({
        id: 'sub-' + sub.code,
        ...sub
      });
    }
  });

  // Sync inMemoryTimetables
  seedTimetables.forEach((tt, idx) => {
    if (!global.inMemoryTimetables.find(t => t.day === tt.day && t.hourSlot === tt.hourSlot && t.classSection === tt.classSection)) {
      global.inMemoryTimetables.push({
        id: 'tt-seed-' + idx,
        ...tt,
        isConflict: false,
        status: 'Active'
      });
    }
  });
};

module.exports = { seedDatabase, syncInMemoryStore };

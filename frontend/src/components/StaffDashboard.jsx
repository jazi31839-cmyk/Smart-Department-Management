import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileManager from './FileManager';
import TimetableGrid from './TimetableGrid';
import AttendanceMarker from './AttendanceMarker';
import NoticeBoard from './NoticeBoard';
import HallAllotmentManager from './HallAllotmentManager';

export default function StaffDashboard() {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multi-Class Section Selection ("IV-IT-A" and "III-IT-B")
  const [selectedSection, setSelectedSection] = useState('IV-IT-A');

  // Student registration modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('student123');
  const [rollNumber, setRollNumber] = useState('');
  const [semester, setSemester] = useState('Semester 7');
  const [gpa, setGpa] = useState('3.80');
  const [attendance, setAttendance] = useState('95%');
  const [remarks, setRemarks] = useState('Good academic standing');
  const [msg, setMsg] = useState(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const stRes = await fetch('/api/users/staff-manage/list-students', { headers: { Authorization: `Bearer ${token}` } });
      const stData = await stRes.json();
      if (stData.success) setStudents(stData.students);

      // 2. Fetch Assigned Subjects
      const subRes = await fetch('/api/academic/subjects/list', { headers: { Authorization: `Bearer ${token}` } });
      const subData = await subRes.json();
      if (subData.success) setAssignedSubjects(subData.subjects);

    } catch (err) {
      console.error('Fetch staff data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStaffData();
  }, [token]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!studentEmail.toLowerCase().endsWith('@gmail.com')) {
      setMsg({ type: 'error', text: 'Security Error: Student User ID must end with @gmail.com' });
      return;
    }

    try {
      const res = await fetch('/api/users/staff-manage/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: studentName,
          email: studentEmail,
          password,
          rollNumber,
          semester,
          department: user.department || 'Computer Science & Engineering',
          gpa: parseFloat(gpa),
          attendance,
          remarks
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Student Account and Academic Record created successfully!' });
        setStudentName(''); setStudentEmail(''); setRollNumber('');
        setTimeout(() => { setShowStudentModal(false); setMsg(null); fetchStaffData(); }, 1200);
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to create student account' });
    }
  };

  return (
    <div className="animate-fade">
      
      {/* Top Staff Overview Banner */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Faculty Staff Profile
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#6ee7b7' }}>
            {user.email} | {user.department}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Assigned Subjects & Sections
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {assignedSubjects.length} Courses
          </div>
          <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
            Sections: IV-IT-A, III-IT-B & II-IT-A
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Enrolled Students Managed
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {students.length} Students
          </div>
          <div style={{ fontSize: '0.82rem', color: '#67e8f9' }}>
            Class Roster Attendance Active
          </div>
        </div>
      </div>

      {/* Notice Board & Announcements (Staff Operated) */}
      <NoticeBoard />

      {/* Exam Hall Allotment View */}
      <HallAllotmentManager />

      {/* Assigned Subjects Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📖 My Assigned Academic Subjects & Course Workload
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Assigned Section</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {assignedSubjects.map(s => (
                <tr key={s.id || s._id}>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>{s.code}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="badge badge-staff">{s.classSection}</span></td>
                  <td>{s.credits} Credits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Class Section Selection Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>Switch Class Section View:</span>
        <button
          onClick={() => setSelectedSection('IV-IT-A')}
          className={`btn ${selectedSection === 'IV-IT-A' ? 'btn-staff' : 'btn-secondary'}`}
          style={{ padding: '6px 16px', fontSize: '0.88rem' }}
        >
          IV-IT-A Section
        </button>
        <button
          onClick={() => setSelectedSection('III-IT-B')}
          className={`btn ${selectedSection === 'III-IT-B' ? 'btn-staff' : 'btn-secondary'}`}
          style={{ padding: '6px 16px', fontSize: '0.88rem' }}
        >
          III-IT-B Section
        </button>
        <button
          onClick={() => setSelectedSection('II-IT-A')}
          className={`btn ${selectedSection === 'II-IT-A' ? 'btn-staff' : 'btn-secondary'}`}
          style={{ padding: '6px 16px', fontSize: '0.88rem' }}
        >
          II-IT-A Section
        </button>
      </div>

      {/* Weekly Grid (Day × Hour) Schedule View for Staff */}
      <TimetableGrid classSection={selectedSection} />

      {/* Attendance Roster Component for Selected Class Section */}
      <AttendanceMarker classSection={selectedSection} subjectCode={selectedSection === 'IV-IT-A' ? 'IT-305' : 'IT-401'} />

      {/* Student Logins & Records Management */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              🎓 Student Accounts & Academic Details Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Staff Authorization: Register unique student logins and record academic details
            </p>
          </div>

          <button onClick={() => setShowStudentModal(true)} className="btn btn-staff">
            ➕ Register New Student Profile
          </button>
        </div>

        {/* Student Registration Modal */}
        {showStudentModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                Register Student Login & Details
              </h3>

              {msg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                  background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: msg.type === 'success' ? '#6ee7b7' : '#fca5a5'
                }}>
                  {msg.text}
                </div>
              )}

              <form onSubmit={handleCreateStudent}>
                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Student Full Name</label>
                    <input type="text" className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Roll / ID Number</label>
                    <input type="text" className="form-control" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Gmail User ID (@gmail.com)</label>
                    <input type="email" className="form-control" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Semester</label>
                    <input type="text" className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>GPA</label>
                    <input type="number" step="0.01" className="form-control" value={gpa} onChange={(e) => setGpa(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Attendance</label>
                    <input type="text" className="form-control" value={attendance} onChange={(e) => setAttendance(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Staff Remarks</label>
                  <textarea className="form-control" rows="2" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowStudentModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-staff">Register Student Profile</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Gmail User ID</th>
                <th>Semester</th>
                <th>GPA</th>
                <th>Attendance %</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id || s._id || idx}>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>{s.rollNumber}</td>
                  <td style={{ fontWeight: 600 }}>{s.studentName || (s.user && s.user.name)}</td>
                  <td style={{ color: '#818cf8' }}>{s.userEmail || (s.user && s.user.email)}</td>
                  <td>{s.semester}</td>
                  <td><span style={{ color: '#34d399', fontWeight: 700 }}>{s.gpa}</span></td>
                  <td>{s.attendance}</td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{s.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tagged File Management Uploads */}
      <FileManager />

    </div>
  );
}

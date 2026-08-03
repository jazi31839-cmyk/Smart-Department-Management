import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileManager from './FileManager';
import TimetableGrid from './TimetableGrid';
import NoticeBoard from './NoticeBoard';
import HallAllotmentManager from './HallAllotmentManager';

export default function HODDashboard() {
  const { token, user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [studentAttendances, setStudentAttendances] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active section for Timetable Grid view & Attendance View
  const [activeSection, setActiveSection] = useState('IV-IT-A');
  const [hodAttSection, setHodAttSection] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // User form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [formMsg, setFormMsg] = useState(null);

  // Subject assignment form
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subSection, setSubSection] = useState('II-IT-A');
  const [subStaffEmail, setSubStaffEmail] = useState('sarah.teacher@gmail.com');
  const [subCredits, setSubCredits] = useState(4);
  const [subMsg, setSubMsg] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await fetch('/api/users/hod-manage/list', { headers: { Authorization: `Bearer ${token}` } });
      const usersData = await usersRes.json();
      if (usersData.success) setUsersList(usersData.users);

      // 2. Fetch Subjects
      const subsRes = await fetch('/api/academic/subjects/list', { headers: { Authorization: `Bearer ${token}` } });
      const subsData = await subsRes.json();
      if (subsData.success) setSubjectsList(subsData.subjects);

      // 3. Fetch Pending Requests
      const reqRes = await fetch('/api/academic/timetable/pending-requests', { headers: { Authorization: `Bearer ${token}` } });
      const reqData = await reqRes.json();
      if (reqData.success) setPendingRequests(reqData.requests);

      // 4. Fetch Department Overview Report
      const repRes = await fetch('/api/academic/department-report', { headers: { Authorization: `Bearer ${token}` } });
      const repData = await repRes.json();
      if (repData.success) setReport(repData.report);

      // 5. Fetch Student Attendances list for HOD
      const attRes = await fetch('/api/academic/hod/student-attendances', { headers: { Authorization: `Bearer ${token}` } });
      const attData = await attRes.json();
      if (attData.success) setStudentAttendances(attData.students);

    } catch (err) {
      console.error('Fetch HOD data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllData();
  }, [token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setFormMsg({ type: 'error', text: 'Security Error: User ID must end with @gmail.com' });
      return;
    }
    try {
      const res = await fetch('/api/users/hod-manage/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, password, role, department })
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ type: 'success', text: `${role} account created successfully!` });
        setName(''); setEmail(''); setPassword('');
        setTimeout(() => { setShowCreateModal(false); setFormMsg(null); fetchAllData(); }, 1200);
      } else {
        setFormMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setFormMsg({ type: 'error', text: 'Failed to create user' });
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    setSubMsg(null);
    try {
      const res = await fetch('/api/academic/subjects/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: subCode,
          name: subName,
          classSection: subSection,
          assignedStaffEmail: subStaffEmail,
          credits: Number(subCredits)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubMsg({ type: 'success', text: data.message });
        setSubCode(''); setSubName('');
        setTimeout(() => { setShowSubjectModal(false); setSubMsg(null); fetchAllData(); }, 1200);
      } else {
        setSubMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setSubMsg({ type: 'error', text: 'Error assigning subject' });
    }
  };

  const handleApproveRequest = async (reqId, decision) => {
    try {
      const res = await fetch(`/api/academic/timetable/approve-request/${reqId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  return (
    <div className="animate-fade">
      
      {/* Overall Department KPI Overview Banner */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Department Attendance KPI
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {report ? report.avgAttendance : '94.5%'}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#c084fc' }}>
            Overall Enrolled Students Avg
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Timetable Conflict Monitor
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: report && report.timetableConflicts > 0 ? '#ef4444' : '#34d399', margin: '4px 0' }}>
            {report ? report.timetableConflicts : 0} Conflicts
          </div>
          <div style={{ fontSize: '0.82rem', color: '#818cf8' }}>
            Day × Hour Slot Overlap Engine
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Study Material Inventory
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
            {report ? report.totalFilesUploaded : 3} Files
          </div>
          <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
            Tagged PDFs, PPTs & Notes
          </div>
        </div>
      </div>

      {/* Notice Board & Announcement Section */}
      <NoticeBoard />

      {/* Exam Hall Allotment & Seating Plan (HOD Managed) */}
      <HallAllotmentManager />

      {/* Student Attendance Review Section (HOD View with Class Section Filter) */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Student Attendance Monitoring (Class Section View)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Filter student attendance records by class section (e.g. II-IT-A, III-IT-B)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setHodAttSection('ALL')}
              className={`btn ${hodAttSection === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              All Sections
            </button>
            <button
              onClick={() => setHodAttSection('IV-IT-A')}
              className={`btn ${hodAttSection === 'IV-IT-A' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              IV-IT-A
            </button>
            <button
              onClick={() => setHodAttSection('III-IT-B')}
              className={`btn ${hodAttSection === 'III-IT-B' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              III-IT-B
            </button>
            <button
              onClick={() => setHodAttSection('II-IT-A')}
              className={`btn ${hodAttSection === 'II-IT-A' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              II-IT-A
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Gmail Address</th>
                <th>Semester</th>
                <th>Attendance %</th>
                <th>GPA</th>
                <th>Assigned Faculty</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendances
                .filter(s => hodAttSection === 'ALL' || (s.classSection || 'IV-IT-A') === hodAttSection)
                .map((s) => {
                  const attVal = parseInt(s.attendance) || 90;
                  const isLowAtt = attVal < 75;
                  return (
                    <tr key={s.id || s._id}>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{s.studentName || (s.user ? s.user.name : 'Student')}</td>
                      <td><span className="badge badge-staff">{s.rollNumber || 'CS2026'}</span></td>
                      <td style={{ color: '#38bdf8' }}>{s.userEmail || (s.user ? s.user.email : 'student@gmail.com')}</td>
                      <td><span className="badge badge-private">{s.classSection || 'IV-IT-A'}</span></td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          backgroundColor: isLowAtt ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: isLowAtt ? '#f87171' : '#34d399',
                          border: isLowAtt ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          {s.attendance || '90%'} {isLowAtt ? '⚠️ Low' : '✅ Good'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#fbbf24' }}>{s.gpa || '3.80'}</td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{s.managedByStaff || 'Prof. Sarah Jenkins'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timetable Change Request Inbox (HOD Approval) */}
      {pendingRequests.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fcd34d', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📬 Pending Timetable Change Requests ({pendingRequests.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Faculty Staff</th>
                  <th>Section</th>
                  <th>Current Assigned Slot</th>
                  <th>Proposed New Slot</th>
                  <th>Reason</th>
                  <th>Decision Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.staffName}</td>
                    <td><span className="badge badge-staff">{r.classSection}</span></td>
                    <td style={{ color: '#fca5a5' }}>{r.currentSlot}</td>
                    <td style={{ color: '#6ee7b7' }}>{r.proposedSlot}</td>
                    <td style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{r.reason}</td>
                    <td>
                      {r.status === 'Pending Approval' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleApproveRequest(r.id, 'Approve')} className="btn btn-staff" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            ✅ Approve
                          </button>
                          <button onClick={() => handleApproveRequest(r.id, 'Reject')} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${r.status === 'Approved' ? 'badge-staff' : 'badge-private'}`}>{r.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Assignment & Workload Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              📚 Subject Assignments & Faculty Workload
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Assign academic subjects and class sections (e.g., II-IT-A, III-IT-B) to faculty members
            </p>
          </div>

          <button onClick={() => setShowSubjectModal(true)} className="btn btn-primary">
            ➕ Assign New Subject to Staff
          </button>
        </div>

        {/* Assign Subject Modal */}
        {showSubjectModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                Assign Subject to Staff
              </h3>

              {subMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                  background: subMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: subMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
                }}>
                  {subMsg.text}
                </div>
              )}

              <form onSubmit={handleAssignSubject}>
                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Subject Code</label>
                    <input type="text" className="form-control" placeholder="e.g. CS-301" value={subCode} onChange={(e) => setSubCode(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Target Section</label>
                    <select className="form-control" value={subSection} onChange={(e) => setSubSection(e.target.value)}>
                      <option value="II-IT-A">II-IT-A</option>
                      <option value="II-IT-B">II-IT-B</option>
                      <option value="III-IT-A">III-IT-A</option>
                      <option value="III-IT-B">III-IT-B</option>
                      <option value="IV-IT-A">IV-IT-A</option>
                      <option value="IV-CSE-A">IV-CSE-A</option>
                      <option value="IV-CSE-B">IV-CSE-B</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Software Engineering" value={subName} onChange={(e) => setSubName(e.target.value)} required />
                </div>

                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Faculty Staff Gmail</label>
                    <input type="email" className="form-control" value={subStaffEmail} onChange={(e) => setSubStaffEmail(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Credits</label>
                    <input type="number" className="form-control" value={subCredits} onChange={(e) => setSubCredits(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Assign Subject</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assigned Subjects Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Class Section</th>
                <th>Assigned Faculty Staff</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {subjectsList.map(s => (
                <tr key={s.id || s._id}>
                  <td style={{ fontWeight: 700, color: '#818cf8' }}>{s.code}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="badge badge-staff">{s.classSection}</span></td>
                  <td>{s.assignedStaffName || s.assignedStaffEmail}</td>
                  <td>{s.credits} Credits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Selector for Timetable Grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>Select Section Schedule Grid:</span>
        <button
          onClick={() => setActiveSection('IV-IT-A')}
          className={`btn ${activeSection === 'IV-IT-A' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
        >
          IV-IT-A Schedule
        </button>
        <button
          onClick={() => setActiveSection('III-IT-B')}
          className={`btn ${activeSection === 'III-IT-B' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
        >
          III-IT-B Schedule
        </button>
        <button
          onClick={() => setActiveSection('II-IT-A')}
          className={`btn ${activeSection === 'II-IT-A' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
        >
          II-IT-A Schedule
        </button>
      </div>

      {/* Weekly Timetable Schedule Grid (with HOD slot addition & conflict engine) */}
      <TimetableGrid classSection={activeSection} allowAdd={true} />

      {/* HOD & Staff Account Management Panel */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              👑 HOD & Staff Account Credentials
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Create and manage HOD logins & Staff accounts with verified Gmail security
            </p>
          </div>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            ➕ Register New HOD / Staff Login
          </button>
        </div>

        {/* User Creation Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                Create HOD / Staff Account
              </h3>

              {formMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                  background: formMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: formMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
                }}>
                  {formMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Gmail User ID (@gmail.com required)</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="Staff">Staff (Faculty)</option>
                      <option value="HOD">HOD (Head of Dept)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Gmail User ID</th>
                <th>Role</th>
                <th>Department</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id || u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: '#818cf8' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'HOD' ? 'badge-hod' : 'badge-staff'}`}>{u.role}</span></td>
                  <td>{u.department}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{u.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Vault */}
      <FileManager />

    </div>
  );
}

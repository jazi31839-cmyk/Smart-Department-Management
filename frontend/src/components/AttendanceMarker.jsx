import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AttendanceMarker({ classSection = 'II-IT-A', subjectCode = 'CS-301' }) {
  const { token, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [submitMsg, setSubmitMsg] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/staff-manage/list-students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        // Initialize attendance state (default all Present)
        const initial = {};
        data.students.forEach(s => {
          initial[s.userEmail || (s.user && s.user.email)] = 'Present';
        });
        setAttendanceMap(initial);
      }
    } catch (err) {
      console.error('Fetch roster error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  const toggleStatus = (email) => {
    setAttendanceMap(prev => ({
      ...prev,
      [email]: prev[email] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSaveAttendance = async () => {
    setSubmitMsg(null);
    try {
      const records = students.map(s => {
        const email = s.userEmail || (s.user && s.user.email);
        return {
          studentEmail: email,
          rollNumber: s.rollNumber,
          studentName: s.studentName || (s.user && s.user.name),
          status: attendanceMap[email] || 'Present'
        };
      });

      const res = await fetch('/api/academic/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          classSection,
          subjectCode,
          records
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitMsg({ type: 'success', text: data.message });
        setTimeout(() => setSubmitMsg(null), 3000);
      } else {
        setSubmitMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setSubmitMsg({ type: 'error', text: 'Failed to record attendance' });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Roster Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📝 Class Attendance Roster ({classSection} - {subjectCode})
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Mark student attendance for today's lecture. Toggling updates dynamic attendance percentages.
          </p>
        </div>

        <button onClick={handleSaveAttendance} className="btn btn-staff">
          💾 Save & Update Attendance
        </button>
      </div>

      {/* Message alert */}
      {submitMsg && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem',
          background: submitMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: submitMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
          border: `1px solid ${submitMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
        }}>
          {submitMsg.text}
        </div>
      )}

      {/* Roster Table */}
      {loading ? (
        <div style={{ padding: '20px', color: '#94a3b8' }}>Loading student roster...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Gmail User ID</th>
                <th>Current %</th>
                <th>Session Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const email = s.userEmail || (s.user && s.user.email);
                const status = attendanceMap[email] || 'Present';
                return (
                  <tr key={s.id || s._id || idx}>
                    <td style={{ fontWeight: 700, color: '#f59e0b' }}>{s.rollNumber}</td>
                    <td style={{ fontWeight: 600 }}>{s.studentName || (s.user && s.user.name)}</td>
                    <td style={{ color: '#818cf8' }}>{email}</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>{s.attendance}</td>
                    <td>
                      <button
                        onClick={() => toggleStatus(email)}
                        className={`btn ${status === 'Present' ? 'btn-staff' : 'btn-danger'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        {status === 'Present' ? '✅ Present' : '❌ Absent'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FileManager from './FileManager';
import TimetableGrid from './TimetableGrid';
import FeedbackModal from './FeedbackModal';
import NoticeBoard from './NoticeBoard';
import HallAllotmentManager from './HallAllotmentManager';

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('CS-302 Lecture Notes & Syllabus');

  useEffect(() => {
    const fetchMyDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/users/student/my-details', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data.studentDetails);
        }
      } catch (err) {
        console.error('Fetch student details error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMyDetails();
  }, [token]);

  return (
    <div className="animate-fade">
      
      {/* Read-Only Status & Feedback Bar */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.15)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <div>
            <strong style={{ color: '#fcd34d', fontSize: '1rem' }}>Student Portal Access Mode</strong>
            <p style={{ color: '#fef3c7', fontSize: '0.82rem', margin: 0 }}>
              Read-Only review of personal student details, class timetable grid, and downloadable course materials.
            </p>
          </div>
        </div>

        <button onClick={() => setShowFeedbackModal(true)} className="btn btn-student">
          ⭐ Rate & Review Study Materials
        </button>
      </div>

      {/* Department Notice Board & Announcements */}
      <NoticeBoard />

      {/* Student Academic Details Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          👤 My Academic Record & Profile
        </h3>

        {loading ? (
          <div style={{ padding: '20px', color: '#94a3b8' }}>Retrieving student profile details...</div>
        ) : !details ? (
          <div style={{ padding: '20px', color: '#94a3b8' }}>No personal details found.</div>
        ) : (
          <div>
            <div className="grid-3" style={{ marginBottom: '20px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Roll Number</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                  {details.rollNumber || 'CS2026-042'}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Current Cumulative GPA</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                  {details.gpa || 3.85} / 4.00
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Dynamic Attendance %</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                  {details.attendance || '95%'}
                </div>
              </div>
            </div>

            <table className="custom-table" style={{ marginTop: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '200px', fontWeight: 700, color: '#94a3b8' }}>Student Name</td>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{user.name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>Gmail User ID</td>
                  <td style={{ color: '#818cf8' }}>{user.email}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>Class Section & Dept</td>
                  <td>{details.classSection || 'IV-IT-A'} | {details.department || user.department}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>Semester</td>
                  <td>{details.semester || 'Semester 7'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>Faculty Advisor</td>
                  <td>{details.managedByStaff || 'Prof. Shruthi'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#94a3b8' }}>Faculty Evaluation Remarks</td>
                  <td style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{details.remarks || 'Consistent academic performance.'}"</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Personal Class Timetable Grid (Day × Hour) */}
      <TimetableGrid classSection={details?.classSection || 'IV-IT-A'} />

      {/* Exam Hall Allotment & Seating Plan View */}
      <HallAllotmentManager />

      {/* Downloadable & Filterable Course Study Materials */}
      <FileManager />

      {/* Student Feedback & Star Rating Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        targetTitle={selectedMaterial}
      />

    </div>
  );
}

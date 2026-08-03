import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function HallAllotmentManager() {
  const { token, user } = useAuth();
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [examName, setExamName] = useState('Mid-Term Semester Test 2026');
  const [classSection, setClassSection] = useState('IV-IT-A');
  const [examHall, setExamHall] = useState('Exam Hall 304 (IT Building)');
  const [examDate, setExamDate] = useState('2026-08-10');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [subjectCode, setSubjectCode] = useState('IT-305 Big Data Analytics');
  const [invigilatorStaff, setInvigilatorStaff] = useState('Prof. Shruthi');
  const [allocatedSeatsCount, setAllocatedSeatsCount] = useState(45);
  const [msg, setMsg] = useState(null);

  const isHOD = user?.role === 'HOD';

  const fetchAllotments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academic/halls/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllotments(data.allotments);
      }
    } catch (err) {
      console.error('Failed to load hall allotments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAllotments();
  }, [token]);

  const handleAllocateHall = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/academic/halls/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          examName,
          classSection,
          examHall,
          examDate,
          timeSlot,
          subjectCode,
          invigilatorStaff,
          allocatedSeatsCount
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setShowModal(false);
          setMsg(null);
          fetchAllotments();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to allocate exam hall' });
    }
  };

  const handleDeleteHall = async (id) => {
    if (!window.confirm('Are you sure you want to remove this hall allotment?')) return;
    try {
      const res = await fetch(`/api/academic/halls/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAllotments();
      }
    } catch (err) {
      console.error('Delete hall allotment error:', err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏫</span> Exam Hall Allotment & Seating Plan
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            HOD Exam Management: Allocate exam halls, time slots, and invigilator staff across classes (e.g. IV-IT-A, III-IT-B)
          </p>
        </div>

        {isHOD && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            ➕ Allocate New Exam Hall
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Loading exam hall allotments...</div>
      ) : allotments.length === 0 ? (
        <div style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>No exam hall allotments published yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Class Section</th>
                <th>Allocated Exam Hall</th>
                <th>Subject</th>
                <th>Date & Time Slot</th>
                <th>Invigilator Faculty</th>
                <th>Seating Capacity</th>
                {isHOD && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {allotments.map((h) => (
                <tr key={h.id || h._id}>
                  <td style={{ fontWeight: 700, color: '#f8fafc' }}>{h.examName}</td>
                  <td><span className="badge badge-staff">{h.classSection}</span></td>
                  <td style={{ fontWeight: 700, color: '#f59e0b' }}>🏢 {h.examHall}</td>
                  <td style={{ color: '#38bdf8', fontWeight: 600 }}>{h.subjectCode}</td>
                  <td style={{ fontSize: '0.85rem' }}>📅 {h.examDate} <br /><span style={{ color: '#94a3b8' }}>⏰ {h.timeSlot}</span></td>
                  <td style={{ color: '#34d399', fontWeight: 600 }}>{h.invigilatorStaff}</td>
                  <td style={{ fontWeight: 700, color: '#c084fc' }}>{h.allocatedSeatsCount} Benches</td>
                  {isHOD && (
                    <td>
                      <button
                        onClick={() => handleDeleteHall(h.id || h._id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocation Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content" style={{ maxWidth: '560px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 700 }}>
                🏫 Allocate Exam Hall for Class Section
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '4px 10px' }}>✕</button>
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem',
                backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: msg.type === 'error' ? '#f87171' : '#34d399'
              }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleAllocateHall} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Exam Title *</label>
                  <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Class Section *</label>
                  <select value={classSection} onChange={(e) => setClassSection(e.target.value)} className="input-field">
                    <option value="IV-IT-A">IV-IT-A</option>
                    <option value="III-IT-B">III-IT-B</option>
                    <option value="II-IT-A">II-IT-A</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Exam Hall Name / Room *</label>
                  <input type="text" value={examHall} onChange={(e) => setExamHall(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Subject Title & Code *</label>
                  <input type="text" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} className="input-field" required />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Exam Date *</label>
                  <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Time Slot *</label>
                  <input type="text" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="input-field" required />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Invigilator Staff</label>
                  <input type="text" value={invigilatorStaff} onChange={(e) => setInvigilatorStaff(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Allocated Bench Seats</label>
                  <input type="number" value={allocatedSeatsCount} onChange={(e) => setAllocatedSeatsCount(e.target.value)} className="input-field" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Confirm Hall Allotment 🏫</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

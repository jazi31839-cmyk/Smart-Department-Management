import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TimetableGrid({ classSection, staffEmail, allowAdd = false, onRequestSwap = null }) {
  const { token, user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Form states for HOD adding slots
  const [day, setDay] = useState('Monday');
  const [hourSlot, setHourSlot] = useState(1);
  const [subjectCode, setSubjectCode] = useState('CS-301');
  const [subjectName, setSubjectName] = useState('Software Engineering');
  const [targetStaff, setTargetStaff] = useState('sarah.teacher@gmail.com');
  const [roomNo, setRoomNo] = useState('Lab 204');
  const [alertMsg, setAlertMsg] = useState(null);

  // Swap Request state for Staff
  const [swapCurrent, setSwapCurrent] = useState('Monday - Hour 1 (CS-301)');
  const [swapProposed, setSwapProposed] = useState('Thursday - Hour 3 (CS-301)');
  const [swapReason, setSwapReason] = useState('Faculty Workshop');
  const [swapMsg, setSwapMsg] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = [1, 2, 3, 4, 5, 6, 7, 8];

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = '/api/academic/timetable';
      if (classSection) url += `?classSection=${encodeURIComponent(classSection)}`;
      else if (staffEmail) url += `?staffEmail=${encodeURIComponent(staffEmail)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error('Fetch timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTimetable();
  }, [token, classSection, staffEmail]);

  const getSlotForCell = (dayName, hourNum) => {
    return slots.find(s => s.day === dayName && Number(s.hourSlot) === hourNum);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setAlertMsg(null);

    try {
      const res = await fetch('/api/academic/timetable/slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          classSection: classSection || 'II-IT-A',
          day,
          hourSlot,
          subjectCode,
          subjectName,
          staffEmail: targetStaff,
          staffName: 'Prof. Sarah Jenkins',
          roomNo
        })
      });

      const data = await res.json();

      if (!data.success) {
        setAlertMsg({ type: 'error', text: data.error || 'Failed to add slot' });
        return;
      }

      setAlertMsg({ type: 'success', text: data.message });
      setTimeout(() => {
        setShowAddModal(false);
        setAlertMsg(null);
        fetchTimetable();
      }, 1200);

    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Server error creating timetable slot' });
    }
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    setSwapMsg(null);

    try {
      const res = await fetch('/api/academic/timetable/request-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          classSection: classSection || 'II-IT-A',
          currentSlot: swapCurrent,
          proposedSlot: swapProposed,
          reason: swapReason
        })
      });

      const data = await res.json();
      if (data.success) {
        setSwapMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setShowSwapModal(false);
          setSwapMsg(null);
        }, 1500);
      } else {
        setSwapMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setSwapMsg({ type: 'error', text: 'Failed to submit timetable request' });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Grid Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 Weekly Timetable Schedule Grid (5×6 Slots)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            {classSection ? `Target Class Section: ${classSection}` : `Staff Schedule: ${staffEmail}`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {user.role === 'Staff' && (
            <button onClick={() => setShowSwapModal(true)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              🔄 Request Timetable Change
            </button>
          )}

          {allowAdd && user.role === 'HOD' && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              ➕ Assign Schedule Slot
            </button>
          )}
        </div>
      </div>

      {/* Add Slot Modal for HOD */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
              Assign Timetable Slot ({classSection})
            </h3>

            {alertMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem',
                background: alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.25)',
                color: alertMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${alertMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {alertMsg.text}
              </div>
            )}

            <form onSubmit={handleAddSlot}>
              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Day of Week</label>
                  <select className="form-control" value={day} onChange={(e) => setDay(e.target.value)}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hour Slot (1 to 6)</label>
                  <select className="form-control" value={hourSlot} onChange={(e) => setHourSlot(Number(e.target.value))}>
                    {hours.map(h => <option key={h} value={h}>Hour {h}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Subject Code</label>
                  <input type="text" className="form-control" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Subject Title</label>
                  <input type="text" className="form-control" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
                </div>
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Assigned Staff Gmail</label>
                  <input type="email" className="form-control" value={targetStaff} onChange={(e) => setTargetStaff(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Room / Lab</label>
                  <input type="text" className="form-control" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Validate & Assign Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swap Request Modal for Staff */}
      {showSwapModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
              Request Timetable Change
            </h3>

            {swapMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                background: swapMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: swapMsg.type === 'success' ? '#6ee7b7' : '#fca5a5'
              }}>
                {swapMsg.text}
              </div>
            )}

            <form onSubmit={handleSwapSubmit}>
              <div className="form-group">
                <label>Current Assigned Slot</label>
                <input type="text" className="form-control" value={swapCurrent} onChange={(e) => setSwapCurrent(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Proposed New Slot</label>
                <input type="text" className="form-control" value={swapProposed} onChange={(e) => setSwapProposed(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Reason for Adjustment</label>
                <textarea className="form-control" rows="2" value={swapReason} onChange={(e) => setSwapReason(e.target.value)} required></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowSwapModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-staff">Submit to HOD</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Grid (Day x Hour) */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Loading schedule grid...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ borderCollapse: 'separate', borderSpacing: '6px' }}>
            <thead>
              <tr>
                <th style={{ width: '120px', textAlign: 'center' }}>Day / Slot</th>
                {hours.map(h => (
                  <th key={h} style={{ textAlign: 'center' }}>Hour {h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(dayName => (
                <tr key={dayName}>
                  <td style={{ fontWeight: 800, color: '#c084fc', textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)' }}>
                    {dayName}
                  </td>
                  {hours.map(hourNum => {
                    const slot = getSlotForCell(dayName, hourNum);
                    return (
                      <td key={hourNum} style={{
                        padding: '12px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        background: slot
                          ? slot.isConflict ? 'rgba(239, 68, 68, 0.25)' : 'rgba(30, 41, 59, 0.8)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: slot
                          ? slot.isConflict ? '1px solid #ef4444' : '1px solid rgba(99, 102, 241, 0.3)'
                          : '1px dashed rgba(255, 255, 255, 0.05)'
                      }}>
                        {slot ? (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#818cf8' }}>
                              {slot.subjectCode}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#f8fafc' }}>
                              {slot.subjectName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                              📍 {slot.roomNo} | 👤 {slot.staffName.split(' ')[1] || slot.staffName}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#475569' }}>Free Slot</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

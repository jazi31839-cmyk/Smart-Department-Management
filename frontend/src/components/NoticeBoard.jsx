import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NoticeBoard() {
  const { token, user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);

  // Notice form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Meeting');
  const [targetAudience, setTargetAudience] = useState('All Department Students & Staff');
  const [msg, setMsg] = useState(null);

  // Strict RBAC permission: HOD and Staff can edit/post/delete notices. Students are strictly read-only.
  const isHODOrStaff = user?.role === 'HOD' || user?.role === 'Staff';

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/academic/notices/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotices();
  }, [token]);

  const openCreateModal = () => {
    setEditingNoticeId(null);
    setTitle('');
    setContent('');
    setCategory('Meeting');
    setTargetAudience('All Department Students & Staff');
    setMsg(null);
    setShowModal(true);
  };

  const openEditModal = (notice) => {
    setEditingNoticeId(notice.id || notice._id);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category || 'Meeting');
    setTargetAudience(notice.targetAudience || 'All Department');
    setMsg(null);
    setShowModal(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!title || !content) {
      setMsg({ type: 'error', text: 'Title and message content are required' });
      return;
    }

    try {
      const url = editingNoticeId ? `/api/academic/notices/${editingNoticeId}` : '/api/academic/notices/create';
      const method = editingNoticeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category, targetAudience })
      });
      const data = await res.json();

      if (data.success) {
        setMsg({ type: 'success', text: editingNoticeId ? 'Notice updated successfully!' : 'Notice posted successfully to Notice Board!' });
        setTimeout(() => {
          setShowModal(false);
          setMsg(null);
          setEditingNoticeId(null);
          fetchNotices();
        }, 1000);
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save notice update' });
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      const res = await fetch(`/api/academic/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchNotices();
      }
    } catch (err) {
      console.error('Delete notice error:', err);
    }
  };

  const getBadgeStyle = (cat) => {
    switch (cat) {
      case 'Meeting': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'Exam': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      case 'Urgent': return { bg: 'rgba(225, 29, 72, 0.2)', color: '#fda4af', border: 'rgba(225, 29, 72, 0.4)' };
      default: return { bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📢</span> Department Notice Board & Announcements
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            {isHODOrStaff ? 'Official announcements (HOD & Staff view & edit mode)' : 'Official department announcements (Read-Only Student Mode)'}
          </p>
        </div>
        {isHODOrStaff && (
          <button
            onClick={openCreateModal}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>➕</span> Add New Notice
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Loading notices...</div>
      ) : notices.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No announcements posted yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {notices.map((n) => {
            const badge = getBadgeStyle(n.category);
            return (
              <div
                key={n.id || n._id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        textTransform: 'uppercase'
                      }}
                    >
                      {n.category || 'General'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {n.title}
                  </h4>

                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {n.content}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    By: <strong style={{ color: '#38bdf8' }}>{n.authorName}</strong> ({n.authorRole})
                  </div>
                  {isHODOrStaff && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(n)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          color: '#60a5fa',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                        title="Edit Notice"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(n.id || n._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                        title="Delete Notice"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Creation & Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="glass-panel modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: 700 }}>
                {editingNoticeId ? '✏️ Edit Notice Board Announcement' : '📢 Post New Notice / Announcement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '4px 10px' }}>✕</button>
            </div>

            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: msg.type === 'error' ? '#f87171' : '#34d399' }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSaveNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow is a Parent-Teacher Meeting (PTM)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                    <option value="Meeting">Meeting (PTM/Events)</option>
                    <option value="General">General Announcement</option>
                    <option value="Exam">Exam / Academic</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. All Students & Parents"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Announcement Details *
                </label>
                <textarea
                  rows="4"
                  placeholder="Write the full message update here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNoticeId ? 'Update Notice ✏️' : 'Publish Notice 📢'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

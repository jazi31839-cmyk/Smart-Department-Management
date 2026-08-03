import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function FeedbackModal({ isOpen, onClose, targetTitle = 'CS-302 Lecture Notes' }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [msg, setMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/academic/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType: 'Material',
          targetTitle,
          rating: Number(rating),
          comments
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          setComments('');
          setMsg(null);
          onClose();
        }, 1400);
      } else {
        setMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to submit feedback' });
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '460px', padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
          ⭐ Submit Material & Lecture Feedback
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
          Resource: <strong style={{ color: '#fcd34d' }}>{targetTitle}</strong>
        </p>

        {msg && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: msg.type === 'success' ? '#6ee7b7' : '#fca5a5'
          }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Star Rating (1 to 5 Stars)</label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', cursor: 'pointer', margin: '6px 0' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{ color: star <= rating ? '#f59e0b' : '#475569', transition: 'color 0.15s' }}
                >
                  ★
                </span>
              ))}
              <span style={{ fontSize: '0.9rem', color: '#f8fafc', marginLeft: '10px', alignSelf: 'center', fontWeight: 700 }}>
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Your Feedback / Review Comments</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Great examples on database indexing and query optimization..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-student">Submit Feedback</button>
          </div>
        </form>
      </div>
    </div>
  );
}

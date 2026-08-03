import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function HeaderNavbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'HOD':
        return <span className="badge badge-hod">HOD Authority</span>;
      case 'Staff':
        return <span className="badge badge-staff">Staff / Faculty</span>;
      case 'Student':
        return <span className="badge badge-student">Student Access</span>;
      default:
        return null;
    }
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '24px' }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        
        {/* Brand & System Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            🎓
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Campus Vault & Management System
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              3-Tier RBAC (HOD • Staff • Student) | Secure Document Storage
            </p>
          </div>
        </div>

        {/* User Info & Role Switcher */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {user.email} | {user.department}
              </div>
            </div>

            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              🔒 Logout
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Secure Authentication Required
          </div>
        )}

      </div>
    </header>
  );
}

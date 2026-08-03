import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login, loading, error, setError } = useAuth();
  const [selectedRole, setSelectedRole] = useState('HOD'); // HOD | Staff | Student
  const [email, setEmail] = useState('hodit@gmail.com');
  const [password, setPassword] = useState('hod123');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'HOD') {
      setEmail('hodit@gmail.com');
      setPassword('hod123');
    } else if (role === 'Staff') {
      setEmail('ezhilarasi.teacher@gmail.com');
      setPassword('staff123');
    } else if (role === 'Student') {
      setEmail('kiresh.student@gmail.com');
      setPassword('student123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Security Rule: Account User ID must be a valid email address');
      return;
    }
    try {
      await login(email, password, selectedRole);
    } catch (err) {
      // error handled in context
    }
  };

  const getRoleHeaderStyle = () => {
    switch (selectedRole) {
      case 'HOD':
        return { accentColor: '#8b5cf6', title: 'HOD Portal Login', desc: 'Manage Department, HOD accounts & Staff credentials' };
      case 'Staff':
        return { accentColor: '#10b981', title: 'Staff / Faculty Login', desc: 'Secure File Storage, Private Staff Docs & Student Account Management' };
      case 'Student':
        return { accentColor: '#f59e0b', title: 'Student Portal Login', desc: 'Review Academic Details, View Records & Shared Course Documents' };
      default:
        return { accentColor: '#6366f1', title: 'Portal Login', desc: '' };
    }
  };

  const roleStyle = getRoleHeaderStyle();

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }} className="animate-fade">
      <div className="glass-panel" style={{ padding: '36px' }}>
        
        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '28px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => handleRoleChange('HOD')}
            className="btn"
            style={{
              padding: '10px 6px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              justifyContent: 'center',
              background: selectedRole === 'HOD' ? 'var(--hod-gradient)' : 'transparent',
              color: selectedRole === 'HOD' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            👑 HOD
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('Staff')}
            className="btn"
            style={{
              padding: '10px 6px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              justifyContent: 'center',
              background: selectedRole === 'Staff' ? 'var(--staff-gradient)' : 'transparent',
              color: selectedRole === 'Staff' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            👩‍🏫 Staff
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('Student')}
            className="btn"
            style={{
              padding: '10px 6px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              justifyContent: 'center',
              background: selectedRole === 'Student' ? 'var(--student-gradient)' : 'transparent',
              color: selectedRole === 'Student' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            🎓 Student
          </button>
        </div>

        {/* Tab Header Info */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: roleStyle.accentColor, marginBottom: '6px' }}>
            {roleStyle.title}
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            {roleStyle.desc}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Gmail Account User ID (@gmail.com required)</label>
            <input
              type="email"
              className="form-control"
              placeholder="username@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ marginBottom: '6px', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '90px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn ${selectedRole === 'HOD' ? 'btn-primary' : selectedRole === 'Staff' ? 'btn-staff' : 'btn-student'}`}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? 'Authenticating Credentials...' : `Login to ${selectedRole} Dashboard`}
          </button>
        </form>

      </div>
    </div>
  );
}

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import HeaderNavbar from './components/HeaderNavbar';
import LoginView from './components/LoginView';
import HODDashboard from './components/HODDashboard';
import StaffDashboard from './components/StaffDashboard';
import StudentDashboard from './components/StudentDashboard';

function MainApp() {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    if (!user) return <LoginView />;

    switch (user.role) {
      case 'HOD':
        return <HODDashboard />;
      case 'Staff':
        return <StaffDashboard />;
      case 'Student':
        return <StudentDashboard />;
      default:
        return <LoginView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <HeaderNavbar />
      <main className="app-container">
        {renderRoleDashboard()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

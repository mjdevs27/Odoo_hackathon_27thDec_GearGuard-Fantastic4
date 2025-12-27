import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WorkCenters from './pages/dashboard/WorkCenters';
import DashboardPage from './pages/dashboard/DashboardPage';
import MaintenanceRequestPage from './pages/dashboard/MaintenanceRequestPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/work-centers" element={<ProtectedRoute><WorkCenters /></ProtectedRoute>} />

        {/* Maintenance Request Routes */}
        <Route path="/dashboard/request/new" element={<ProtectedRoute><MaintenanceRequestPage /></ProtectedRoute>} />
        <Route path="/dashboard/request/:id" element={<ProtectedRoute><MaintenanceRequestPage /></ProtectedRoute>} />

        {/* Placeholder routes for future pages - will be added by teammates */}
        {/* <Route path="/dashboard/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WorkCenters from './pages/dashboard/WorkCenters';
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
        {/* Redirect /dashboard to /dashboard/work-centers */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/work-centers" replace />} />
        <Route path="/dashboard/work-centers" element={<ProtectedRoute><WorkCenters /></ProtectedRoute>} />

        {/* Placeholder routes for future pages - will be added by teammates */}
        {/* <Route path="/dashboard/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  );
}

export default App;

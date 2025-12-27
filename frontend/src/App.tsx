import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WorkCenters from './pages/dashboard/WorkCenters';
import DashboardPage from './pages/dashboard/DashboardPage';
import MaintenanceRequestPage from './pages/dashboard/MaintenanceRequestPage';
import EquipmentListPage from './pages/dashboard/EquipmentListPage';
import EquipmentFormPage from './pages/dashboard/EquipmentFormPage';
import EquipmentCategoriesPage from './pages/dashboard/EquipmentCategoriesPage';
import MaintenanceCalendarPage from './pages/dashboard/MaintenanceCalendarPage';
import TeamsPage from './pages/dashboard/TeamsPage';
import ReportingPage from './pages/dashboard/ReportingPage';
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

        {/* Equipment Routes */}
        <Route path="/dashboard/equipment" element={<ProtectedRoute><EquipmentListPage /></ProtectedRoute>} />
        <Route path="/dashboard/equipment/new" element={<ProtectedRoute><EquipmentFormPage /></ProtectedRoute>} />
        <Route path="/dashboard/equipment/:id" element={<ProtectedRoute><EquipmentFormPage /></ProtectedRoute>} />

        {/* Equipment Categories Route */}
        <Route path="/dashboard/equipment-categories" element={<ProtectedRoute><EquipmentCategoriesPage /></ProtectedRoute>} />

        {/* Maintenance Calendar Route */}
        <Route path="/dashboard/calendar" element={<ProtectedRoute><MaintenanceCalendarPage /></ProtectedRoute>} />

        {/* Teams Route */}
        <Route path="/dashboard/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />

        {/* Reporting Route */}
        <Route path="/dashboard/reporting" element={<ProtectedRoute><ReportingPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { TrainLoaderProvider } from './context/TrainLoaderContext';
import ProtectedRoute from './components/ProtectedRoute';
import TrainLoader from './components/TrainLoader';
import PageTransition from './components/PageTransition';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import ComplaintForm from './pages/citizen/ComplaintForm';
import TrackComplaint from './pages/citizen/TrackComplaint';

// Authority pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import ComplaintList from './pages/authority/ComplaintList';
import ComplaintDetail from './pages/authority/ComplaintDetail';

const CITIZEN_ROLES = ['citizen'];
const ADMIN_ROLES = ['traffic_admin', 'railway_admin'];

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

        {/* Citizen (protected) */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <PageTransition><CitizenDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <PageTransition><ComplaintForm /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/track" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <PageTransition><TrackComplaint /></PageTransition>
          </ProtectedRoute>
        } />

        {/* Authority (protected) */}
        <Route path="/authority" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <PageTransition><AuthorityDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/authority/complaints" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <PageTransition><ComplaintList /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/authority/complaints/:id" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <PageTransition><ComplaintDetail /></PageTransition>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TrainLoaderProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          {/* Global train loader overlay */}
          <TrainLoader />
          <AnimatedRoutes />
        </BrowserRouter>
      </TrainLoaderProvider>
    </AuthProvider>
  );
}

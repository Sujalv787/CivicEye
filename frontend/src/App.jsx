import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { TrainLoaderProvider } from './context/TrainLoaderContext';
import ProtectedRoute from './components/ProtectedRoute';
import TrainLoader from './components/TrainLoader';
import PageTransition from './components/PageTransition';
import ErrorBoundary from './components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CitizenDashboard = lazy(() => import('./pages/citizen/Dashboard'));
const ComplaintForm = lazy(() => import('./pages/citizen/ComplaintForm'));
const TrackComplaint = lazy(() => import('./pages/citizen/TrackComplaint'));
const AuthorityDashboard = lazy(() => import('./pages/authority/AuthorityDashboard'));
const ComplaintList = lazy(() => import('./pages/authority/ComplaintList'));
const ComplaintDetail = lazy(() => import('./pages/authority/ComplaintDetail'));

const CITIZEN_ROLES = ['citizen'];
const ADMIN_ROLES = ['traffic_admin', 'railway_admin'];

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-orange-600 animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Suspense fallback={<PageLoader />}><PageTransition><LandingPage /></PageTransition></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><PageTransition><LoginPage /></PageTransition></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><PageTransition><RegisterPage /></PageTransition></Suspense>} />

        {/* Citizen (protected) */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><CitizenDashboard /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><ComplaintForm /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/track" element={
          <ProtectedRoute roles={CITIZEN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><TrackComplaint /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* Authority (protected) */}
        <Route path="/authority" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><AuthorityDashboard /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/authority/complaints" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><ComplaintList /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/authority/complaints/:id" element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <Suspense fallback={<PageLoader />}><PageTransition><ComplaintDetail /></PageTransition></Suspense>
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
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <TrainLoaderProvider>
            <BrowserRouter>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              <TrainLoader />
              <AnimatedRoutes />
            </BrowserRouter>
          </TrainLoaderProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

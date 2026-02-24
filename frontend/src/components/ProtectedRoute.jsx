import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children, roles }) => {
    const { user, token } = useAuth();
    const location = useLocation();
    const hasToasted = useRef(false);

    useEffect(() => {
        if (!token && !hasToasted.current) {
            hasToasted.current = true;
            toast.error('Please login or register to file a report.', { duration: 5000, id: 'login-required' });
        }
    }, [token]);

    if (!token || !user) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location.pathname, message: 'Please login or register to file a report.' }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect to the right dashboard based on role
        if (user.role === 'citizen') return <Navigate to="/dashboard" replace />;
        return <Navigate to="/authority" replace />;
    }

    return children;
};

export default ProtectedRoute;

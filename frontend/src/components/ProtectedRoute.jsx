import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children, roles }) => {
    const { user, token, isReady } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const hasToasted = useRef(false);

    useEffect(() => {
        if (isReady && !token && !hasToasted.current) {
            hasToasted.current = true;
            toast.error(t('protectedRoute.loginRequired'), { duration: 5000, id: 'login-required' });
        }
    }, [isReady, token, t]);

    // Wait until localStorage has been read before making any redirect decision
    if (!isReady) {
        return null; // or a tiny spinner if you prefer
    }

    if (!token || !user) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location.pathname, messageKey: 'protectedRoute.loginRequired' }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect to the right dashboard based on role
        if (user.role === 'citizen') return <Navigate to="/dashboard" replace />;
        return <Navigate to="/authority" replace />;
    }

    return children;
};

export default ProtectedRoute;

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ce_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('ce_token') || null);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('ce_token', data.token);
            localStorage.setItem('ce_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed.' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('ce_token', data.token);
            localStorage.setItem('ce_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Registration failed.' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('ce_token');
        localStorage.removeItem('ce_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

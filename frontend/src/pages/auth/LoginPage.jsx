import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowRight, AlertCircle, Shield, TrainFront } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login, googleLogin, loading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [demoLoading, setDemoLoading] = useState(false);

    // Check if redirected from ProtectedRoute
    const redirectMessageKey = location.state?.messageKey || '';
    const redirectFrom = location.state?.from || '';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(form.email, form.password);
        if (result.success) {
            toast.success(t('login.welcomeBackToast', { name: result.user.name }));
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else if (result.user.role === 'citizen') {
                navigate('/dashboard');
            } else {
                navigate('/authority');
            }
        } else {
            setError(result.message || t(result.fallbackKey));
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            toast.success(t('login.welcomeBackToast', { name: result.user.name }));
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else if (result.user.role === 'citizen') {
                navigate('/dashboard');
            } else {
                navigate('/authority');
            }
        } else {
            setError(result.message || t(result.fallbackKey));
        }
    };

    const handleDemoAdmin = async () => {
        setError('');
        setDemoLoading(true);
        const result = await login('demo@civiceye.com', 'demo1234');
        setDemoLoading(false);
        if (result.success) {
            toast.success(t('login.welcomeBackToast', { name: result.user.name }));
            navigate('/authority');
        } else {
            setError(result.message || t(result.fallbackKey));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mx-auto mb-4">
                            <TrainFront size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('login.welcomeBack')}</h1>
                        <p className="text-slate-500 text-sm mt-1">{t('login.signInTo')}</p>
                    </div>

                    {/* Redirect message from protected route */}
                    {redirectMessageKey && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm">
                            <Shield size={16} />
                            {t(redirectMessageKey)}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('common.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder={t('login.emailPlaceholder')}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('common.password')}</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('login.passwordPlaceholder')}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition text-sm"
                        >
                            {loading ? t('login.signingIn') : <><span>{t('login.signIn')}</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs font-medium text-slate-400 uppercase">{t('login.orContinueWith')}</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google Sign-In */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError(t('login.googleFailed'))}
                            text="continue_with"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>

                    {/* Demo Admin */}
                    <button
                        type="button"
                        onClick={handleDemoAdmin}
                        disabled={demoLoading || loading}
                        className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-white font-semibold rounded-lg transition text-sm"
                    >
                        <Shield size={16} />
                        {demoLoading ? t('login.signingIn') : t('login.demoAdmin')}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-1">{t('login.demoAdminHint')}</p>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {t('login.noAccount')}{' '}
                        <Link to="/register" className="text-orange-600 font-medium hover:underline">{t('common.register')}</Link>
                    </p>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        <Link to="/" className="hover:underline">{t('common.backToHome')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

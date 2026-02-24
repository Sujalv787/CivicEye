import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, TrainFront } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register, googleLogin, loading } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    // Restore redirect destination if user was sent here from a protected route
    const redirectFrom = location.state?.from || '';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 8) {
            setError(t('register.passwordMinLength'));
            return;
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) {
            toast.success(t('register.welcomeToast', { name: result.user.name }));
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(result.message || t(result.fallbackKey));
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            toast.success(t('register.welcomeToast', { name: result.user.name }));
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(result.message || t(result.fallbackKey));
        }
    };

    const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length >= 4 ? 1 : 0;
    const strengthColor = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][strength];
    const strengthLabel = ['', t('register.weak'), t('register.fair'), t('register.strong')][strength];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mx-auto mb-4">
                            <TrainFront size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('register.createAccount')}</h1>
                        <p className="text-slate-500 text-sm mt-1">{t('register.joinCivicEye')}</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('register.fullName')}</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder={t('register.namePlaceholder')}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('common.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder={t('register.emailPlaceholder')}
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
                                    placeholder={t('register.passwordPlaceholder')}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1.5 mb-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">{strengthLabel}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700 space-y-1">
                            <p className="font-medium">{t('register.agreementTitle')}</p>
                            <p>• {t('register.agreementOne')}</p>
                            <p>• {t('register.agreementTwo')}</p>
                            <p>• {t('register.agreementThree')}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition text-sm"
                        >
                            {loading ? t('register.creatingAccount') : <><span>{t('register.createAccountBtn')}</span> <ArrowRight size={16} /></>}
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

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {t('register.alreadyHaveAccount')}{' '}
                        <Link to="/login" className="text-orange-600 font-medium hover:underline">{t('common.signIn')}</Link>
                    </p>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        <Link to="/" className="hover:underline">{t('common.backToHome')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

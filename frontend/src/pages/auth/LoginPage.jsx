import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');

    // Check if redirected from ProtectedRoute
    const redirectMessage = location.state?.message || '';
    const redirectFrom = location.state?.from || '';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(form.email, form.password);
        if (result.success) {
            toast.success(`Welcome back, ${result.user.name}!`);
            // If they were redirected from a protected route, send them back
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else if (result.user.role === 'citizen') {
                navigate('/dashboard');
            } else {
                navigate('/authority');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                            <Eye size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                        <p className="text-slate-500 text-sm mt-1">Sign in to CivicEye</p>
                    </div>

                    {/* Redirect message from protected route */}
                    {redirectMessage && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm">
                            <Shield size={16} />
                            {redirectMessage}
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
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
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
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition text-sm"
                        >
                            {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
                    </p>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        <Link to="/" className="hover:underline">← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

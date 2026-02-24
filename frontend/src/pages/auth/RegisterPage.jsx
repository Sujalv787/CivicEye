import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register, loading } = useAuth();
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
            setError('Password must be at least 8 characters.');
            return;
        }
        const result = await register(form.name, form.email, form.password);
        if (result.success) {
            toast.success(`Welcome, ${result.user.name}! Account created successfully.`);
            if (redirectFrom) {
                navigate(redirectFrom, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(result.message);
        }
    };

    const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length >= 4 ? 1 : 0;
    const strengthColor = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][strength];
    const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                            <Eye size={22} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
                        <p className="text-slate-500 text-sm mt-1">Join CivicEye as a citizen reporter</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="Ravi Kumar"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
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
                                    placeholder="Min. 8 characters"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
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

                        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 space-y-1">
                            <p className="font-medium">By registering you agree that:</p>
                            <p>• Only verified evidence-based reports will be accepted</p>
                            <p>• False reports are prohibited and may lead to account suspension</p>
                            <p>• CivicEye is an independent platform, not affiliated with any govt. body</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition text-sm"
                        >
                            {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
                    </p>
                    <p className="text-center text-xs text-slate-400 mt-2">
                        <Link to="/" className="hover:underline">← Back to home</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

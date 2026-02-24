import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import {
    LayoutDashboard, FileText, Search, LogOut, ShieldCheck, TrainFront, X,
} from 'lucide-react';

const citizenLinks = [
    { to: '/dashboard', tKey: 'sidebar.dashboard', icon: LayoutDashboard },
    { to: '/report', tKey: 'sidebar.submitReport', icon: FileText },
    { to: '/track', tKey: 'sidebar.trackComplaint', icon: Search },
];

const authorityLinks = [
    { to: '/authority', tKey: 'sidebar.overview', icon: LayoutDashboard },
    { to: '/authority/complaints', tKey: 'sidebar.allComplaints', icon: FileText },
    { to: '/authority/analytics', tKey: 'sidebar.analytics', icon: ShieldCheck },
];

export default function Sidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const links = user?.role === 'citizen' ? citizenLinks : authorityLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    flex flex-col h-screen w-64 bg-slate-900 text-slate-100 fixed left-0 top-0 z-50
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Logo + mobile close */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center">
                            <TrainFront size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{t('common.civicEye')}</h1>
                            <p className="text-xs text-slate-400">{t('common.accountabilityPlatform')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* User info */}
                <div className="px-6 py-4 border-b border-slate-700">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'citizen' ? 'bg-orange-800 text-orange-200' :
                        user?.role === 'traffic_admin' ? 'bg-amber-800 text-amber-200' :
                            'bg-emerald-800 text-emerald-200'
                        }`}>
                        {user?.role?.replace('_', ' ')}
                    </span>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {links.map(({ to, tKey, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/authority' || to === '/dashboard'}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-orange-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {t(tKey)}
                        </NavLink>
                    ))}
                </nav>

                {/* Language Switcher + Logout */}
                <div className="px-4 py-3 border-t border-slate-700 space-y-3">
                    <div className="flex justify-center">
                        <LanguageSwitcher variant="dark" />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/40 hover:text-red-400 transition-all w-full"
                    >
                        <LogOut size={18} />
                        {t('common.signOut')}
                    </button>
                </div>
            </aside>
        </>
    );
}

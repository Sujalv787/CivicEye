import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileText, Search, LogOut, ShieldCheck, Eye, Train, Car,
} from 'lucide-react';

const citizenLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Submit Report', icon: FileText },
    { to: '/track', label: 'Track Complaint', icon: Search },
];

const authorityLinks = [
    { to: '/authority', label: 'Overview', icon: LayoutDashboard },
    { to: '/authority/complaints', label: 'All Complaints', icon: FileText },
    { to: '/authority/analytics', label: 'Analytics', icon: ShieldCheck },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const links = user?.role === 'citizen' ? citizenLinks : authorityLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="flex flex-col h-screen w-64 bg-slate-900 text-slate-100 fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Eye size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">CivicEye</h1>
                    <p className="text-xs text-slate-400">Accountability Platform</p>
                </div>
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b border-slate-700">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${user?.role === 'citizen' ? 'bg-blue-800 text-blue-200' :
                    user?.role === 'traffic_admin' ? 'bg-amber-800 text-amber-200' :
                        'bg-emerald-800 text-emerald-200'
                    }`}>
                    {user?.role?.replace('_', ' ')}
                </span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/authority' || to === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-slate-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/40 hover:text-red-400 transition-all w-full"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../i18n/localeMap';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Clock, Search, CheckCircle, XCircle, ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { STATUS_STYLES, STATUS_T_KEYS } from '../../utils/statusConfig';

function StatCard({ label, value, icon: Icon, colorCls, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}>
                <Icon size={18} />
            </div>
            <p className="text-3xl font-black text-slate-900">{value ?? 0}</p>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">{label}</p>
        </motion.div>
    );
}

function StatusBadge({ status, t }) {
    const s = STATUS_STYLES[status] || { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {t(STATUS_T_KEYS[status]) || status}
        </span>
    );
}

export default function AuthorityDashboard() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const locale = getLocale(i18n.language);

    useEffect(() => {
        Promise.all([
            api.get('/authority/analytics'),
            api.get('/authority/complaints?limit=6'),
        ]).then(([analyticsRes, complaintsRes]) => {
            setStats(analyticsRes.data.stats);
            setTrend(analyticsRes.data.dailyTrend);
            setRecent(complaintsRes.data.complaints);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-orange-600 animate-spin" />
            </div>
        </DashboardLayout>
    );

    const statCards = [
        { label: t('authority.totalReports'), value: stats?.total, icon: FileText, colorCls: 'bg-orange-50 text-orange-600' },
        { label: t('authority.underReview'), value: stats?.underReview, icon: Clock, colorCls: 'bg-amber-50 text-amber-600' },
        { label: t('authority.investigating'), value: stats?.investigating, icon: Search, colorCls: 'bg-purple-50 text-purple-600' },
        { label: t('authority.resolved'), value: stats?.resolved, icon: CheckCircle, colorCls: 'bg-emerald-50 text-emerald-600' },
        { label: t('authority.actionTaken'), value: stats?.actionTaken, icon: Zap, colorCls: 'bg-violet-50 text-violet-600' },
        { label: t('authority.rejected'), value: stats?.rejected, icon: XCircle, colorCls: 'bg-red-50 text-red-600' },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">{t('authority.title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {user?.role === 'railway_admin' ? t('authority.railwayOverview')
                            : user?.role === 'traffic_admin' ? t('authority.trafficOverview')
                                : t('authority.allOverview')}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs text-orange-700 font-semibold">
                    <Shield size={12} /> {t('authority.adminBadge')}
                </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.05} />)}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Status breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <TrendingUp size={16} className="text-orange-600" /> {t('authority.statusBreakdown')}
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(STATUS_STYLES).map(([status, s]) => {
                            const keyMap = {
                                'Under Review': 'underReview',
                                'Investigating': 'investigating',
                                'Action Taken': 'actionTaken',
                                'Resolved': 'resolved',
                                'Rejected': 'rejected',
                            };
                            const val = stats?.[keyMap[status]] || 0;
                            const pct = stats?.total ? Math.round((val / stats.total) * 100) : 0;
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-600 font-medium">{t(STATUS_T_KEYS[status])}</span>
                                        <span className="font-bold text-slate-900">{val}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-2 rounded-full ${s.dot}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Daily trend chart */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">{t('authority.trendTitle')}</h3>
                    {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={trend} margin={{ left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                <Tooltip formatter={(v) => [v, t('common.reports')]} labelFormatter={(l) => t('authority.trendTooltipDate', { label: l })} />
                                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-44 text-slate-400 text-sm">{t('common.noData')}</div>
                    )}
                </div>
            </div>

            {/* Recent complaints */}
            <div className="bg-white rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">{t('authority.recentReports')}</h3>
                    <Link to="/authority/complaints" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                        {t('common.viewAll')} <ArrowRight size={14} />
                    </Link>
                </div>
                {recent.length === 0 ? (
                    <div className="py-14 text-center text-slate-400 text-sm">{t('authority.noComplaints')}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.ticketId')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.route')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.categoryHeader')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.degreeHeader')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.statusHeader')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs tracking-wide">{t('authority.dateHeader')}</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((c, i) => (
                                    <motion.tr
                                        key={c._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-slate-50 hover:bg-slate-50/80 transition"
                                    >
                                        <td className="px-6 py-4 font-mono text-orange-700 text-xs font-bold">{c.ticketId}</td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">
                                            {c.sourceStation && c.destinationStation
                                                ? `${c.sourceStation} → ${c.destinationStation}`
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{c.complaintCategory || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold ${c.complaintDegree === 'Serious' ? 'text-rose-600' : c.complaintDegree === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {c.complaintDegree || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={c.status} t={t} /></td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString(locale)}</td>
                                        <td className="px-6 py-4">
                                            <Link to={`/authority/complaints/${c._id}`} className="text-orange-600 hover:text-orange-700 text-xs font-semibold">{t('common.reviewArrow')}</Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

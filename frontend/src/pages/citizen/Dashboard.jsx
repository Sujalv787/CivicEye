import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrainLoader } from '../../context/TrainLoaderContext';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../i18n/localeMap';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, XCircle,
    PlusCircle, ArrowRight, Copy, X, Sparkles
} from 'lucide-react';
import { STATUS_STYLES, STATUS_T_KEYS } from '../../utils/statusConfig';

export default function CitizenDashboard() {
    const { user } = useAuth();
    const { showLoader } = useTrainLoader();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(false);
    const [copied, setCopied] = useState(false);
    const bannerTimerRef = useRef(null);

    // New ticket ID passed from ComplaintForm success screen
    const newTicketId = location.state?.newTicketId || null;

    useEffect(() => {
        api.get('/complaints/my')
            .then(({ data }) => setComplaints(data.complaints))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Show success banner if coming from fresh submission
    useEffect(() => {
        if (newTicketId) {
            setShowBanner(true);
            bannerTimerRef.current = setTimeout(() => setShowBanner(false), 10000);
        }
        return () => clearTimeout(bannerTimerRef.current);
    }, [newTicketId]);

    const handleCopy = () => {
        if (!newTicketId) return;
        navigator.clipboard.writeText(newTicketId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stats = {
        total: complaints.length,
        underReview: complaints.filter(c => c.status === 'Under Review').length,
        resolved: complaints.filter(c => ['Resolved', 'Action Taken'].includes(c.status)).length,
        rejected: complaints.filter(c => c.status === 'Rejected').length,
    };

    const locale = getLocale(i18n.language);

    return (
        <DashboardLayout>
            {/* ── New Report Success Banner ── */}
            <AnimatePresence>
                {showBanner && newTicketId && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="mb-6 rounded-2xl overflow-hidden shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', border: '1px solid #10b98155' }}
                    >
                        <div className="p-5 flex items-center gap-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center">
                                <Sparkles size={22} className="text-emerald-300" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-emerald-100 font-bold text-lg leading-tight mb-0.5">
                                    {t('citizenDash.reportSubmitted')}
                                </p>
                                <p className="text-emerald-300 text-sm">
                                    {t('citizenDash.grievanceUnderReview')}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-mono text-xl font-black text-white tracking-widest">
                                        {newTicketId}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition"
                                        title="Copy ticket ID"
                                    >
                                        <Copy size={15} />
                                    </button>
                                    {copied && (
                                        <span className="text-xs text-emerald-300 font-medium">{t('common.copied')}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Link
                                    to="/track"
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold rounded-xl transition"
                                >
                                    {t('common.trackReport')}
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowBanner(false);
                                        clearTimeout(bannerTimerRef.current);
                                    }}
                                    className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Auto-dismiss progress bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 10, ease: 'linear' }}
                            className="h-0.5 bg-emerald-400/60"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('citizenDash.welcome', { name: user?.name })}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('citizenDash.overview')}</p>
                </div>
                <button
                    onClick={() => showLoader(() => navigate('/report'))}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
                >
                    <PlusCircle size={16} /> {t('citizenDash.fileReport')}
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: t('citizenDash.totalReports'), value: stats.total, icon: FileText, color: 'text-orange-600 bg-orange-50' },
                    { label: t('citizenDash.underReview'), value: stats.underReview, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                    { label: t('citizenDash.resolved'), value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                    { label: t('citizenDash.rejected'), value: stats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon size={20} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Complaints table */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">{t('citizenDash.myReports')}</h2>
                    <Link to="/track" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
                        {t('common.trackReport')} <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400">{t('common.loading')}</div>
                ) : complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FileText size={40} className="mb-3 opacity-30" />
                        <p className="text-sm">{t('citizenDash.noReports')}</p>
                        <button onClick={() => showLoader(() => navigate('/report'))} className="mt-3 text-sm text-orange-600 hover:underline">{t('citizenDash.submitFirst')}</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">{t('citizenDash.ticketId')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">{t('citizenDash.route')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">{t('citizenDash.category')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">{t('citizenDash.statusLabel')}</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">{t('citizenDash.date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => {
                                    const isNew = newTicketId && c.ticketId === newTicketId;
                                    return (
                                        <tr
                                            key={c._id}
                                            className={`border-b border-slate-50 transition ${isNew
                                                ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-200'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-mono font-bold text-xs ${isNew ? 'text-emerald-700' : 'text-orange-700'}`}>
                                                        {c.ticketId || '—'}
                                                    </span>
                                                    {isNew && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                                                            {t('common.new')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-xs">
                                                {c.sourceStation && c.destinationStation
                                                    ? `${c.sourceStation} → ${c.destinationStation}`
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{c.complaintCategory || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]?.pill || 'bg-slate-100 text-slate-600'}`}>
                                                    {t(STATUS_T_KEYS[c.status]) || c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString(locale)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

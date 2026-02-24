import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../../i18n/localeMap';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Search, CheckCircle, Clock, XCircle, ChevronRight, TrainFront, Zap, FileSearch, Train, MapPin, Calendar } from 'lucide-react';
import { ALL_STATUSES, STATUS_T_KEYS, STATUS_CONFIG } from '../../utils/statusConfig';

export default function TrackComplaint() {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [id, setId] = useState(location.state?.ticketId || '');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const locale = getLocale(i18n.language);

    const performSearch = async (searchId) => {
        if (!searchId.trim()) return;
        setLoading(true);
        setError('');
        setComplaint(null);
        try {
            const { data } = await api.get(`/complaints/track/${searchId.trim().toUpperCase()}`);
            setComplaint(data.complaint);
        } catch (err) {
            setError(err.response?.data?.message || 'Complaint not found.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.ticketId) {
            performSearch(location.state.ticketId);
        }
    }, [location.state?.ticketId]);

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch(id);
    };

    const statusIdx = complaint ? ALL_STATUSES.indexOf(complaint.status) : -1;

    const inner = (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{t('track.title')}</h1>
                <p className="text-slate-500 text-sm mt-1">{t('track.subtitle')}</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <input
                    value={id}
                    onChange={(e) => setId(e.target.value.toUpperCase())}
                    placeholder={t('track.placeholder')}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition text-sm">
                    <Search size={16} /> {loading ? t('track.searching') : t('track.trackBtn')}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">{error}</div>
            )}

            {complaint && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">{t('track.ticketId')}</p>
                            <p className="font-mono text-xl font-bold text-orange-700">{complaint.ticketId}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${complaint.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-indigo-100 text-indigo-700'
                            }`}>
                            {t(STATUS_T_KEYS[complaint.status]) || complaint.status}
                        </span>
                    </div>

                    {/* Details — no PNR displayed */}
                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MapPin size={10} /> {t('track.source')}</p>
                                <p className="font-semibold text-slate-800">{complaint.sourceStation || '—'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><MapPin size={10} /> {t('track.destination')}</p>
                                <p className="font-semibold text-slate-800">{complaint.destinationStation || '—'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Calendar size={10} /> {t('track.filingTime')}</p>
                                <p className="font-semibold text-slate-800">{new Date(complaint.createdAt).toLocaleString(locale)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Train size={10} /> {t('track.category')}</p>
                                <p className="font-semibold text-slate-800">{complaint.complaintCategory || '—'}</p>
                            </div>
                        </div>

                        {/* Status Progress */}
                        {complaint.status !== 'Rejected' && (
                            <div className="pt-2">
                                <p className="text-xs text-slate-400 mb-4">{t('track.progress')}</p>
                                <div className="flex items-center gap-0">
                                    {ALL_STATUSES.filter(s => s !== 'Rejected').map((s, i) => {
                                        const activeIdx = ALL_STATUSES.filter(x => x !== 'Rejected').indexOf(complaint.status);
                                        const past = i <= activeIdx;
                                        const current = i === activeIdx;
                                        const StatusIcon = STATUS_CONFIG[s]?.icon || Clock;
                                        return (
                                            <div key={s} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${past ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-400'} ${current ? 'ring-4 ring-orange-200' : ''}`}>
                                                        {past ? <CheckCircle size={14} /> : <StatusIcon size={14} />}
                                                    </div>
                                                    <p className={`text-center mt-1.5 leading-tight w-16 text-[10px] ${past ? 'text-orange-700 font-medium' : 'text-slate-400'}`}>{t(STATUS_T_KEYS[s])}</p>
                                                </div>
                                                {i < ALL_STATUSES.filter(x => x !== 'Rejected').length - 1 && (
                                                    <div className={`flex-1 h-0.5 mb-5 -mx-1 ${i < activeIdx ? 'bg-orange-600' : 'bg-slate-200'}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {complaint.status === 'Rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-red-700 mb-1">{t('track.complaintRejected')}</p>
                                <p className="text-xs text-red-600">{t('track.rejectedReason')}</p>
                            </div>
                        )}

                        {/* Status History Timeline */}
                        {complaint.statusHistory?.length > 0 && (
                            <div className="pt-2">
                                <p className="text-xs text-slate-400 mb-3">{t('track.statusHistory')}</p>
                                <div className="relative pl-5 space-y-3">
                                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
                                    {[...complaint.statusHistory].reverse().map((h, i) => (
                                        <div key={i} className="relative flex items-start gap-3 text-sm">
                                            <div className={`w-3 h-3 rounded-full border-2 border-white absolute -left-4 ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'}`} style={{ top: '4px' }} />
                                            <div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[h.status]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[h.status]?.color || 'text-slate-600'}`}>
                                                    {t(STATUS_T_KEYS[h.status]) || h.status}
                                                </span>
                                                {h.remark && <p className="text-slate-500 mt-1 text-xs">{h.remark}</p>}
                                                <p className="text-xs text-slate-400 mt-0.5">{new Date(h.timestamp).toLocaleString(locale)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );

    // Logged-in users get the full dashboard layout; public users get a minimal wrapper
    if (user) {
        return <DashboardLayout>{inner}</DashboardLayout>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                        <TrainFront size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900">{t('common.civicEye')}</span>
                </Link>
                <div className="flex items-center gap-3">
                    <LanguageSwitcher variant="light" />
                    <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">{t('common.signIn')}</Link>
                    <Link to="/register" className="text-sm px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium">{t('common.register')}</Link>
                </div>
            </nav>
            <div className="p-8">{inner}</div>
        </div>
    );
}

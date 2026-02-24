import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Search, ArrowRight, SlidersHorizontal, X } from 'lucide-react';

const ALL_STATUSES = ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'];

const STATUS_STYLES = {
    'Under Review': { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    'Investigating': { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'Action Taken': { pill: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Resolved': { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    'Rejected': { pill: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] || { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
}

function DegreeBadge({ degree }) {
    const map = {
        'Serious': 'text-rose-600 font-bold',
        'Moderate': 'text-amber-600 font-semibold',
        'Minor': 'text-emerald-600 font-medium',
    };
    return <span className={`text-xs ${map[degree] || 'text-slate-500'}`}>{degree || '—'}</span>;
}

export default function ComplaintList() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState('');

    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (activeStatus) params.set('status', activeStatus);
            if (search.trim()) params.set('search', search.trim());
            const { data } = await api.get(`/authority/complaints?${params}`);
            setComplaints(data.complaints);
            setTotal(data.total);
        } catch { }
        finally { setLoading(false); }
    }, [page, activeStatus, search]);

    useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

    const totalPages = Math.ceil(total / 20);

    const clearFilters = () => {
        setSearch('');
        setActiveStatus('');
        setPage(1);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">All Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">{total} report{total !== 1 ? 's' : ''} found</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
                {/* Search */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            placeholder="Search by CIV Ticket ID…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value.toUpperCase()); setPage(1); }}
                        />
                    </div>
                    {(search || activeStatus) && (
                        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
                {/* Status pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    <button
                        onClick={() => { setActiveStatus(''); setPage(1); }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${!activeStatus ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        All
                    </button>
                    {ALL_STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setActiveStatus(s); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${activeStatus === s
                                ? STATUS_STYLES[s]?.pill || 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin mr-3" /> Loading…
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm gap-2">
                        <Search size={28} className="opacity-30" />
                        No reports match the current filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70">
                                    {['Ticket ID', 'ROUTE', 'CATEGORY', 'DEGREE', 'STATUS', 'FILED ON', ''].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-slate-400 font-semibold text-xs tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {complaints.map((c, i) => (
                                        <motion.tr
                                            key={c._id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }}
                                            className="border-b border-slate-50 hover:bg-blue-50/30 transition group"
                                        >
                                            <td className="px-5 py-4 font-mono text-blue-700 text-xs font-bold tracking-wide">
                                                {c.ticketId || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 text-xs whitespace-nowrap">
                                                {c.sourceStation && c.destinationStation
                                                    ? `${c.sourceStation} → ${c.destinationStation}`
                                                    : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700 font-medium">{c.complaintCategory || '—'}</td>
                                            <td className="px-5 py-4"><DegreeBadge degree={c.complaintDegree} /></td>
                                            <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                                            <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                                                {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    to={`/authority/complaints/${c._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    Review <ArrowRight size={12} />
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

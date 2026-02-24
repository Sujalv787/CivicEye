import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, ArrowRight, Zap, Search } from 'lucide-react';

const STATUS_STYLES = {
    'Under Review': 'bg-blue-100 text-blue-700',
    'Investigating': 'bg-amber-100 text-amber-700',
    'Action Taken': 'bg-purple-100 text-purple-700',
    'Resolved': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-red-100 text-red-700',
};

export default function CitizenDashboard() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/complaints/my')
            .then(({ data }) => setComplaints(data.complaints))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const stats = {
        total: complaints.length,
        underReview: complaints.filter(c => c.status === 'Under Review').length,
        resolved: complaints.filter(c => ['Resolved', 'Action Taken'].includes(c.status)).length,
        rejected: complaints.filter(c => c.status === 'Rejected').length,
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name} 👋</h1>
                    <p className="text-slate-500 text-sm mt-1">Here's an overview of your submitted reports.</p>
                </div>
                <Link
                    to="/submit"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <PlusCircle size={16} /> New Report
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Reports', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
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
                    <h2 className="font-semibold text-slate-900">My Reports</h2>
                    <Link to="/track" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Track by ID <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400">Loading...</div>
                ) : complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FileText size={40} className="mb-3 opacity-30" />
                        <p className="text-sm">No reports submitted yet.</p>
                        <Link to="/submit" className="mt-3 text-sm text-blue-600 hover:underline">Submit your first report →</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Tracking ID</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Route</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Category</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Status</th>
                                    <th className="text-left px-6 py-3 text-slate-500 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-mono text-blue-700 font-medium text-xs">{c.trackingId || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">
                                            {c.sourceStation && c.destinationStation
                                                ? `${c.sourceStation} → ${c.destinationStation}`
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{c.complaintCategory || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

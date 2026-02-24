import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Clock, FileVideo, Image, Music, Train, Tag, BarChart2,
    MapPin, Hash, CheckCircle, Zap, XCircle, Search
} from 'lucide-react';

const VALID_STATUSES = ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'];

const STATUS_STYLES = {
    'Under Review': { pill: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    'Investigating': { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'Action Taken': { pill: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Resolved': { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    'Rejected': { pill: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const STATUS_ICONS = {
    'Under Review': Clock,
    'Investigating': Search,
    'Action Taken': Zap,
    'Resolved': CheckCircle,
    'Rejected': XCircle,
};

function StatusBadge({ status, large = false }) {
    const s = STATUS_STYLES[status] || { pill: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
    const Icon = STATUS_ICONS[status] || Clock;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${large ? 'text-sm' : 'text-xs'} ${s.pill}`}>
            <Icon size={large ? 14 : 11} />
            {status}
        </span>
    );
}

function InfoField({ label, value, icon: Icon }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                {Icon && <Icon size={10} />} {label}
            </p>
            <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
        </div>
    );
}

export default function ComplaintDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState('');
    const [remark, setRemark] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        api.get(`/authority/complaints/${id}`)
            .then(({ data }) => {
                setComplaint(data.complaint);
                setNewStatus(data.complaint.status);
            })
            .catch(() => navigate('/authority/complaints'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await api.patch(`/authority/complaints/${id}/status`, { status: newStatus, remark });
            setComplaint((prev) => ({ ...prev, status: newStatus }));
            setRemark('');
            toast.success('Status updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
            </div>
        </DashboardLayout>
    );
    if (!complaint) return null;

    const mime = complaint.evidence?.mimetype || '';
    const isVideo = mime.startsWith('video/');
    const isAudio = mime.startsWith('audio/');
    const isImage = mime.startsWith('image/');

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition"
                >
                    <ArrowLeft size={16} /> Back to Reports
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between mb-6 flex-wrap gap-4"
                >
                    <div>
                        <p className="text-xs text-slate-400 font-semibold tracking-widest mb-1">COMPLAINT DETAIL</p>
                        <h1 className="text-2xl font-black text-slate-900">
                            <span className="font-mono text-blue-700">{complaint.trackingId || '—'}</span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Filed on {new Date(complaint.createdAt).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <StatusBadge status={complaint.status} large />
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ── Left: Evidence + Details ─────────────────── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Evidence viewer */}
                        {complaint.evidence?.url && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                            >
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                                    {isVideo ? <FileVideo size={16} className="text-blue-600" />
                                        : isAudio ? <Music size={16} className="text-blue-600" />
                                            : <Image size={16} className="text-blue-600" />}
                                    <span className="font-semibold text-slate-900 text-sm">Evidence</span>
                                    <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {isVideo ? 'Video' : isAudio ? 'Audio' : 'Image'}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50">
                                    {isVideo && (
                                        <video src={complaint.evidence.url} controls className="w-full max-h-80 rounded-xl shadow" />
                                    )}
                                    {isAudio && (
                                        <audio src={complaint.evidence.url} controls className="w-full mt-4" />
                                    )}
                                    {isImage && (
                                        <img src={complaint.evidence.url} alt="Evidence" className="w-full max-h-80 object-contain rounded-xl shadow" />
                                    )}
                                    <a
                                        href={complaint.evidence.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 hover:underline mt-3 inline-block"
                                    >
                                        Open in new tab →
                                    </a>
                                </div>
                            </motion.div>
                        )}

                        {/* Report details */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5"
                        >
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Train size={16} className="text-blue-600" /> Journey & Complaint Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <InfoField label="Tracking ID" value={complaint.trackingId} icon={Hash} />
                                <InfoField label="Filed On" value={new Date(complaint.createdAt).toLocaleString('en-IN')} icon={Clock} />
                                <InfoField label="Source Station" value={complaint.sourceStation} icon={MapPin} />
                                <InfoField label="Destination" value={complaint.destinationStation} icon={MapPin} />
                                <InfoField label="Category" value={complaint.complaintCategory} icon={Tag} />
                                <InfoField
                                    label="Degree"
                                    value={complaint.complaintDegree}
                                    icon={BarChart2}
                                />
                            </div>
                            {complaint.complaintCategoryOther && (
                                <div className="mt-3 bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 mb-1">Additional Context</p>
                                    <p className="text-sm text-slate-700">{complaint.complaintCategoryOther}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Status History */}
                        {complaint.statusHistory?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-slate-200 p-5"
                            >
                                <h3 className="font-bold text-slate-900 mb-4">Status Timeline</h3>
                                <div className="relative pl-5 space-y-5">
                                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
                                    {[...complaint.statusHistory].reverse().map((h, i) => {
                                        const S = STATUS_STYLES[h.status];
                                        return (
                                            <div key={i} className="relative flex items-start gap-3 text-sm">
                                                <div className={`w-3 h-3 rounded-full border-2 border-white absolute -left-4 ${S?.dot || 'bg-slate-400'}`} style={{ top: '4px' }} />
                                                <div>
                                                    <StatusBadge status={h.status} />
                                                    {h.remark && <p className="text-slate-500 mt-1 text-xs">{h.remark}</p>}
                                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ── Right: Update panel ───────────────────────── */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6"
                        >
                            <h3 className="font-bold text-slate-900 mb-5">Update Status</h3>

                            {/* Status selector — radio-style */}
                            <div className="space-y-2 mb-4">
                                {VALID_STATUSES.map((s) => {
                                    const S = STATUS_STYLES[s];
                                    const Icon = STATUS_ICONS[s] || Clock;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setNewStatus(s)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition ${newStatus === s
                                                ? `${S.pill} border-current`
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon size={14} />
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Remark */}
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Remark (optional)</label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                rows={3}
                                placeholder="Add a note for the record…"
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
                            />

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpdate}
                                disabled={updating || newStatus === complaint.status}
                                className="w-full mt-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition text-sm"
                            >
                                {updating ? 'Updating…' : 'Save Status'}
                            </motion.button>

                            {/* Previous remarks */}
                            {complaint.remarks?.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-slate-100">
                                    <h4 className="text-xs font-semibold text-slate-500 mb-3">Previous Remarks</h4>
                                    <div className="space-y-2">
                                        {complaint.remarks.map((r, i) => (
                                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-slate-700">
                                                {r.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

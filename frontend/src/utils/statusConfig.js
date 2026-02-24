import { Clock, Search, Zap, CheckCircle, XCircle, FileSearch } from 'lucide-react';

export const ALL_STATUSES = ['Under Review', 'Investigating', 'Action Taken', 'Resolved', 'Rejected'];

export const STATUS_T_KEYS = {
    'Under Review': 'status.underReview',
    'Investigating': 'status.investigating',
    'Action Taken': 'status.actionTaken',
    'Resolved': 'status.resolved',
    'Rejected': 'status.rejected',
};

export const STATUS_STYLES = {
    'Under Review': { pill: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
    'Investigating': { pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'Action Taken': { pill: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    'Resolved': { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    'Rejected': { pill: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export const STATUS_ICONS = {
    'Under Review': Clock,
    'Investigating': Search,
    'Action Taken': Zap,
    'Resolved': CheckCircle,
    'Rejected': XCircle,
};

// Extended config used by TrackComplaint (includes FileSearch icon for investigating)
export const STATUS_CONFIG = {
    'Under Review': { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-100', dot: 'bg-indigo-500' },
    'Investigating': { icon: FileSearch, color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    'Action Taken': { icon: Zap, color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500' },
    'Resolved': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
    'Rejected': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
};

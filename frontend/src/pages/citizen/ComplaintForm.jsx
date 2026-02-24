import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    User, MapPin, Calendar, Clock, Tag, BarChart2, Upload,
    Hash, ArrowRight, ArrowLeft, CheckCircle, Train, AlertTriangle, Copy, Loader2, Edit3
} from 'lucide-react';
import { useTrainLoader } from '../../context/TrainLoaderContext';
import VoiceInputButton from '../../components/VoiceInputButton';

// ── Step count ──────────────────────────────────────────────────────────────
const TOTAL_STEPS = 8;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['image/', 'video/', 'audio/'];

// Category options: value is sent to backend (English), tKey is for display
const CATEGORY_KEYS = [
    { value: 'Overcharging', tKey: 'categories.overcharging' },
    { value: 'Misbehavior', tKey: 'categories.misbehavior' },
    { value: 'Hygiene Issue', tKey: 'categories.hygieneIssue' },
    { value: 'Other', tKey: 'categories.other' },
];

// Degree options: value is sent to backend (English), tKey/descKey are for display
const DEGREE_KEYS = [
    { value: 'Minor', tKey: 'degree.minor', descKey: 'degree.minorDesc', color: 'border-emerald-500 text-emerald-400' },
    { value: 'Moderate', tKey: 'degree.moderate', descKey: 'degree.moderateDesc', color: 'border-amber-500 text-amber-400' },
    { value: 'Serious', tKey: 'degree.serious', descKey: 'degree.seriousDesc', color: 'border-rose-500 text-rose-400' },
];

// ── Loader overlay ─────────────────────────────────────────────────────────
function EvaluatingLoader() {
    const { t } = useTranslation();
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)' }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-white/10 border-t-orange-400 mb-8"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{t('complaint.evaluatingTitle')}</h2>
            <p className="text-slate-400 text-center max-w-xs">
                {t('complaint.evaluatingSubtitle')}
            </p>
            <div className="flex gap-1 mt-6">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-orange-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ── Success screen ─────────────────────────────────────────────────────────
function SuccessScreen({ ticketId }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(ticketId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1f3f 100%)' }}
        >
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle size={40} className="text-emerald-400" />
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-3">{t('complaint.successTitle')}</h2>
                <p className="text-slate-400 mb-8">{t('complaint.successSubtitle')}</p>

                {/* Ticket ID */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-slate-400 mb-2">{t('complaint.yourTicketId')}</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-3xl font-black text-orange-400 tracking-widest">
                            {ticketId}
                        </span>
                        <button onClick={copy} className="p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white">
                            <Copy size={18} />
                        </button>
                    </div>
                    {copied && <p className="text-xs text-emerald-400 mt-2">{t('common.copied')}</p>}
                </div>
                <p className="text-xs text-slate-500 mb-8">{t('complaint.saveTicketId')}</p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/track', { state: { ticketId }, replace: true })}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition"
                    >
                        {t('complaint.trackStatus')}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard', { state: { newTicketId: ticketId }, replace: true })}
                        className="flex-1 py-3 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl border border-white/15 transition"
                    >
                        {t('complaint.myDashboard')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ── Question Card wrapper ──────────────────────────────────────────────────
function QuestionCard({ children, title, subtitle }) {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-slate-400 mb-6">{subtitle}</p>}
            {children}
        </div>
    );
}

// ── Step inputs ───────────────────────────────────────────────────────────
const INPUT_CLS = 'w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition text-sm';

// ── Review field row ──────────────────────────────────────────────────────
function ReviewRow({ label, value, icon: Icon, onEdit }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
                <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm text-white font-medium truncate">{value || '—'}</p>
                </div>
            </div>
            {onEdit && (
                <button onClick={onEdit} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 shrink-0 ml-3">
                    <Edit3 size={12} />
                </button>
            )}
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ComplaintForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showLoader } = useTrainLoader();
    const fileRef = useRef();

    const [step, setStep] = useState(1);
    const [dir, setDir] = useState(1);
    const [answers, setAnswers] = useState({
        name: '',
        sourceStation: '',
        destinationStation: '',
        dateOfTravel: '',
        timeOfIncident: '',
        category: '',
        categoryOther: '',
        degree: '',
        evidenceFile: null,
        evidencePreview: null,
        evidenceMime: '',
        pnr: '',
    });

    const [pnrError, setPnrError] = useState('');
    const [pnrVerifying, setPnrVerifying] = useState(false);
    const [pnrVerified, setPnrVerified] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [ticketId, setTicketId] = useState(null);

    const setAnswer = (key, val) => setAnswers((prev) => ({ ...prev, [key]: val }));

    const goTo = (target) => {
        setDir(target > step ? 1 : -1);
        setStep(target);
    };
    const goNext = () => {
        setDir(1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };
    const goBack = () => {
        setDir(-1);
        setStep((s) => Math.max(s - 1, 1));
        setPnrError('');
    };

    // Handle Enter key to advance steps or trigger actions
    const stateRef = useRef();
    stateRef.current = { step, answers, pnrVerified, pnrVerifying, submitting };

    const canProceedFor = (s, a, pv) => {
        if (s === 1) return a.name.trim().length > 0;
        if (s === 2) return a.sourceStation.trim().length > 0 && a.destinationStation.trim().length > 0;
        if (s === 3) return a.dateOfTravel !== '' && a.timeOfIncident !== '';
        if (s === 4) return a.category !== '' && (a.category !== 'Other' || a.categoryOther.trim().length > 0);
        if (s === 5) return a.degree !== '';
        if (s === 6) return a.evidenceFile !== null;
        if (s === 7) return a.pnr.length === 10 && pv;
        if (s === 8) return pv;
        return true;
    };

    const actionsRef = useRef();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key !== 'Enter') return;
            if (e.target.tagName === 'TEXTAREA') return;

            e.preventDefault();

            const { step: s, answers: a, pnrVerified: pv, pnrVerifying: pvg, submitting: sub } = stateRef.current;
            const actions = actionsRef.current;

            // On PNR step, Enter triggers verify if not yet verified
            if (s === 7 && !pv && !pvg && a.pnr.length === 10) {
                actions.handleVerifyPNR();
                return;
            }

            // On last step, Enter submits
            if (s === TOTAL_STEPS && pv && !sub) {
                actions.handleSubmit();
                return;
            }

            // Otherwise advance to next step if valid
            if (s < TOTAL_STEPS && canProceedFor(s, a, pv)) {
                actions.goNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Steps:
    // 1 = Name
    // 2 = Route (source + destination combined)
    // 3 = Date + Time (combined)
    // 4 = Category
    // 5 = Degree
    // 6 = Upload evidence
    // 7 = PNR verification
    // 8 = Review & Submit

    const canProceed = () => {
        if (step === 1) return answers.name.trim().length > 0;
        if (step === 2) return answers.sourceStation.trim().length > 0 && answers.destinationStation.trim().length > 0;
        if (step === 3) return answers.dateOfTravel !== '' && answers.timeOfIncident !== '';
        if (step === 4) return answers.category !== '' && (answers.category !== 'Other' || answers.categoryOther.trim().length > 0);
        if (step === 5) return answers.degree !== '';
        if (step === 6) return answers.evidenceFile !== null;
        if (step === 7) return answers.pnr.length === 10 && pnrVerified;
        if (step === 8) return pnrVerified; // Review step — just needs PNR verified
        return true;
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        // Validate file size
        if (f.size > MAX_FILE_SIZE) {
            toast.error(t('complaint.maxFileSize'));
            return;
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.some((type) => f.type.startsWith(type))) {
            toast.error(t('complaint.invalidFileType'));
            return;
        }

        setAnswer('evidenceFile', f);
        setAnswer('evidenceMime', f.type);
        setAnswer('evidencePreview', URL.createObjectURL(f));
    };

    const handleVerifyPNR = async (retryCount = 0) => {
        if (!/^\d{10}$/.test(answers.pnr)) {
            setPnrError(t('complaint.pnrDigitsError'));
            return;
        }

        setPnrVerifying(true);
        setPnrError('');
        setPnrVerified(false);

        try {
            const { data } = await api.post('/pnr/verify', { pnr: answers.pnr });
            if (data.verified) {
                setPnrVerified(true);
                toast.success(t('complaint.pnrSuccess'));
            } else {
                setPnrError(data.message || t('complaint.pnrFailed'));
            }
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message;

            // Network error or server down — auto-retry once
            if (!err.response && retryCount < 1) {
                await new Promise((r) => setTimeout(r, 1000));
                return handleVerifyPNR(retryCount + 1);
            }

            if (status === 429) {
                setPnrError(message || t('complaint.tooManyRequests'));
            } else if (status === 401) {
                setPnrError(t('complaint.sessionExpired'));
            } else if (status === 404) {
                setPnrError(message || t('complaint.pnrNotFound'));
            } else if (!err.response) {
                setPnrError(t('complaint.networkError'));
            } else {
                setPnrError(message || t('complaint.pnrFailed'));
            }
        } finally {
            setPnrVerifying(false);
        }
    };

    const handleSubmit = async () => {
        if (!pnrVerified) {
            setPnrError(t('complaint.pnrVerifyFirst'));
            return;
        }

        setEvaluating(true);
        await new Promise((r) => setTimeout(r, 2200));
        setEvaluating(false);
        setSubmitting(true);

        try {
            const fd = new FormData();
            fd.append('reporterName', answers.name.trim());
            fd.append('sourceStation', answers.sourceStation.trim());
            fd.append('destinationStation', answers.destinationStation.trim());
            fd.append('dateOfTravel', answers.dateOfTravel);
            fd.append('timeOfIncident', answers.timeOfIncident);
            fd.append('complaintCategory', answers.category);
            fd.append('complaintCategoryOther', answers.categoryOther.trim());
            fd.append('complaintDegree', answers.degree);
            fd.append('pnrVerified', 'true');
            if (answers.evidenceFile) {
                fd.append('evidence', answers.evidenceFile);
            }

            const { data } = await api.post('/complaints', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                showLoader(() => {
                    setTicketId(data.ticketId);
                    toast.success(t('complaint.reportSubmittedToast'));
                }, t('complaint.evaluatingLoader'));
            } else {
                toast.error(data.message || t('complaint.submissionFailed'));
            }
        } catch (err) {
            console.error('Submission error:', err);
            const status = err.response?.status;
            const message = err.response?.data?.message;

            if (status === 429) {
                toast.error(message || t('complaint.tooManyRequests'));
            } else if (status === 401) {
                toast.error(t('complaint.sessionExpired'));
            } else if (status === 413) {
                toast.error(t('complaint.maxFileSize'));
            } else if (!err.response) {
                toast.error(t('complaint.networkError'));
            } else {
                toast.error(message || t('complaint.submissionFailedRetry'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    actionsRef.current = { handleVerifyPNR, handleSubmit, goNext };

    if (ticketId) return <SuccessScreen ticketId={ticketId} />;

    const progress = (step / TOTAL_STEPS) * 100;

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
        exit: (direction) => ({ x: direction > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }),
    };

    const categoryLabel = CATEGORY_KEYS.find((c) => c.value === answers.category);
    const degreeLabel = DEGREE_KEYS.find((d) => d.value === answers.degree);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1f3f 100%)' }}>
            <AnimatePresence>{evaluating && <EvaluatingLoader />}</AnimatePresence>

            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/8 px-6 py-4">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Train size={18} className="text-orange-400" />
                            {t('complaint.fileReport')}
                        </div>
                        <span className="text-sm text-slate-400">{t('complaint.stepOf', { step, total: TOTAL_STEPS })}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                    {/* Step indicators */}
                    <div className="flex justify-between mt-2">
                        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i + 1 <= step ? 'bg-orange-400' : 'bg-white/15'} ${i + 1 === step ? 'scale-125' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Question area */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">
                    <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                            key={step}
                            custom={dir}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {/* STEP 1: Name */}
                            {step === 1 && (
                                <QuestionCard title={t('complaint.nameTitle')} subtitle={t('complaint.nameSubtitle')}>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                            <input
                                                className={`${INPUT_CLS} pl-9`}
                                                placeholder={t('complaint.namePlaceholder')}
                                                value={answers.name}
                                                onChange={(e) => setAnswer('name', e.target.value)}
                                                maxLength={100}
                                                autoFocus
                                            />
                                        </div>
                                        <VoiceInputButton
                                            onResult={(text) => setAnswer('name', (answers.name ? answers.name + ' ' : '') + text)}
                                        />
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 2: Route (Source + Destination combined) */}
                            {step === 2 && (
                                <QuestionCard title={t('complaint.routeTitle')} subtitle={t('complaint.routeSubtitle')}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">{t('complaint.sourceLabel')}</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                                    <input
                                                        className={`${INPUT_CLS} pl-9`}
                                                        placeholder={t('complaint.sourcePlaceholder')}
                                                        value={answers.sourceStation}
                                                        onChange={(e) => setAnswer('sourceStation', e.target.value)}
                                                        maxLength={100}
                                                        autoFocus
                                                    />
                                                </div>
                                                <VoiceInputButton
                                                    onResult={(text) => setAnswer('sourceStation', (answers.sourceStation ? answers.sourceStation + ' ' : '') + text)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
                                                <ArrowRight size={14} className="text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">{t('complaint.destLabel')}</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                                    <input
                                                        className={`${INPUT_CLS} pl-9`}
                                                        placeholder={t('complaint.destPlaceholder')}
                                                        value={answers.destinationStation}
                                                        onChange={(e) => setAnswer('destinationStation', e.target.value)}
                                                        maxLength={100}
                                                    />
                                                </div>
                                                <VoiceInputButton
                                                    onResult={(text) => setAnswer('destinationStation', (answers.destinationStation ? answers.destinationStation + ' ' : '') + text)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 3: Date + Time (combined) */}
                            {step === 3 && (
                                <QuestionCard title={t('complaint.dateTimeTitle')} subtitle={t('complaint.dateTimeSubtitle')}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">{t('complaint.dateLabel')}</label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                                <input
                                                    type="date"
                                                    className={`${INPUT_CLS} pl-9`}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    value={answers.dateOfTravel}
                                                    onChange={(e) => setAnswer('dateOfTravel', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">{t('complaint.timeLabel')}</label>
                                            <div className="relative">
                                                <Clock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                                <input
                                                    type="time"
                                                    className={`${INPUT_CLS} pl-9`}
                                                    value={answers.timeOfIncident}
                                                    onChange={(e) => setAnswer('timeOfIncident', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 4: Category */}
                            {step === 4 && (
                                <QuestionCard title={t('complaint.categoryTitle')} subtitle={t('complaint.categorySubtitle')}>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {CATEGORY_KEYS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setAnswer('category', opt.value)}
                                                className={`p-4 rounded-xl border-2 text-left transition font-medium text-sm ${answers.category === opt.value
                                                    ? 'border-orange-500 bg-orange-500/15 text-white'
                                                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'
                                                    }`}
                                            >
                                                <Tag size={14} className="mb-1.5 opacity-70" />
                                                {t(opt.tKey)}
                                            </button>
                                        ))}
                                    </div>
                                    {answers.category === 'Other' && (
                                        <div className="flex items-start gap-2">
                                            <textarea
                                                className={`${INPUT_CLS} resize-none flex-1`}
                                                rows={3}
                                                placeholder={t('complaint.categoryOtherPlaceholder')}
                                                value={answers.categoryOther}
                                                onChange={(e) => setAnswer('categoryOther', e.target.value)}
                                                maxLength={500}
                                            />
                                            <VoiceInputButton
                                                onResult={(text) => setAnswer('categoryOther', (answers.categoryOther ? answers.categoryOther + ' ' : '') + text)}
                                                className="mt-1"
                                            />
                                        </div>
                                    )}
                                </QuestionCard>
                            )}

                            {/* STEP 5: Degree */}
                            {step === 5 && (
                                <QuestionCard title={t('complaint.degreeTitle')} subtitle={t('complaint.degreeSubtitle')}>
                                    <div className="flex flex-col gap-3">
                                        {DEGREE_KEYS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setAnswer('degree', opt.value)}
                                                className={`p-4 rounded-xl border-2 text-left transition ${answers.degree === opt.value
                                                    ? `${opt.color} bg-white/8`
                                                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="font-bold text-sm mb-0.5">{t(opt.tKey)}</div>
                                                <div className="text-xs opacity-70">{t(opt.descKey)}</div>
                                            </button>
                                        ))}
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 6: Upload evidence */}
                            {step === 6 && (
                                <QuestionCard title={t('complaint.uploadTitle')} subtitle={t('complaint.uploadSubtitle')}>
                                    <div
                                        onClick={() => fileRef.current.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${answers.evidenceFile
                                            ? 'border-emerald-500/60 bg-emerald-500/8'
                                            : 'border-white/20 hover:border-orange-500/60 hover:bg-orange-500/5'
                                            }`}
                                    >
                                        {answers.evidencePreview ? (
                                            answers.evidenceMime.startsWith('video/') ? (
                                                <video src={answers.evidencePreview} controls className="max-h-40 mx-auto rounded-lg" />
                                            ) : answers.evidenceMime.startsWith('audio/') ? (
                                                <audio src={answers.evidencePreview} controls className="mx-auto" />
                                            ) : (
                                                <img src={answers.evidencePreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                                            )
                                        ) : (
                                            <>
                                                <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                                                <p className="text-slate-300 font-medium">{t('complaint.clickToUpload')}</p>
                                                <p className="text-xs text-slate-500 mt-1">{t('complaint.uploadFormats')}</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,video/*,audio/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {answers.evidenceFile && (
                                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                                            <CheckCircle size={12} /> {answers.evidenceFile.name}
                                        </p>
                                    )}
                                </QuestionCard>
                            )}

                            {/* STEP 7: PNR verification */}
                            {step === 7 && (
                                <QuestionCard
                                    title={t('complaint.pnrTitle')}
                                    subtitle={t('complaint.pnrSubtitle')}
                                >
                                    <div className="relative mb-3">
                                        <Hash size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            className={`${INPUT_CLS} pl-9 font-mono tracking-widest text-lg`}
                                            placeholder={t('complaint.pnrPlaceholder')}
                                            maxLength={10}
                                            value={answers.pnr}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setAnswer('pnr', v);
                                                setPnrError('');
                                                setPnrVerified(false);
                                            }}
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleVerifyPNR}
                                        disabled={answers.pnr.length !== 10 || pnrVerifying || pnrVerified}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${pnrVerified
                                            ? 'bg-emerald-600 text-white cursor-default'
                                            : 'bg-orange-600 hover:bg-orange-500 disabled:bg-white/10 disabled:text-slate-500 text-white'
                                            }`}
                                    >
                                        {pnrVerifying ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                {t('complaint.verifying')}
                                            </>
                                        ) : pnrVerified ? (
                                            <>
                                                <CheckCircle size={16} />
                                                {t('complaint.pnrVerified')}
                                            </>
                                        ) : (
                                            t('complaint.verifyPnr')
                                        )}
                                    </motion.button>

                                    {pnrError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-sm text-rose-400 mt-3"
                                        >
                                            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                                            <span>{pnrError}</span>
                                        </motion.div>
                                    )}

                                    {pnrVerified && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-400 mt-3"
                                        >
                                            <CheckCircle size={15} className="mt-0.5 shrink-0" />
                                            <span>{t('complaint.pnrVerifiedNotStored')}</span>
                                        </motion.div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                                        <CheckCircle size={11} /> {t('complaint.pnrNeverStored')}
                                    </p>
                                </QuestionCard>
                            )}

                            {/* STEP 8: Review & Submit */}
                            {step === 8 && (
                                <QuestionCard title={t('complaint.reviewTitle')} subtitle={t('complaint.reviewSubtitle')}>
                                    <div className="divide-y divide-white/8">
                                        <ReviewRow
                                            label={t('complaint.reviewName')}
                                            value={answers.name}
                                            icon={User}
                                            onEdit={() => goTo(1)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewRoute')}
                                            value={`${answers.sourceStation} → ${answers.destinationStation}`}
                                            icon={MapPin}
                                            onEdit={() => goTo(2)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewDate')}
                                            value={answers.dateOfTravel}
                                            icon={Calendar}
                                            onEdit={() => goTo(3)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewTime')}
                                            value={answers.timeOfIncident}
                                            icon={Clock}
                                            onEdit={() => goTo(3)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewCategory')}
                                            value={categoryLabel ? t(categoryLabel.tKey) : answers.category}
                                            icon={Tag}
                                            onEdit={() => goTo(4)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewDegree')}
                                            value={degreeLabel ? t(degreeLabel.tKey) : answers.degree}
                                            icon={BarChart2}
                                            onEdit={() => goTo(5)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewEvidence')}
                                            value={answers.evidenceFile ? `${answers.evidenceFile.name}` : '—'}
                                            icon={Upload}
                                            onEdit={() => goTo(6)}
                                        />
                                        <ReviewRow
                                            label={t('complaint.reviewPnr')}
                                            value={pnrVerified ? t('complaint.reviewPnrVerified') : '—'}
                                            icon={Hash}
                                        />
                                    </div>
                                </QuestionCard>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6 max-w-xl mx-auto">
                        <button
                            onClick={goBack}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 disabled:opacity-0 disabled:pointer-events-none transition"
                        >
                            <ArrowLeft size={16} /> {t('common.back')}
                        </button>

                        {step < TOTAL_STEPS ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={goNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-7 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
                            >
                                {t('common.next')} <ArrowRight size={16} />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={!canProceed() || submitting}
                                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {t('complaint.submitting')}
                                    </>
                                ) : (
                                    <>
                                        {t('complaint.submitReport')} <CheckCircle size={16} />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

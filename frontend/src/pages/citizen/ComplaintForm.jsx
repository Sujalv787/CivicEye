import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    User, MapPin, Calendar, Clock, Tag, BarChart2, Upload,
    Hash, ArrowRight, ArrowLeft, CheckCircle, Train, AlertTriangle, Copy, Loader2
} from 'lucide-react';
import { useTrainLoader } from '../../context/TrainLoaderContext';

// ── Q&A Step definitions ───────────────────────────────────────────────────
const TOTAL_STEPS = 9;

// ── Loader overlay ─────────────────────────────────────────────────────────
function EvaluatingLoader() {
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
                className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-400 mb-8"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Evaluating Your Report</h2>
            <p className="text-slate-400 text-center max-w-xs">
                Your report is being evaluated…
            </p>
            <div className="flex gap-1 mt-6">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-400"
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
                <h2 className="text-3xl font-black text-white mb-3">Your report has been submitted successfully.</h2>
                <p className="text-slate-400 mb-8">Your grievance is now under review by the relevant authority.</p>

                {/* Ticket ID */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <p className="text-sm text-slate-400 mb-2">Your Ticket ID</p>
                    <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-3xl font-black text-blue-400 tracking-widest">
                            {ticketId}
                        </span>
                        <button onClick={copy} className="p-2 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white">
                            <Copy size={18} />
                        </button>
                    </div>
                    {copied && <p className="text-xs text-emerald-400 mt-2">Copied!</p>}
                </div>
                <p className="text-xs text-slate-500 mb-8">Save this ID to track your complaint status anytime.</p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/track')}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
                    >
                        Track Status
                    </button>
                    <button
                        onClick={() => navigate('/dashboard', { state: { newTicketId: ticketId } })}
                        className="flex-1 py-3 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl border border-white/15 transition"
                    >
                        My Dashboard
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
const INPUT_CLS = 'w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm';

const CATEGORY_OPTIONS = ['Overcharging', 'Misbehavior', 'Hygiene Issue', 'Other'];
const DEGREE_OPTIONS = [
    { value: 'Minor', desc: 'Minor inconvenience, no harm caused', color: 'border-emerald-500 text-emerald-400' },
    { value: 'Moderate', desc: 'Noticeable issue that affected your journey', color: 'border-amber-500 text-amber-400' },
    { value: 'Serious', desc: 'Severe — safety risk or major misconduct', color: 'border-rose-500 text-rose-400' },
];

// ── Main component ──────────────────────────────────────────────────────────
export default function ComplaintForm() {
    const navigate = useNavigate();
    const { showLoader } = useTrainLoader();
    const fileRef = useRef();

    const [step, setStep] = useState(1);
    const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
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

    const goNext = () => {
        setDir(1);
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    };
    const goBack = () => {
        setDir(-1);
        setStep((s) => Math.max(s - 1, 1));
        setPnrError('');
    };

    // Can current step proceed?
    const canProceed = () => {
        if (step === 1) return answers.name.trim().length > 0;
        if (step === 2) return answers.sourceStation.trim().length > 0;
        if (step === 3) return answers.destinationStation.trim().length > 0;
        if (step === 4) return answers.dateOfTravel !== '';
        if (step === 5) return answers.timeOfIncident !== '';
        if (step === 6) return answers.category !== '' && (answers.category !== 'Other' || answers.categoryOther.trim().length > 0);
        if (step === 7) return answers.degree !== '';
        if (step === 8) return answers.evidenceFile !== null;
        if (step === 9) return answers.pnr.length === 10 && pnrVerified;
        return true;
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setAnswer('evidenceFile', f);
        setAnswer('evidenceMime', f.type);
        setAnswer('evidencePreview', URL.createObjectURL(f));
    };

    // Verify PNR against backend
    const handleVerifyPNR = async () => {
        if (!/^\d{10}$/.test(answers.pnr)) {
            setPnrError('PNR must be exactly 10 digits.');
            return;
        }

        setPnrVerifying(true);
        setPnrError('');
        setPnrVerified(false);

        try {
            const { data } = await api.post('/pnr/verify', { pnr: answers.pnr });
            if (data.verified) {
                setPnrVerified(true);
                toast.success('PNR verified successfully!');
            } else {
                setPnrError(data.message || 'PNR verification failed.');
            }
        } catch (err) {
            setPnrError(err.response?.data?.message || 'PNR not found in the system. Please check and try again.');
        } finally {
            setPnrVerifying(false);
        }
    };

    // Final submission after PNR validated
    const handleSubmit = async () => {
        if (!pnrVerified) {
            setPnrError('Please verify your PNR first.');
            return;
        }

        setEvaluating(true);
        await new Promise((r) => setTimeout(r, 2200)); // Show evaluating loader
        setEvaluating(false);
        setSubmitting(true);

        try {
            const fd = new FormData();
            fd.append('reporterName', answers.name);
            fd.append('sourceStation', answers.sourceStation);
            fd.append('destinationStation', answers.destinationStation);
            fd.append('dateOfTravel', answers.dateOfTravel);
            fd.append('timeOfIncident', answers.timeOfIncident);
            fd.append('complaintCategory', answers.category);
            fd.append('complaintCategoryOther', answers.categoryOther);
            fd.append('complaintDegree', answers.degree);
            fd.append('pnrVerified', 'true'); // PNR validated via API; never send the actual PNR
            if (answers.evidenceFile) {
                fd.append('evidence', answers.evidenceFile);
            }

            const { data } = await api.post('/complaints', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.success) {
                showLoader(() => {
                    setTicketId(data.ticketId);
                    toast.success('Report submitted!');
                });
            } else {
                toast.error(data.message || 'Submission failed.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            const message = err.response?.data?.message || 'Submission failed. Please try again.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render success ──────────────────────────────────────────────────────
    if (ticketId) return <SuccessScreen ticketId={ticketId} />;

    // ── Render evaluating overlay ───────────────────────────────────────────
    const progress = (step / TOTAL_STEPS) * 100;

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
        exit: (direction) => ({ x: direction > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }),
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1f3f 100%)' }}>
            <AnimatePresence>{evaluating && <EvaluatingLoader />}</AnimatePresence>

            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/8 px-6 py-4">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Train size={18} className="text-blue-400" />
                            File a Report
                        </div>
                        <span className="text-sm text-slate-400">Step {step} of {TOTAL_STEPS}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
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
                                <QuestionCard title="What is your name?" subtitle="This helps identify your report.">
                                    <input
                                        className={INPUT_CLS}
                                        placeholder="Enter your full name"
                                        value={answers.name}
                                        onChange={(e) => setAnswer('name', e.target.value)}
                                        autoFocus
                                    />
                                </QuestionCard>
                            )}

                            {/* STEP 2: Source station */}
                            {step === 2 && (
                                <QuestionCard title="Where did your journey begin?" subtitle="Enter your train's source station.">
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            className={`${INPUT_CLS} pl-9`}
                                            placeholder="e.g. New Delhi"
                                            value={answers.sourceStation}
                                            onChange={(e) => setAnswer('sourceStation', e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 3: Destination station */}
                            {step === 3 && (
                                <QuestionCard title="Where was your destination?" subtitle="Enter your train's destination station.">
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            className={`${INPUT_CLS} pl-9`}
                                            placeholder="e.g. Mumbai Central"
                                            value={answers.destinationStation}
                                            onChange={(e) => setAnswer('destinationStation', e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 4: Date of travel */}
                            {step === 4 && (
                                <QuestionCard title="Date of travel" subtitle="When did you travel?">
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
                                </QuestionCard>
                            )}

                            {/* STEP 5: Time of incident */}
                            {step === 5 && (
                                <QuestionCard title="Time of incident" subtitle="Approximately when did this occur?">
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="time"
                                            className={`${INPUT_CLS} pl-9`}
                                            value={answers.timeOfIncident}
                                            onChange={(e) => setAnswer('timeOfIncident', e.target.value)}
                                        />
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 6: Category */}
                            {step === 6 && (
                                <QuestionCard title="What type of complaint?" subtitle="Select the category that best describes the incident.">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {CATEGORY_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setAnswer('category', opt)}
                                                className={`p-4 rounded-xl border-2 text-left transition font-medium text-sm ${answers.category === opt
                                                    ? 'border-blue-500 bg-blue-500/15 text-white'
                                                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'
                                                    }`}
                                            >
                                                <Tag size={14} className="mb-1.5 opacity-70" />
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    {answers.category === 'Other' && (
                                        <textarea
                                            className={`${INPUT_CLS} resize-none`}
                                            rows={3}
                                            placeholder="Describe the issue…"
                                            value={answers.categoryOther}
                                            onChange={(e) => setAnswer('categoryOther', e.target.value)}
                                        />
                                    )}
                                </QuestionCard>
                            )}

                            {/* STEP 7: Degree */}
                            {step === 7 && (
                                <QuestionCard title="How serious was this?" subtitle="Rate the severity of the complaint.">
                                    <div className="flex flex-col gap-3">
                                        {DEGREE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setAnswer('degree', opt.value)}
                                                className={`p-4 rounded-xl border-2 text-left transition ${answers.degree === opt.value
                                                    ? `${opt.color} bg-white/8`
                                                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="font-bold text-sm mb-0.5">{opt.value}</div>
                                                <div className="text-xs opacity-70">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </QuestionCard>
                            )}

                            {/* STEP 8: Upload evidence */}
                            {step === 8 && (
                                <QuestionCard title="Upload evidence" subtitle="Photo, video, or audio of the incident.">
                                    <div
                                        onClick={() => fileRef.current.click()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${answers.evidenceFile
                                            ? 'border-emerald-500/60 bg-emerald-500/8'
                                            : 'border-white/20 hover:border-blue-500/60 hover:bg-blue-500/5'
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
                                                <p className="text-slate-300 font-medium">Click to upload</p>
                                                <p className="text-xs text-slate-500 mt-1">JPG, PNG, MP4, MOV, MP3 — Max 50MB</p>
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

                            {/* STEP 9: PNR verification via API */}
                            {step === 9 && (
                                <QuestionCard
                                    title="Enter your 10-digit PNR"
                                    subtitle="Your PNR is verified against our database. It is never stored in the complaint."
                                >
                                    <div className="relative mb-3">
                                        <Hash size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            className={`${INPUT_CLS} pl-9 font-mono tracking-widest text-lg`}
                                            placeholder="0000000000"
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

                                    {/* Verify button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleVerifyPNR}
                                        disabled={answers.pnr.length !== 10 || pnrVerifying || pnrVerified}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${pnrVerified
                                            ? 'bg-emerald-600 text-white cursor-default'
                                            : 'bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-white'
                                            }`}
                                    >
                                        {pnrVerifying ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Verifying…
                                            </>
                                        ) : pnrVerified ? (
                                            <>
                                                <CheckCircle size={16} />
                                                PNR Verified
                                            </>
                                        ) : (
                                            'Verify PNR'
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
                                            <span>PNR verified successfully. Your PNR will not be stored.</span>
                                        </motion.div>
                                    )}

                                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                                        <CheckCircle size={11} /> PNR is verified via our secure database and never stored.
                                    </p>
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
                            <ArrowLeft size={16} /> Back
                        </button>

                        {step < TOTAL_STEPS ? (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={goNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
                            >
                                Next <ArrowRight size={16} />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmit}
                                disabled={!canProceed() || submitting}
                                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        Submit Report <CheckCircle size={16} />
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

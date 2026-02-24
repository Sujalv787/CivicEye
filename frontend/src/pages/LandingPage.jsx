import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
    TrainFront, Shield, Camera, MapPin, FileSearch, Hash, Users, ArrowRight, Train, Star, CheckCircle, Ticket
} from 'lucide-react';
import { useTrainLoader } from '../context/TrainLoaderContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Step item with scroll trigger ───────────────────────────────────────────
function TimelineStep({ step, index }) {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const isLeft = index % 2 === 0;
    const Icon = step.icon;

    return (
        <div ref={ref} className={`relative flex items-center gap-6 ${isLeft ? 'flex-row' : 'flex-row-reverse'} md:gap-12`}>
            {/* Content card */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className={`flex-1 ${isLeft ? 'text-right md:pr-8' : 'text-left md:pl-8'}`}
            >
                <div
                    className={`inline-flex flex-col ${isLeft ? 'items-end' : 'items-start'} bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all hover:bg-white/8 group`}
                    style={{ boxShadow: isInView ? `0 0 32px ${step.glow}22` : 'none' }}
                >
                    <span className="text-xs font-bold tracking-widest text-white/40 mb-1">{t('landing.step', { num: index + 1 })}</span>
                    <h3 className="text-lg font-bold text-white mb-1.5">{t(step.titleKey)}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{t(step.descKey)}</p>
                </div>
            </motion.div>

            {/* Center node */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.05, type: 'spring', stiffness: 200 }}
                className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                style={{ boxShadow: `0 0 24px ${step.glow}55` }}
            >
                <Icon size={24} className="text-white" />
                {/* Pulse ring */}
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ border: `2px solid ${step.glow}` }}
                    animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
            </motion.div>

            {/* Empty flex spacer for the other side */}
            <div className="flex-1" />
        </div>
    );
}

// ── Timeline steps ──────────────────────────────────────────────────────────
const STEPS = [
    {
        icon: Users,
        titleKey: 'landing.step1Title',
        descKey: 'landing.step1Desc',
        color: 'from-orange-500 to-orange-600',
        glow: '#ea580c',
    },
    {
        icon: Camera,
        titleKey: 'landing.step2Title',
        descKey: 'landing.step2Desc',
        color: 'from-violet-500 to-violet-600',
        glow: '#8b5cf6',
    },
    {
        icon: Hash,
        titleKey: 'landing.step3Title',
        descKey: 'landing.step3Desc',
        color: 'from-rose-500 to-rose-600',
        glow: '#f43f5e',
    },
    {
        icon: Shield,
        titleKey: 'landing.step4Title',
        descKey: 'landing.step4Desc',
        color: 'from-amber-500 to-amber-600',
        glow: '#f59e0b',
    },
    {
        icon: FileSearch,
        titleKey: 'landing.step5Title',
        descKey: 'landing.step5Desc',
        color: 'from-emerald-500 to-emerald-600',
        glow: '#10b981',
    },
];

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ value, label }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showLoader } = useTrainLoader();
    const { token } = useAuth();

    const handleGetStarted = () => {
        showLoader(() => {
            if (!token) {
                navigate('/login');
            } else {
                navigate('/dashboard');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">

            {/* ── Navbar ─────────────────────────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
                            <TrainFront size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-xl tracking-tight">{t('common.civicEye')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="dark" />
                        <Link to="/track" className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5">
                            {t('common.trackReport')}
                        </Link>
                        {token ? (
                            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5">
                                {t('common.dashboard')}
                            </Link>
                        ) : (
                            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5">
                                {t('common.signIn')}
                            </Link>
                        )}
                        <button
                            onClick={handleGetStarted}
                            className="text-sm font-semibold px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition shadow-lg shadow-orange-900/40"
                        >
                            {t('common.getStarted')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section className="relative pt-36 pb-28 px-6 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-600/15 blur-3xl rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/15 border border-orange-500/30 rounded-full text-sm text-orange-300 mb-8">
                            <Shield size={14} />
                            {t('landing.independentPlatform')}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
                            {t('landing.heroTitle1')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                                {t('landing.heroTitle2')}
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('landing.heroDesc')}
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <motion.button
                                onClick={handleGetStarted}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-2xl transition shadow-xl shadow-orange-900/50 text-lg"
                            >
                                <Train size={20} /> {t('common.getStarted')} <ArrowRight size={18} />
                            </motion.button>
                            <Link
                                to="/track"
                                className="flex items-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-2xl transition border border-white/15 text-lg"
                            >
                                {t('landing.trackComplaint')}
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
                    >
                        <StatCard value={t('landing.privacyValue')} label={t('landing.privacyLabel')} />
                        <StatCard value={t('landing.pnrValue')} label={t('landing.pnrLabel')} />
                        <StatCard value={t('landing.liveValue')} label={t('landing.liveLabel')} />
                    </motion.div>
                </div>
            </section>

            {/* ── Disclaimer banner ─────────────────────────────────────── */}
            <div className="bg-amber-500/10 border-y border-amber-400/20 py-3 px-6 text-center text-sm text-amber-300">
                <span dangerouslySetInnerHTML={{ __html: t('landing.disclaimer') }} />
            </div>

            {/* ── Vertical Timeline ─────────────────────────────────────── */}
            <section className="py-28 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">{t('landing.processLabel')}</span>
                        <h2 className="text-4xl font-black text-white mt-3 mb-4">{t('landing.howItWorks')}</h2>
                        <p className="text-slate-400">{t('landing.howItWorksSubtitle')}</p>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Connecting line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-orange-500/0 via-orange-500/40 to-orange-500/0" />
                        {/* Animated shimmer on line */}
                        <motion.div
                            className="absolute left-1/2 top-0 w-px h-32 -translate-x-1/2 bg-gradient-to-b from-transparent via-orange-400 to-transparent"
                            animate={{ top: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />

                        <div className="flex flex-col gap-12">
                            {STEPS.map((step, i) => (
                                <TimelineStep key={i} step={step} index={i} />
                            ))}
                        </div>
                    </div>

                    {/* CTA at bottom of timeline */}
                    <motion.div
                        className="mt-20 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.button
                            onClick={handleGetStarted}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-orange-900/50 hover:shadow-orange-900/70 transition"
                        >
                            <Train size={22} /> {t('common.getStarted')} <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section className="py-20 px-6 bg-white/2">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-black text-white mb-3">{t('landing.featuresTitle')}</h2>
                        <p className="text-slate-400">{t('landing.featuresSubtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Shield, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc', color: 'text-emerald-400' },
                            { icon: Star, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc', color: 'text-amber-400' },
                            { icon: CheckCircle, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc', color: 'text-orange-400' },
                        ].map((f) => (
                            <motion.div
                                key={f.titleKey}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:border-white/20 transition-all"
                            >
                                <f.icon size={28} className={`${f.color} mb-4`} />
                                <h3 className="font-bold text-white text-lg mb-2">{t(f.titleKey)}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{t(f.descKey)}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer CTA ─────────────────────────────────────────────── */}
            <section className="py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-slate-950 pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-4xl font-black text-white mb-4">{t('landing.ctaTitle')}</h2>
                    <p className="text-slate-400 mb-8">{t('landing.ctaSubtitle')}</p>
                    <motion.button
                        onClick={handleGetStarted}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl text-lg hover:bg-orange-50 transition shadow-2xl"
                    >
                        <Train size={20} /> {t('common.getStarted')} <ArrowRight size={18} />
                    </motion.button>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <footer className="py-8 px-6 border-t border-white/8 text-center text-sm text-slate-500">
                {t('landing.footer')}
            </footer>
        </div>
    );
}

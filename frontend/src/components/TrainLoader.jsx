import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTrainLoader } from '../context/TrainLoaderContext';

// Spinning wheel component
function Wheel({ size = 16 }) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            style={{ width: size, height: size }}
            className="rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center"
        >
            {/* Spoke lines for wheel */}
            <div className="w-px h-full bg-slate-500 absolute" />
            <div className="h-px w-full bg-slate-500 absolute" />
        </motion.div>
    );
}

// Individual train car
function TrainCar({ isEngine = false }) {
    return (
        <div
            className={`relative flex-shrink-0 ${isEngine ? 'w-24 h-14' : 'w-20 h-12'}`}
            style={{ marginRight: '4px' }}
        >
            {/* Car body */}
            <div
                className={`absolute inset-0 rounded-lg ${isEngine
                    ? 'bg-gradient-to-r from-orange-700 to-orange-600'
                    : 'bg-gradient-to-r from-slate-700 to-slate-600'
                    } border-2 border-slate-500 shadow-lg`}
            />
            {/* Windows */}
            <div className="absolute top-2 left-2 right-2 flex gap-1.5">
                {isEngine ? (
                    <>
                        <div className="w-4 h-4 rounded bg-amber-300/80 border border-amber-400" />
                        <div className="w-4 h-4 rounded bg-sky-300/80 border border-sky-400" />
                        <div className="w-4 h-4 rounded bg-sky-300/80 border border-sky-400" />
                    </>
                ) : (
                    [0, 1, 2].map((i) => (
                        <div key={i} className="w-3 h-3 rounded-sm bg-sky-300/70 border border-sky-400/60" />
                    ))
                )}
            </div>
            {/* Wheels — spinning */}
            <div className="absolute -bottom-2 left-2 right-2 flex justify-between">
                <Wheel size={16} />
                <Wheel size={16} />
            </div>
            {/* Chimney (engine only) */}
            {isEngine && (
                <div className="absolute -top-3 left-3 w-3 h-3 rounded-sm bg-slate-700 border border-slate-500" />
            )}
        </div>
    );
}

// Steam puffs
function SteamPuff({ index }) {
    return (
        <motion.div
            className="absolute rounded-full bg-white/30 blur-sm"
            style={{
                width: 8 + index * 4,
                height: 8 + index * 4,
                top: -20 - index * 10,
                left: 12,
            }}
            animate={{ y: [-10, -40], opacity: [0.6, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.3, ease: 'easeOut' }}
        />
    );
}

export default function TrainLoader() {
    const { t } = useTranslation();
    const { visible, handleDone, customText } = useTrainLoader();

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(handleDone, 2000); // 2 seconds as requested
        return () => clearTimeout(timer);
    }, [visible, handleDone]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #3d1f00 50%, #1a1a2e 100%)',
                    }}
                >
                    {/* Stars background */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: Math.random() * 2 + 1,
                                height: Math.random() * 2 + 1,
                                top: `${Math.random() * 60}%`,
                                left: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.6 + 0.2,
                            }}
                            animate={{ opacity: [0.2, 0.8, 0.2] }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                        />
                    ))}

                    {/* Train scene container */}
                    <div className="relative w-full max-w-2xl px-4">
                        {/* Scene viewport (overflow hidden) */}
                        <div className="relative overflow-hidden h-32 mb-2">
                            {/* Moving train — smooth ease from left to right */}
                            <motion.div
                                className="absolute flex items-end"
                                style={{ bottom: 16 }}
                                initial={{ x: '-120%' }}
                                animate={{ x: '120%' }}
                                transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                {/* Steam puffs above engine */}
                                <div className="relative">
                                    <SteamPuff index={0} />
                                    <SteamPuff index={1} />
                                    <SteamPuff index={2} />
                                    <TrainCar isEngine />
                                </div>
                                <TrainCar />
                                <TrainCar />
                                <TrainCar />
                            </motion.div>
                        </div>

                        {/* Railway track — STATIC (no animation) */}
                        <div className="relative h-6 w-full">
                            {/* Rails */}
                            <div className="absolute top-1 left-0 right-0 h-1 bg-slate-500 rounded" />
                            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-500 rounded" />
                            {/* Sleepers — STATIC */}
                            <div className="absolute top-0 left-0 right-0 flex justify-between px-1">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-4 h-6 bg-amber-900/70 rounded-sm border border-amber-800/40"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <motion.div
                        className="mt-10 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-white text-xl font-semibold tracking-wide">
                            {customText || t('trainLoader.defaultText')}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-3">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-orange-400"
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

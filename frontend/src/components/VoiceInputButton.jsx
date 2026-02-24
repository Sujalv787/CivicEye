import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

export default function VoiceInputButton({ onResult, disabled, className = '' }) {
  const { t } = useTranslation();
  const { isListening, start, stop, supported } = useSpeechRecognition();

  const handleClick = useCallback(() => {
    if (isListening) {
      stop();
      return;
    }

    start((transcript, error) => {
      if (error === 'no-speech') {
        toast(t('complaint.voiceNoSpeech'), { icon: '🎤' });
        return;
      }
      if (error) {
        toast.error(t('complaint.voiceError'));
        return;
      }
      if (transcript) {
        onResult(transcript);
      }
    });
  }, [isListening, start, stop, onResult, t]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? t('complaint.voiceListening') : t('complaint.voiceHint')}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition
        ${isListening
          ? 'bg-red-500/20 text-red-400'
          : 'bg-white/8 text-slate-400 hover:bg-white/15 hover:text-white'
        }
        disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      <AnimatePresence>
        {isListening && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-xl border-2 border-red-400"
          />
        )}
      </AnimatePresence>
      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}

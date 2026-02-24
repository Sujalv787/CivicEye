import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocale } from '../i18n/localeMap';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function useSpeechRecognition() {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const callbackRef = useRef(null);

  const supported = !!SpeechRecognition;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const start = useCallback(
    (onResult) => {
      if (!SpeechRecognition) return;

      // Stop any existing session
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      callbackRef.current = onResult;

      const recognition = new SpeechRecognition();
      recognition.lang = getLocale(i18n.language);
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (callbackRef.current) callbackRef.current(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        // 'no-speech' and 'aborted' are non-critical — handled silently
        if (event.error === 'no-speech' && callbackRef.current) {
          callbackRef.current(null, 'no-speech');
        } else if (event.error !== 'aborted' && callbackRef.current) {
          callbackRef.current(null, event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    },
    [i18n.language],
  );

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, start, stop, supported };
}

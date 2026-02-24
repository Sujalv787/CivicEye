const LOCALE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
};

export function getLocale(lang) {
  return LOCALE_MAP[lang] || 'en-IN';
}

import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'ta', label: 'TA' },
  { code: 'bn', label: 'BN' },
  { code: 'te', label: 'TE' },
  { code: 'mr', label: 'MR' },
];

export default function LanguageSwitcher({ variant = 'dark' }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'en';

  const base = variant === 'light'
    ? 'bg-slate-100 border-slate-200'
    : 'bg-slate-800 border-slate-700';

  const activeClass = 'bg-orange-600 text-white';
  const inactiveLight = 'text-slate-500 hover:bg-slate-200';
  const inactiveDark = 'text-slate-400 hover:bg-slate-700';
  const inactive = variant === 'light' ? inactiveLight : inactiveDark;

  return (
    <div className={`inline-flex rounded-lg border ${base} p-0.5 gap-0.5`}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
            current === code ? activeClass : inactive
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

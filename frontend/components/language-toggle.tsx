"use client";

import { useLanguage } from '@/lib/language-context';
import { Language } from '@/lib/translations';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'tr' as Language, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-toggle-wrapper">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="lang-toggle-select"
        suppressHydrationWarning
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
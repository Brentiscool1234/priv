'use client';

import { LocaleCode } from '@/types';
import { LOCALES } from '@/lib/locales';

interface LocaleSelectorProps {
  value: LocaleCode;
  onChange: (value: LocaleCode) => void;
  className?: string;
  id?: string;
}

export default function LocaleSelector({ value, onChange, className = '', id }: LocaleSelectorProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as LocaleCode)}
      className={`bg-slate-800 border border-slate-600 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {Object.values(LOCALES).map((locale) => (
        <option key={locale.code} value={locale.code}>
          {locale.flag_emoji} {locale.name}
        </option>
      ))}
    </select>
  );
}

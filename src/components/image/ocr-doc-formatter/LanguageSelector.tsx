// components/LanguageSelector.tsx
"use client";

import { LANGUAGES, LanguageCode } from "@/const/languages";


interface LanguageSelectorProps {
  selectedLanguages: LanguageCode[];
  onChange: (langs: LanguageCode[]) => void;
}

export function LanguageSelector({ selectedLanguages, onChange }: LanguageSelectorProps) {
  const toggleLanguage = (code: LanguageCode) => {
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter((l) => l !== code));
    } else {
      onChange([...selectedLanguages, code]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Recognition Languages
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(LANGUAGES).map(([name, code]) => {
          const langCode = code as LanguageCode;
          return (
          <button
            key={langCode}
            onClick={() => toggleLanguage(langCode)}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              selectedLanguages.includes(langCode)
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {name}
          </button>
        )})}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Selected: {selectedLanguages.map(code => Object.entries(LANGUAGES).find(([,c]) => c === code)?.[0]).join(", ") || "None"}
      </p>
    </div>
  );
}
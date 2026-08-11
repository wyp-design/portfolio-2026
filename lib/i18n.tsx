"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LocalizedText } from "@/content/types";

export type Language = "zh" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (value: LocalizedText | string | undefined | null) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const MOJIBAKE_MARKERS = ["\u951f\u65a4\u62f7", "\ufffd", "\u95c1", "\u9225", "\u93c8", "\u7eeb"];

export function looksGarbled(value: string | undefined | null) {
  return Boolean(value && MOJIBAKE_MARKERS.some((marker) => value.includes(marker)));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    if (saved === "zh" || saved === "en") setLanguageState(saved);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("portfolio-language", next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "zh" ? "en" : "zh"),
      t: (input) => {
        if (!input) return "";
        if (typeof input === "string") return looksGarbled(input) ? "" : input;
        const preferred = input[language];
        const alternate = input[language === "zh" ? "en" : "zh"];
        if (preferred && !looksGarbled(preferred)) return preferred;
        if (alternate && !looksGarbled(alternate)) return alternate;
        return "";
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

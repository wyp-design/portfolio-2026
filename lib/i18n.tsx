"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LocalizedText } from "@/content/types";

type Language = "zh" | "en";

function looksGarbled(value: string) {
  if (!value) return false;
  const suspicious = ["�", "鈥", "鉁", "涓", "鏉", "绔", "鍥", "鐢", "椤", "杩", "锛", "銆", "€"];
  return suspicious.some((token) => value.includes(token));
}

function pickText(value: LocalizedText, language: Language) {
  const primary = value?.[language] || "";
  const secondary = value?.[language === "zh" ? "en" : "zh"] || "";
  if (primary.trim() && !looksGarbled(primary)) return primary;
  if (secondary.trim() && !looksGarbled(secondary)) return secondary;
  return primary || secondary || "";
}

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (value: LocalizedText) => string;
}>({
  language: "zh",
  setLanguage: () => undefined,
  t: (value) => value.zh,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("portfolio-language");
      if (saved === "zh" || saved === "en") setLanguage(saved);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem("portfolio-language", language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (value: LocalizedText) => pickText(value, language),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import en from "../locales/en";
import fr from "../locales/fr";

export type Language = "en" | "fr";

const STORAGE_KEY =
  "everyday-connect-language";

type Translation = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
}

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved =
    window.localStorage.getItem(
      STORAGE_KEY
    );

  return saved === "fr" ? "fr" : "en";
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>(
      getInitialLanguage
    );

  const setLanguage = (
    nextLanguage: Language
  ) => {
    setLanguageState(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        nextLanguage
      );

      document.documentElement.lang =
        nextLanguage;
    }
  };

  const t = useMemo(
    () =>
      language === "fr"
        ? fr
        : en,
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}

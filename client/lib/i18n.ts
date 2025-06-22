import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import en from "./locales/en.json";
import uk from "./locales/uk.json";
import pl from "./locales/pl.json";

export type Language = "uk" | "en" | "pl";

const resources = {
  en: {
    translation: en,
  },
  uk: {
    translation: uk,
  },
  pl: {
    translation: pl,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "uk", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const useI18n = () => {
  const { i18n: i18nInstance } = useTranslation();

  const setLanguage = (language: Language) => {
    i18nInstance.changeLanguage(language);
  };

  return {
    language: i18nInstance.language as Language,
    setLanguage,
  };
};

export default i18n;

import i18next from "i18next";
import english from "./english.json";
import arabic from "./arabic.json";
import { initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({

  compatibilityJSON: "v3",

  lng: "ar",

  fallbackLng: "en",

  resources: {

    en: {
      translation: english,
    },

    ar: {
      translation: arabic,
    },

  },

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

});

export default i18next;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from '../locales/en.json';
import id from '../locales/id.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import ar from '../locales/ar.json';
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

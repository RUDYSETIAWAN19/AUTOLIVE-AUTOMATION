import { useTranslation as useNextTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useNextTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const currentLanguage = i18n.language;

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
  ];

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    languages,
  };
};

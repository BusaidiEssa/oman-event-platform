import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  return translations[language];
};
import { create } from 'zustand';
import i18next from '../src/i18n';
import { setLanguage } from '../src/i18n/language';
import type { SupportedLocale } from '../src/i18n';

interface LanguageStore {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLanguageStore = create<LanguageStore>()((set) => {
  // Keep the Zustand locale value in sync whenever i18next.changeLanguage()
  // is called from anywhere (e.g. restoreLanguage() on startup).
  i18next.on('languageChanged', (lng: string) => {
    set({ locale: lng as SupportedLocale });
  });

  return {
    locale: (i18next.language as SupportedLocale) || 'ko',

    /**
     * Switch language, persist to AsyncStorage, and update i18next.
     * All components using useTranslation() re-render automatically.
     */
    setLocale: (locale) => {
      setLanguage(locale); // updates i18next + AsyncStorage (async, fire-and-forget)
      set({ locale }); // instant optimistic UI update
    },
  };
});


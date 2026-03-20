/**
 * i18next initialisation for Travel Assistant.
 *
 * Import this module once at app startup (app/_layout.tsx) to ensure the
 * i18next instance is configured before any component calls useTranslation().
 * Language persistence (AsyncStorage) is handled in language.ts.
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, defaultLocale } from './resources';

i18next.use(initReactI18next).init({
  resources,

  // Default / fallback language
  lng: defaultLocale,
  fallbackLng: defaultLocale,

  // Disable React Suspense — components render immediately with fallback text
  react: { useSuspense: false },

  interpolation: {
    // React already escapes output; no double-escaping needed
    escapeValue: false,
  },
});

export default i18next;
export type { SupportedLocale, AppNamespace } from './resources';

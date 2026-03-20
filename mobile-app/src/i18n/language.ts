/**
 * Language persistence helpers.
 *
 * Reads / writes the user's chosen language to AsyncStorage and syncs it with
 * the active i18next instance.  Always use these helpers instead of calling
 * i18next.changeLanguage() directly so that the AsyncStorage value stays in
 * sync.
 *
 * Usage:
 *   // Restore on app launch (call once in app/_layout.tsx)
 *   await restoreLanguage();
 *
 *   // Switch language (call from language-selector UI)
 *   await setLanguage('en');
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from './index';
import { supportedLocales, defaultLocale } from './resources';
import type { SupportedLocale } from './resources';
import { StorageKeys } from '../../lib/storage';

// Re-export so callers don't need to import from two places
export type { SupportedLocale };

// ── Internal helpers ──────────────────────────────────────────────────────────

function isSupported(lang: string): lang is SupportedLocale {
  return (supportedLocales as string[]).includes(lang);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Reads the saved locale from AsyncStorage and applies it to i18next.
 * Falls back to `defaultLocale` if nothing is saved or the value is invalid.
 * Call once during app startup, before the first render.
 */
export async function restoreLanguage(): Promise<SupportedLocale> {
  try {
    const saved = await AsyncStorage.getItem(StorageKeys.PREFERRED_LANGUAGE);
    const locale: SupportedLocale =
      saved && isSupported(saved) ? saved : defaultLocale;
    await i18next.changeLanguage(locale);
    return locale;
  } catch {
    // AsyncStorage unavailable — keep default
    return defaultLocale;
  }
}

/**
 * Switches the active language, persists the choice, and triggers a re-render
 * in all components that use useTranslation().
 */
export async function setLanguage(locale: SupportedLocale): Promise<void> {
  await i18next.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(StorageKeys.PREFERRED_LANGUAGE, locale);
  } catch {
    // Persist failure is non-fatal; UI is already in new language
  }
}

/**
 * Returns the currently active locale without triggering a re-render.
 * Prefer useTranslation().locale inside React components.
 */
export function getLanguage(): SupportedLocale {
  const lang = i18next.language;
  return isSupported(lang) ? lang : defaultLocale;
}

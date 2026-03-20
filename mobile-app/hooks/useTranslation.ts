/**
 * Drop-in replacement for the old i18n-js-based hook.
 *
 * API is intentionally identical — all existing calls like
 *   t('hotels.reviewCount', { count: 5 })
 * continue to work without any component changes.
 *
 * Internally the hook splits the scope string on its first dot:
 *   'hotels.reviewCount'  →  namespace='hotels', key='reviewCount'
 * and delegates to i18next's per-namespace lookup.
 *
 * The component re-renders automatically whenever i18next.changeLanguage()
 * is called (react-i18next subscription under the hood).
 */

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import type { SupportedLocale } from '../src/i18n';

export function useTranslation() {
  const { t: i18nT, i18n } = useI18nextTranslation();

  /**
   * Translates a fully-qualified scope such as 'common.back' or
   * 'destination.attrCat.heritage'.  The first dot segment is used as the
   * i18next namespace; the remainder is the key path within that namespace.
   *
   * @param scope  Dot-separated path: '<namespace>.<key>[.<subKey>...]'
   * @param options  Interpolation variables, e.g. { count: 5 }
   */
  const t = (scope: string, options?: Record<string, string | number>): string => {
    const dot = scope.indexOf('.');
    if (dot === -1) {
      // No namespace prefix — fall back to the default namespace
      return i18nT(scope, options) as string;
    }
    const ns = scope.slice(0, dot);
    const key = scope.slice(dot + 1);
    return i18nT(key, { ns, ...options }) as string;
  };

  return { t, locale: i18n.language as SupportedLocale };
}

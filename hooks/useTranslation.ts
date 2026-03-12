import i18n from '../lib/i18n';
import { useLanguageStore } from '../store/language.store';

/**
 * Returns a translate function `t` that re-renders when language changes.
 * Usage:  const { t } = useTranslation();
 *         t('home.greeting')
 *         t('auth.resetSent', { email: 'a@b.com' })
 */
export function useTranslation() {
  // Subscribe to locale so component re-renders on language change
  const locale = useLanguageStore((s) => s.locale);

  const t = (scope: string, options?: Record<string, string | number>) => {
    return i18n.t(scope, { locale, ...options });
  };

  return { t, locale };
}

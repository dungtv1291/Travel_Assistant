/**
 * Locale-aware, pure formatting utilities.
 *
 * These functions are intentionally side-effect-free and do NOT depend on any
 * React hooks.  The `useFormatter` hook (hooks/useFormatter.ts) binds the
 * current app locale and exposes the same surface as convenient methods.
 *
 * Supported locales:
 *   ko  – Korean  (KRW 만원 style, 천/만 counts, Korean date words)
 *   en  – English (₩ + comma, K/M counts, English date names)
 *   vi  – Vietnamese (₩ + comma, K/M counts, period-separated VND, vn dates)
 */

export type AppLocale    = 'ko' | 'en' | 'vi';
export type CurrencyCode = 'KRW' | 'VND' | 'USD';
export type DateFormat   = 'long' | 'dot' | 'short' | 'monthDay';
export type PriceFormat  = 'full' | 'short';

// ─── KRW ─────────────────────────────────────────────────────────────────────

function _krw(amount: number, locale: AppLocale, fmt: PriceFormat): string {
  if (fmt === 'short') {
    if (locale === 'ko') {
      if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1).replace(/\.0$/, '')}억`;
      if (amount >= 10_000)      return `₩${(amount / 10_000).toFixed(1).replace(/\.0$/, '')}만`;
      return `₩${amount.toLocaleString('ko-KR')}`;
    }
    // en / vi  →  ₩285K  /  ₩1.2M
    if (amount >= 1_000_000) return `₩${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (amount >= 1_000)     return `₩${Math.round(amount / 1_000)}K`;
    return `₩${amount}`;
  }

  // full
  if (locale === 'ko') {
    if (amount >= 100_000_000) {
      return `${(amount / 100_000_000).toFixed(0)}억원`;
    }
    if (amount >= 10_000) {
      const man  = Math.floor(amount / 10_000);
      const rest = amount % 10_000;
      if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`;
      return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`;
    }
    return `${amount.toLocaleString('ko-KR')}원`;
  }

  // en / vi  →  ₩150,000
  return `₩${amount.toLocaleString('en-US')}`;
}

// ─── VND ─────────────────────────────────────────────────────────────────────

function _vnd(amount: number, locale: AppLocale): string {
  if (locale === 'vi') {
    // Vietnamese native style: 350.000 ₫  /  1,2M ₫
    if (amount >= 1_000_000) {
      const m = amount / 1_000_000;
      return `${m.toFixed(1).replace(/\.0$/, '').replace('.', ',')}M ₫`;
    }
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
  // ko / en  →  350K ₫  /  1.2M ₫
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M ₫`;
  if (amount >= 10_000)    return `${Math.round(amount / 1_000)}K ₫`;
  return `${amount.toLocaleString()} ₫`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Format a monetary amount according to the given locale.
 *
 * @param amount    The raw numeric amount (never negative; use 0 for "free").
 * @param currency  ISO currency code – defaults to 'KRW'.
 * @param locale    Current app locale.
 * @param fmt       'full' (default) or 'short' — only meaningful for KRW.
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode,
  locale: AppLocale,
  fmt: PriceFormat = 'full',
): string {
  if (currency === 'VND') return _vnd(amount, locale);
  if (currency === 'USD') return `$${amount.toLocaleString('en-US')}`;
  return _krw(amount, locale, fmt);
}

/**
 * Format a date string (YYYY-MM-DD) in the requested style.
 *
 * @param dateString  ISO date string, e.g. "2026-04-15".
 * @param locale      Current app locale.
 * @param fmt
 *   - 'dot'      (default) YYYY.MM.DD  — universal, no localisation needed
 *   - 'short'    ko: M/D  |  en: Apr 15  |  vi: D/M
 *   - 'monthDay' ko: 4월 15일  |  en: Apr 15  |  vi: 15 tháng 4
 *   - 'long'     ko: 2026년 4월 15일  |  en: April 15, 2026  |  vi: ngày 15 tháng 4, 2026
 */
export function formatDate(
  dateString: string,
  locale: AppLocale,
  fmt: DateFormat = 'dot',
): string {
  if (fmt === 'dot') return dateString.replace(/-/g, '.');

  const date  = new Date(dateString);
  const bcp47 = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';

  if (fmt === 'short') {
    if (locale === 'ko') return `${date.getMonth() + 1}/${date.getDate()}`;
    if (locale === 'vi') return `${date.getDate()}/${date.getMonth() + 1}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Apr 15"
  }

  if (fmt === 'monthDay') {
    if (locale === 'ko') return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    if (locale === 'vi') return `${date.getDate()} tháng ${date.getMonth() + 1}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // long
  return date.toLocaleDateString(bcp47, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Compact review / popularity count.
 *
 * ko: 1.2천 / 2.1만
 * en: 1.2K  / 21K  / 2.1M
 * vi: 1,2K  / 21K  / 2,1M  (comma decimal, as in Vietnamese notation)
 */
export function formatReviewCount(n: number, locale: AppLocale): string {
  if (locale === 'ko') {
    if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}만`;
    if (n >= 1_000)  return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}천`;
    return `${n}`;
  }
  if (locale === 'vi') {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',')}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '').replace('.', ',')}K`;
    return `${n}`;
  }
  // en
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
}

/**
 * Trip duration display (number of nights → nights + days label).
 *
 * ko: 3박 4일
 * en: 3N / 4D
 * vi: 3 đêm / 4 ngày
 */
export function formatDuration(nights: number, locale: AppLocale): string {
  const days = nights + 1;
  if (locale === 'ko') return `${nights}박 ${days}일`;
  if (locale === 'vi') return `${nights} đêm / ${days} ngày`;
  return `${nights}N / ${days}D`;
}

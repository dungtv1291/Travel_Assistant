/**
 * useFormatter — locale-aware formatting hook.
 *
 * Reads the current app locale from `useLanguageStore` and returns a
 * stable object of formatting functions that automatically produce
 * locale-appropriate strings for prices, dates, counts and durations.
 *
 * Usage:
 *   const { formatPrice, formatPriceShort, formatDate, formatReviewCount, formatDuration } = useFormatter();
 *
 *   formatPrice(150_000)               // ko → "15만원"  en → "₩150,000"  vi → "₩150,000"
 *   formatPrice(350_000, 'VND')        // ko → "350K ₫"  en → "350K ₫"    vi → "350.000 ₫"
 *   formatPriceShort(285_000)          // ko → "₩28.5만" en → "₩285K"     vi → "₩285K"
 *   formatDate('2026-04-15')           // all → "2026.04.15"
 *   formatDate('2026-04-15', 'long')   // ko → "2026년 4월 15일"  en → "April 15, 2026"
 *   formatReviewCount(12_500)          // ko → "1.2천"  en → "12.5K"  vi → "12,5K"
 *   formatDuration(3)                  // ko → "3박 4일"  en → "3N / 4D"  vi → "3 đêm / 4 ngày"
 */

import { useMemo } from 'react';
import { useLanguageStore } from '../store/language.store';
import { useTranslation } from './useTranslation';
import {
  formatPrice  as _fmtPrice,
  formatDate   as _fmtDate,
  formatReviewCount as _fmtReview,
  formatDuration    as _fmtDuration,
  CurrencyCode,
  DateFormat,
  PriceFormat,
} from '../utils/formatLocale';

export function useFormatter() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation();

  return useMemo(() => ({
    /**
     * Format a monetary amount.
     * @param amount    Raw numeric value (0 → t('common.free')).
     * @param currency  'KRW' (default) | 'VND' | 'USD'
     * @param fmt       'full' (default) | 'short'
     */
    formatPrice(amount: number, currency: CurrencyCode = 'KRW', fmt: PriceFormat = 'full'): string {
      if (amount <= 0) return t('common.free');
      return _fmtPrice(amount, currency, locale, fmt);
    },

    /**
     * Short price badge form — equivalent to formatPrice(amount, currency, 'short').
     */
    formatPriceShort(amount: number, currency: CurrencyCode = 'KRW'): string {
      if (amount <= 0) return t('common.free');
      return _fmtPrice(amount, currency, locale, 'short');
    },

    /**
     * Format an ISO date string.
     * @param dateString  "YYYY-MM-DD"
     * @param fmt         'dot' (default) | 'short' | 'monthDay' | 'long'
     */
    formatDate(dateString: string, fmt: DateFormat = 'dot'): string {
      return _fmtDate(dateString, locale, fmt);
    },

    /**
     * Compact review/popularity count → locale-appropriate K/M/만/천 suffix.
     */
    formatReviewCount(n: number): string {
      return _fmtReview(n, locale);
    },

    /**
     * Trip duration from number of nights.
     * formatDuration(3) → "3박 4일" | "3N / 4D" | "3 đêm / 4 ngày"
     */
    formatDuration(nights: number): string {
      return _fmtDuration(nights, locale);
    },
  }), [locale, t]);
}

/**
 * KRW price displayed to Korean users.
 * ≥100,000 → "15만원" | ≥10,000 → "1만 5,000원" | else → "9,900원"
 */
export const formatKRWPrice = (amount: number): string => {
  if (amount <= 0) return '무료';
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(0)}억원`;
  }
  if (amount >= 10_000) {
    const man = Math.floor(amount / 10_000);
    const rest = amount % 10_000;
    if (rest === 0) return `${man.toLocaleString('ko-KR')}만원`;
    return `${man.toLocaleString('ko-KR')}만 ${rest.toLocaleString('ko-KR')}원`;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
};

/** Short form: 285,000 → "₩285,000" for list cards & badges */
export const formatKRWShort = (amount: number): string => {
  if (amount <= 0) return '무료';
  if (amount >= 10_000_000) return `₩${(amount / 10_000_000).toFixed(0)}천만`;
  if (amount >= 100_000) return `₩${(amount / 10_000).toFixed(0)}만`;
  return `₩${amount.toLocaleString('ko-KR')}`;
};

/** VND price: 350,000 → "350K ₫" | 1,200,000 → "1.2M ₫" */
export const formatVNDPrice = (amount: number): string => {
  if (amount <= 0) return '무료';
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M ₫`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 1_000)}K ₫`;
  }
  return `${amount.toLocaleString()} ₫`;
};

/** Convert VND → KRW and display. Rate: 1 VND ≈ 0.054 KRW (20 KRW ≈ 1,000 VND) */
export const formatVNDtoKRW = (vndAmount: number): string => {
  const krw = Math.round(vndAmount * 0.055);
  return formatKRWPrice(krw);
};

export const formatUSDPrice = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatDate = (dateString: string, locale = 'ko-KR'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatDuration = (days: number): string => {
  return `${days}박 ${days + 1}일`;
};

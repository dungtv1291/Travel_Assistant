export const formatKRWPrice = (amount: number): string => {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    if (rest === 0) return `${man}만원`;
    return `${man}만 ${rest.toLocaleString()}원`;
  }
  return `${amount.toLocaleString()}원`;
};

export const formatVNDPrice = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K ₫`;
  }
  return `${amount.toLocaleString()} ₫`;
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

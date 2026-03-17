/** Central registry of display labels and brand colors for entity categories. */

export const HOTEL_CATEGORY: Record<string, { label: string; color: string }> = {
  luxury:   { label: '럭셔리',    color: '#8B5CF6' },
  boutique: { label: '부티크',    color: '#D97706' },
  resort:   { label: '리조트',    color: '#1BBCD4' },
  business: { label: '비즈니스',  color: '#3B82F6' },
  budget:   { label: '가성비',    color: '#10B981' },
};

export const TRANSPORT_TYPE: Record<string, { label: string; color: string }> = {
  airport_pickup: { label: '공항 픽업',     color: '#1BBCD4' },
  private_car:    { label: '전용 차량',     color: '#FF6B35' },
  self_drive:     { label: '셀프 드라이브', color: '#22C55E' },
  day_tour:       { label: '데이 투어',     color: '#7C3AED' },
  scooter:        { label: '스쿠터',        color: '#F59E0B' },
};

export function ratingLabel(rating: number): string {
  if (rating >= 4.8) return '최고';
  if (rating >= 4.5) return '훌륭함';
  if (rating >= 4.2) return '좋음';
  return '보통';
}

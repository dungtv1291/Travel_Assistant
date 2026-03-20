import { Flight, AIFlightAnalysis, FlightTag } from '../types/flight.types';

// ── Airline catalogue ─────────────────────────────────────────────────────────
type AirlineKey = 'KE' | 'OZ' | 'VN' | 'VJ' | '7C' | 'LJ' | 'TW' | 'BX';
const AIRLINES: Record<AirlineKey, { name: string; code: string; emoji: string }> = {
  KE: { name: '대한항공',      code: 'KE', emoji: '🇰🇷' },
  OZ: { name: '아시아나항공',  code: 'OZ', emoji: '🌸' },
  VN: { name: '베트남항공',    code: 'VN', emoji: '🇻🇳' },
  VJ: { name: '비엣젯항공',    code: 'VJ', emoji: '🛩️' },
  '7C': { name: '제주항공',   code: '7C', emoji: '🟠' },
  LJ: { name: '진에어',        code: 'LJ', emoji: '💙' },
  TW: { name: '티웨이항공',    code: 'TW', emoji: '🔴' },
  BX: { name: '에어부산',      code: 'BX', emoji: '🟣' },
};

// ── Airport catalogue ─────────────────────────────────────────────────────────
type AirportKey = 'ICN' | 'GMP' | 'PUS' | 'HAN' | 'DAD' | 'SGN' | 'PQC' | 'CXR' | 'HUI';
const AIRPORTS: Record<AirportKey, { code: string; name: string; city: string; country: string }> = {
  ICN: { code: 'ICN', name: '인천국제공항',   city: '서울',    country: '대한민국' },
  GMP: { code: 'GMP', name: '김포국제공항',   city: '서울',    country: '대한민국' },
  PUS: { code: 'PUS', name: '김해국제공항',   city: '부산',    country: '대한민국' },
  HAN: { code: 'HAN', name: '노이바이국제공항', city: '하노이',  country: '베트남' },
  DAD: { code: 'DAD', name: '다낭국제공항',   city: '다낭',    country: '베트남' },
  SGN: { code: 'SGN', name: '탄손녓국제공항', city: '호치민시', country: '베트남' },
  PQC: { code: 'PQC', name: '푸꾸옥국제공항', city: '푸꾸옥',  country: '베트남' },
  CXR: { code: 'CXR', name: '캄란국제공항',   city: '나트랑',  country: '베트남' },
  HUI: { code: 'HUI', name: '푸바이국제공항', city: '후에',    country: '베트남' },
};

// ── Route templates ───────────────────────────────────────────────────────────
type RouteKey = string;
type RouteTpl = {
  al: string; fn: string; dep: string; arr: string; dur: string;
  stops: number; price: number; seats: number; baggage: boolean; meal: boolean;
  tags: string[];
};

const ROUTES: Record<RouteKey, RouteTpl[]> = {
  'ICN-DAD': [
    { al: 'KE', fn: 'KE683',   dep: '09:30', arr: '13:00', dur: '4h 30m', stops: 0, price: 285000, seats: 8,  baggage: true,  meal: true,  tags: ['fastest'] },
    { al: 'OZ', fn: 'OZ741',   dep: '08:00', arr: '11:35', dur: '4h 35m', stops: 0, price: 295000, seats: 12, baggage: true,  meal: true,  tags: ['popular'] },
    { al: 'VN', fn: 'VN413',   dep: '11:00', arr: '14:35', dur: '4h 35m', stops: 0, price: 248000, seats: 15, baggage: true,  meal: true,  tags: ['best_value'] },
    { al: 'VJ', fn: 'VJ953',   dep: '07:15', arr: '11:00', dur: '4h 45m', stops: 0, price: 198000, seats: 22, baggage: false, meal: false, tags: ['cheapest'] },
    { al: '7C', fn: '7C2901',  dep: '18:00', arr: '21:45', dur: '4h 45m', stops: 0, price: 185000, seats: 30, baggage: false, meal: false, tags: ['cheapest'] },
    { al: 'LJ', fn: 'LJ541',   dep: '14:30', arr: '18:10', dur: '4h 40m', stops: 0, price: 210000, seats: 20, baggage: false, meal: false, tags: [] },
    { al: 'TW', fn: 'TW251',   dep: '21:30', arr: '01:10', dur: '4h 40m', stops: 0, price: 205000, seats: 25, baggage: false, meal: false, tags: [] },
    { al: 'BX', fn: 'BX331',   dep: '16:45', arr: '20:25', dur: '4h 40m', stops: 0, price: 215000, seats: 18, baggage: false, meal: false, tags: [] },
  ],
  'ICN-HAN': [
    { al: 'OZ', fn: 'OZ345',   dep: '10:30', arr: '14:00', dur: '4h 30m', stops: 0, price: 310000, seats: 5,  baggage: true,  meal: true,  tags: ['fastest'] },
    { al: 'KE', fn: 'KE689',   dep: '13:00', arr: '16:30', dur: '4h 30m', stops: 0, price: 298000, seats: 10, baggage: true,  meal: true,  tags: ['popular'] },
    { al: 'VN', fn: 'VN401',   dep: '09:00', arr: '12:30', dur: '4h 30m', stops: 0, price: 255000, seats: 20, baggage: true,  meal: true,  tags: ['best_value'] },
    { al: 'VJ', fn: 'VJ887',   dep: '06:30', arr: '10:10', dur: '4h 40m', stops: 0, price: 199000, seats: 28, baggage: false, meal: false, tags: ['cheapest'] },
    { al: '7C', fn: '7C2731',  dep: '19:00', arr: '22:40', dur: '4h 40m', stops: 0, price: 182000, seats: 32, baggage: false, meal: false, tags: ['cheapest'] },
    { al: 'LJ', fn: 'LJ577',   dep: '21:45', arr: '01:25', dur: '4h 40m', stops: 0, price: 188000, seats: 22, baggage: false, meal: false, tags: [] },
    { al: 'TW', fn: 'TW261',   dep: '15:30', arr: '19:10', dur: '4h 40m', stops: 0, price: 209000, seats: 27, baggage: false, meal: false, tags: [] },
  ],
  'ICN-SGN': [
    { al: 'KE', fn: 'KE475',   dep: '09:30', arr: '14:30', dur: '5h 00m', stops: 0, price: 315000, seats: 12, baggage: true,  meal: true,  tags: ['fastest'] },
    { al: 'VN', fn: 'VN473',   dep: '12:00', arr: '17:20', dur: '5h 20m', stops: 0, price: 265000, seats: 18, baggage: true,  meal: true,  tags: ['best_value'] },
    { al: 'VJ', fn: 'VJ971',   dep: '07:00', arr: '12:15', dur: '5h 15m', stops: 0, price: 210000, seats: 25, baggage: false, meal: false, tags: ['cheapest'] },
    { al: 'OZ', fn: 'OZ755',   dep: '16:00', arr: '21:20', dur: '5h 20m', stops: 0, price: 329000, seats: 8,  baggage: true,  meal: true,  tags: ['popular'] },
    { al: 'TW', fn: 'TW321',   dep: '20:00', arr: '01:15', dur: '5h 15m', stops: 0, price: 205000, seats: 30, baggage: false, meal: false, tags: [] },
    { al: '7C', fn: '7C2811',  dep: '22:30', arr: '03:50', dur: '5h 20m', stops: 0, price: 195000, seats: 35, baggage: false, meal: false, tags: [] },
  ],
  'ICN-PQC': [
    { al: 'KE', fn: 'KE5697',  dep: '10:00', arr: '15:20', dur: '5h 20m', stops: 0, price: 345000, seats: 10, baggage: true,  meal: true,  tags: ['fastest'] },
    { al: 'VN', fn: 'VN4901',  dep: '09:00', arr: '14:40', dur: '5h 40m', stops: 1, price: 268000, seats: 20, baggage: true,  meal: true,  tags: ['best_value'] },
    { al: 'VJ', fn: 'VJ963',   dep: '06:00', arr: '11:50', dur: '5h 50m', stops: 0, price: 228000, seats: 22, baggage: false, meal: false, tags: ['cheapest'] },
    { al: '7C', fn: '7C2891',  dep: '19:30', arr: '01:20', dur: '5h 50m', stops: 0, price: 215000, seats: 28, baggage: false, meal: false, tags: [] },
    { al: 'TW', fn: 'TW391',   dep: '22:00', arr: '03:55', dur: '5h 55m', stops: 0, price: 220000, seats: 30, baggage: false, meal: false, tags: [] },
  ],
  'ICN-CXR': [
    { al: 'KE', fn: 'KE5699',  dep: '11:00', arr: '15:30', dur: '4h 30m', stops: 0, price: 289000, seats: 12, baggage: true,  meal: true,  tags: ['fastest'] },
    { al: 'VN', fn: 'VN4791',  dep: '09:30', arr: '14:20', dur: '4h 50m', stops: 1, price: 232000, seats: 18, baggage: true,  meal: true,  tags: ['best_value'] },
    { al: 'VJ', fn: 'VJ979',   dep: '07:30', arr: '12:15', dur: '4h 45m', stops: 0, price: 195000, seats: 25, baggage: false, meal: false, tags: ['cheapest'] },
    { al: '7C', fn: '7C2921',  dep: '20:00', arr: '00:50', dur: '4h 50m', stops: 0, price: 188000, seats: 30, baggage: false, meal: false, tags: [] },
  ],
  'ICN-HUI': [
    { al: 'VN', fn: 'VN4851',  dep: '08:30', arr: '12:50', dur: '4h 20m', stops: 0, price: 242000, seats: 15, baggage: true,  meal: true,  tags: ['best_value', 'fastest'] },
    { al: 'VJ', fn: 'VJ967',   dep: '06:00', arr: '10:25', dur: '4h 25m', stops: 0, price: 189000, seats: 22, baggage: false, meal: false, tags: ['cheapest'] },
    { al: 'KE', fn: 'KE5691',  dep: '12:00', arr: '16:20', dur: '4h 20m', stops: 0, price: 298000, seats: 9,  baggage: true,  meal: true,  tags: ['popular'] },
    { al: '7C', fn: '7C2851',  dep: '19:30', arr: '23:55', dur: '4h 25m', stops: 0, price: 175000, seats: 28, baggage: false, meal: false, tags: ['cheapest'] },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractCode(s: string): string {
  const m = s.match(/\(([A-Z]{3})\)/);
  return m ? m[1] : s.replace(/[^A-Z]/g, '').slice(0, 3);
}

function parseDurMin(dur: string): number {
  const m = dur.match(/(\d+)h\s*(\d+)m/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 999;
}

// ── Generator functions ───────────────────────────────────────────────────────
export function generateMockFlights(origin: string, destination: string): Flight[] {
  const oCode = extractCode(origin);
  const dCode = extractCode(destination);
  const key = `${oCode}-${dCode}`;
  const templates = ROUTES[key] ?? ROUTES['ICN-DAD'];
  const oAirport = AIRPORTS[oCode as AirportKey] ?? AIRPORTS.ICN;
  const dAirport = AIRPORTS[dCode as AirportKey] ?? AIRPORTS.DAD;

  return templates.map((tpl, i) => {
    const al = AIRLINES[tpl.al as AirlineKey];
    return {
      id: `fl-${key}-${i}`,
      airline: al.name,
      airlineCode: al.code,
      airlineLogo: al.emoji,
      flightNumber: tpl.fn,
      origin: oAirport,
      destination: dAirport,
      departureTime: tpl.dep,
      arrivalTime: tpl.arr,
      duration: tpl.dur,
      stops: tpl.stops,
      price: tpl.price,
      currency: 'KRW',
      class: 'economy' as const,
      seatsLeft: tpl.seats,
      baggage: { cabin: tpl.baggage ? '10kg' : '7kg', checked: tpl.baggage ? '23kg' : '없음 (추가 요금)' },
      meal: tpl.meal,
      tags: tpl.tags as FlightTag[],
    };
  });
}

export function generateAIAnalysis(flights: Flight[]): AIFlightAnalysis {
  const sorted = [...flights].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const fastest = [...flights].sort((a, b) => parseDurMin(a.duration) - parseDurMin(b.duration))[0];
  const withFullBaggage = flights.filter(f => f.baggage?.checked !== '없음 (추가 요금)');
  const bestValue = (withFullBaggage.length > 0
    ? withFullBaggage.sort((a, b) => a.price - b.price)[0]
    : sorted[1]) ?? sorted[0];
  const lowSeats = flights.filter(f => f.seatsLeft < 10).length;

  return {
    cheapest,
    fastest,
    bestValue,
    summary: `AI가 ${flights.length}개 항공편을 분석했습니다. 현재 가격 수준은 적정가입니다.`,
    recommendation: `${bestValue.airline} ${bestValue.flightNumber}편 추천 — 수하물 포함 합리적인 가격으로 가성비 최고입니다.`,
    currentPriceLevel: '적정가',
    priceChangePercent: 3,
    insights: [
      `🏷️ ${cheapest.airline} ${cheapest.flightNumber}편이 최저가 (${cheapest.price.toLocaleString()}원)`,
      `⚡ ${fastest.airline} ${fastest.flightNumber}편이 최단 비행 (${fastest.duration})`,
      `✅ ${bestValue.airline} ${bestValue.flightNumber}편이 수하물 포함 최저가`,
      ...(lowSeats > 0 ? [`⚠️ ${lowSeats}개 항공편 좌석 10석 미만 — 빠른 결정 권장`] : []),
    ],
    details: [
      '지금이 예약 최적 시점 — 출발 60일 전이 가장 저렴합니다',
      '주중(화~목) 항공권이 주말 대비 평균 8% 저렴합니다',
      '직항편은 경유 대비 시간을 2~4시간 절약합니다',
    ],
    bestBookingTime: '출발 45~60일 전',
  };
}

// ── Static exports (legacy compatibility & home screen deals) ─────────────────
export const mockFlights: Flight[] = generateMockFlights('ICN', 'DAD');
export const mockAIFlightAnalysis: AIFlightAnalysis = generateAIAnalysis(mockFlights);

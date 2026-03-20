import { Injectable, Logger } from '@nestjs/common';
import type {
  DayData,
  IAiPlannerService,
  MoneyAmount,
  PlannerInput,
  PlannerOutput,
  TimelineItemData,
  TipData,
  WarningData,
  WeatherData,
} from './interfaces/ai-planner.interface';

// ---------------------------------------------------------------------------
// Locale helpers
// ---------------------------------------------------------------------------

const DAY_LABELS: Record<string, (n: number) => string> = {
  ko: (n) => `DAY ${n}`,
  en: (n) => `DAY ${n}`,
  vi: (n) => `NGÀY ${n}`,
};

const BUDGET_LABELS: Record<string, Record<string, string>> = {
  ko: { KRW: '예상 원화 경비', VND: '예상 경비 (VND)', USD: '예상 달러 경비' },
  en: { KRW: 'Estimated cost (KRW)', VND: 'Estimated cost (VND)', USD: 'Estimated cost (USD)' },
  vi: { KRW: 'Chi phí ước tính (KRW)', VND: 'Chi phí ước tính', USD: 'Chi phí ước tính (USD)' },
};

// ---------------------------------------------------------------------------
// Money formatter
// ---------------------------------------------------------------------------

function formatMoney(amount: number, currency: string): string {
  if (currency === 'KRW') {
    if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(0)}천만원`;
    if (amount >= 1_000_000) return `${(amount / 10_000).toFixed(0)}만원`;
    if (amount >= 10_000) return `₩${(amount / 1000).toFixed(0)}K`;
    return `₩${amount.toLocaleString()}`;
  }
  if (currency === 'VND') {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M đ`;
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}K đ`;
    return `${amount}đ`;
  }
  // USD
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

function money(amount: number, currency: string): MoneyAmount {
  return { currency, amount, display: formatMoney(amount, currency) };
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function toDateLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// Weather samples varying by day (cycles through conditions)
// ---------------------------------------------------------------------------

const WEATHER_POOL: WeatherData[] = [
  { conditionCode: 'sunny', conditionLabel: '맑음', temperatureC: 30, note: '자외선 차단제 필수', iconKey: 'sun' },
  { conditionCode: 'partly_cloudy', conditionLabel: '구름 조금', temperatureC: 28, note: '가벼운 겉옷 챙기세요', iconKey: 'cloud_sun' },
  { conditionCode: 'cloudy', conditionLabel: '흐림', temperatureC: 26, note: '우산 지참 권장', iconKey: 'cloud' },
  { conditionCode: 'sunny', conditionLabel: '맑음', temperatureC: 31, note: '수분 보충 필수', iconKey: 'sun' },
  { conditionCode: 'partly_cloudy', conditionLabel: '구름 많음', temperatureC: 27, note: '오후 소나기 가능성', iconKey: 'cloud_sun' },
  { conditionCode: 'sunny', conditionLabel: '맑고 화창', temperatureC: 32, note: '모자와 선크림 챙기세요', iconKey: 'sun' },
];

// ---------------------------------------------------------------------------
// Per-pace activity count limits
// ---------------------------------------------------------------------------

const PACE_ITEM_COUNT: Record<string, number> = {
  relaxed: 5,
  balanced: 7,
  active: 9,
};

// ---------------------------------------------------------------------------
// Build realistic timeline items per day
// ---------------------------------------------------------------------------

function buildDayItems(
  dayNumber: number,
  pace: string,
  currency: string,
  _styles: string[],
): TimelineItemData[] {
  const costUnit = currency === 'KRW' ? 10_000 : currency === 'VND' ? 50_000 : 10;
  const maxItems = PACE_ITEM_COUNT[pace] ?? 7;

  const templates: TimelineItemData[] = [
    {
      itemPublicId: `item_d${dayNumber}_01`,
      type: 'food',
      startTime: '07:30',
      durationMinutes: 60,
      durationLabel: '1시간',
      title: `DAY ${dayNumber} 아침 식사`,
      description: '현지 로컬 맛집에서 가볍지만 든든하게 하루를 시작하세요.',
      location: { name: '로컬 카페&브런치', address: '시내 중심가', lat: null, lng: null },
      estimatedCost: money(costUnit * 3, currency),
      tipText: '오전 7~9시 방문 시 대기 없이 이용 가능',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'orange',
      iconKey: 'meal',
      imageUrl: null,
      tags: ['아침식사', '현지음식'],
    },
    {
      itemPublicId: `item_d${dayNumber}_02`,
      type: 'transport',
      startTime: '09:00',
      durationMinutes: 30,
      durationLabel: '30분',
      title: '그랩 이동',
      description: '앱으로 간편하게 호출 — 오토바이 택시가 더 저렴합니다.',
      location: { name: '시내 이동', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit, currency),
      tipText: 'Grab 앱 미리 설치 필수',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'blue',
      iconKey: 'car',
      imageUrl: null,
      tags: ['이동', '그랩'],
    },
    {
      itemPublicId: `item_d${dayNumber}_03`,
      type: 'attraction',
      startTime: '09:30',
      durationMinutes: 120,
      durationLabel: '2시간',
      title: `DAY ${dayNumber} 주요 명소`,
      description: '이 지역의 대표 명소를 여유롭게 탐방하세요. 사진 스팟으로도 유명합니다.',
      location: { name: '주요 명소', address: '시내 중심', lat: null, lng: null },
      estimatedCost: money(costUnit * 5, currency),
      tipText: '오전 입장 시 붐비지 않아 쾌적',
      bookingRequired: true,
      bookingUrl: null,
      accentColor: 'cyan',
      iconKey: 'camera',
      imageUrl: null,
      tags: ['명소', '문화'],
    },
    {
      itemPublicId: `item_d${dayNumber}_04`,
      type: 'food',
      startTime: '12:00',
      durationMinutes: 75,
      durationLabel: '1시간 15분',
      title: '점심 식사',
      description: '현지 대표 음식을 맛볼 수 있는 추천 레스토랑입니다.',
      location: { name: '추천 레스토랑', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit * 5, currency),
      tipText: '현금 결제만 가능한 경우 있음',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'orange',
      iconKey: 'meal',
      imageUrl: null,
      tags: ['점심', '현지음식'],
    },
    {
      itemPublicId: `item_d${dayNumber}_05`,
      type: 'beach',
      startTime: '14:00',
      durationMinutes: 120,
      durationLabel: '2시간',
      title: '해변 & 휴식',
      description: '에메랄드빛 바다에서 수영하거나 해변 산책을 즐기세요.',
      location: { name: '해변', address: null, lat: null, lng: null },
      estimatedCost: null,
      tipText: '오후 3시 이후 선베드 가격 협상 가능',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'cyan',
      iconKey: 'beach',
      imageUrl: null,
      tags: ['해변', '휴식'],
    },
    {
      itemPublicId: `item_d${dayNumber}_06`,
      type: 'shopping',
      startTime: '16:30',
      durationMinutes: 90,
      durationLabel: '1시간 30분',
      title: '시장 & 쇼핑',
      description: '현지 야시장 또는 쇼핑 거리에서 기념품 쇼핑.',
      location: { name: '야시장 / 쇼핑 거리', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit * 10, currency),
      tipText: '가격 흥정이 일반적. 처음 제시 가격의 70%로 시도',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'purple',
      iconKey: 'shopping',
      imageUrl: null,
      tags: ['쇼핑', '야시장'],
    },
    {
      itemPublicId: `item_d${dayNumber}_07`,
      type: 'food',
      startTime: '19:00',
      durationMinutes: 90,
      durationLabel: '1시간 30분',
      title: '저녁 & 야경',
      description: '강가 또는 해변 인근 야경 명소에서 저녁 식사를 즐기세요.',
      location: { name: '야경 맛집', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit * 7, currency),
      tipText: '예약 없으면 1시간 전 방문 권장',
      bookingRequired: true,
      bookingUrl: null,
      accentColor: 'orange',
      iconKey: 'meal',
      imageUrl: null,
      tags: ['저녁', '야경'],
    },
    {
      itemPublicId: `item_d${dayNumber}_08`,
      type: 'nightlife',
      startTime: '21:00',
      durationMinutes: 60,
      durationLabel: '1시간',
      title: '야간 스팟',
      description: '루프탑 바 또는 야간 카페에서 여행의 밤을 즐기세요.',
      location: { name: '루프탑 바', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit * 4, currency),
      tipText: '드레스 코드 있는 바 많음. 단정한 복장 권장',
      bookingRequired: false,
      bookingUrl: null,
      accentColor: 'purple',
      iconKey: 'moon',
      imageUrl: null,
      tags: ['야간', '루프탑'],
    },
    {
      itemPublicId: `item_d${dayNumber}_09`,
      type: 'wellness',
      startTime: '20:00',
      durationMinutes: 90,
      durationLabel: '1시간 30분',
      title: '스파 & 마사지',
      description: '전통 베트남 마사지로 하루 여독을 풀어보세요.',
      location: { name: '추천 스파', address: null, lat: null, lng: null },
      estimatedCost: money(costUnit * 6, currency),
      tipText: '사전 예약 시 10% 할인 제공 업체 있음',
      bookingRequired: true,
      bookingUrl: null,
      accentColor: 'green',
      iconKey: 'leaf',
      imageUrl: null,
      tags: ['스파', '힐링'],
    },
  ];

  return templates.slice(0, maxItems);
}

// ---------------------------------------------------------------------------
// Build warnings per day
// ---------------------------------------------------------------------------

function buildWarnings(dayNumber: number, items: TimelineItemData[]): WarningData[] {
  const bookingCount = items.filter((i) => i.bookingRequired).length;
  const warnings: WarningData[] = [];

  if (bookingCount > 0) {
    warnings.push({
      type: 'booking_required',
      title: '사전 예약 필요',
      text: `이 날 ${bookingCount}개 활동은 사전 예약이 필요합니다.`,
      count: bookingCount,
    });
  }

  if (dayNumber % 3 === 0) {
    warnings.push({
      type: 'crowded',
      title: '혼잡 주의',
      text: '주말 또는 성수기에는 주요 명소가 매우 혼잡합니다. 이른 방문을 권장합니다.',
      count: null,
    });
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Build smart tips per day
// ---------------------------------------------------------------------------

const SMART_TIP_POOL: string[] = [
  '현금을 충분히 환전해 두세요. ATM 수수료가 높을 수 있습니다.',
  '이동 시 Grab 앱을 적극 활용하세요. 미터 택시보다 저렴하고 안전합니다.',
  '자외선이 강합니다. 선크림 SPF 50+ 필수',
  '영어 기본 표현을 익혀두면 소통이 훨씬 수월합니다.',
  '식사 후 소화에는 로컬 허브티를 추천합니다.',
  '예약 필요 명소는 전날 저녁에 예약하는 것이 안전합니다.',
  '환율은 공항보다 시내 환전소가 유리합니다.',
];

function buildSmartTips(dayNumber: number): TipData[] {
  const start = (dayNumber - 1) % SMART_TIP_POOL.length;
  return [
    { orderNo: 1, text: SMART_TIP_POOL[start % SMART_TIP_POOL.length], iconKey: 'lightbulb' },
    { orderNo: 2, text: SMART_TIP_POOL[(start + 1) % SMART_TIP_POOL.length], iconKey: 'map' },
  ];
}

// ---------------------------------------------------------------------------
// Mock AI Planner — returns deterministic but realistic-looking data
// ---------------------------------------------------------------------------

/**
 * MockAiPlannerService — drop-in replacement for the real OpenAI provider.
 *
 * Produces a structurally valid itinerary that satisfies itinerary-schema.json
 * without making any external API calls. Replace this with OpenAiPlannerService
 * in AiPlannerModule.providers once the OpenAI key is configured.
 */
@Injectable()
export class MockAiPlannerService implements IAiPlannerService {
  private readonly logger = new Logger(MockAiPlannerService.name);

  lastCallMeta: IAiPlannerService['lastCallMeta'] = {
    providerName: 'mock',
    modelName: null,
    tokensUsed: null,
  };

  async generate(input: PlannerInput): Promise<PlannerOutput> {
    this.logger.log(
      `[mock] Generating itinerary for ${input.destination.slug}, ` +
        `${input.days}D/${input.nights}N, lang=${input.language}, currency=${input.currency}`,
    );

    const hasStartDate = Boolean(input.startDate);
    const dayLabel = DAY_LABELS[input.language] ?? DAY_LABELS['ko'];
    const budgetLabel =
      (BUDGET_LABELS[input.language] ?? BUDGET_LABELS['ko'])[input.currency] ?? '예상 경비';

    let totalAmount = 0;

    const days: DayData[] = Array.from({ length: input.days }, (_, idx) => {
      const dayNumber = idx + 1;
      const date = hasStartDate ? addDays(input.startDate!, idx) : null;
      const dateLabel = date ? toDateLabel(date) : null;

      const items = buildDayItems(dayNumber, input.pace, input.currency, input.travelStyles);
      const warnings = buildWarnings(dayNumber, items);
      const smartTips = buildSmartTips(dayNumber);

      const bookingNeededItems = items
        .filter((i) => i.bookingRequired)
        .map((i) => i.title);

      const dayAmount = items.reduce((acc, it) => {
        return acc + (it.estimatedCost?.amount ?? 0);
      }, 0);

      totalAmount += dayAmount;

      const weather = WEATHER_POOL[(dayNumber - 1) % WEATHER_POOL.length];

      return {
        dayNumber,
        date,
        dateLabel,
        dayLabel: dayLabel(dayNumber),
        title: this.buildDayTitle(dayNumber, input),
        weather,
        estimatedCost: money(dayAmount, input.currency),
        items,
        warnings,
        bookingNeededItems,
        smartTips,
      };
    });

    const title = this.buildItineraryTitle(input);

    return {
      title,
      budgetLabel,
      totalCost: money(totalAmount, input.currency),
      days,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildItineraryTitle(input: PlannerInput): string {
    const { language, nights, days, destination } = input;
    if (language === 'ko') {
      return `AI 추천 ${destination.name} ${nights}박 ${days}일`;
    }
    if (language === 'vi') {
      return `Lịch trình ${nights} đêm ${days} ngày tại ${destination.name}`;
    }
    return `AI-Planned ${nights}-Night ${days}-Day Trip to ${destination.name}`;
  }

  private buildDayTitle(dayNumber: number, input: PlannerInput): string {
    const titles: Record<string, string[]> = {
      ko: [
        '도착 & 첫 탐방',
        '시내 투어 & 맛집',
        '자연 & 액티비티',
        '문화 & 쇼핑',
        '해변 & 스파',
        '마지막 날 & 귀국',
      ],
      en: [
        'Arrival & First Exploration',
        'City Tour & Food',
        'Nature & Activities',
        'Culture & Shopping',
        'Beach & Spa',
        'Last Day & Departure',
      ],
      vi: [
        'Đến nơi & Khám phá',
        'Tham quan thành phố & Ẩm thực',
        'Thiên nhiên & Hoạt động',
        'Văn hóa & Mua sắm',
        'Biển & Spa',
        'Ngày cuối & Về nước',
      ],
    };
    const pool = titles[input.language] ?? titles['ko'];
    return pool[(dayNumber - 1) % pool.length];
  }
}

// Keep the unused import alive — interface is implemented by this class
// (TypeScript structural typing; explicit cast satisfies the compiler only
// when splitting the interface into a separate symbol)
type _Ensure = IAiPlannerService;

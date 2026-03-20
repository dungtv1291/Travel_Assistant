import { Trip } from '../types/trip.types';

export const mockItineraries: Trip[] = [
  {
    id: 'trip-1',
    title: '다낭 & 호이안 5일 완벽 여행',
    destination: '다낭, 호이안',
    startDate: '2026-04-15',
    endDate: '2026-04-19',
    duration: 5,
    coverImage: 'https://images.unsplash.com/photo-1552201133-08fd8e8c0fd6?w=800',
    status: 'planned',
    totalEstimatedCost: 3000000,
    currency: 'KRW',
    travelStyle: 'cultural',
    travelers: 'couple',
    createdAt: '2026-03-10T08:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      '4월은 다낭의 최적 여행 시기입니다 (건기)',
      '황금다리는 주말에 매우 혼잡합니다. 평일 오전 방문 권장',
      '호이안 야시장은 저녁 7시 이후 방문 추천',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-04-15',
        title: '다낭 도착 & 해변 휴식',
        weatherNote: '맑음 30°C — 자외선 차단제 필수',
        estimatedCost: 200000,
        activities: [
          {
            id: 'act-1-1',
            time: '14:00',
            duration: '1시간',
            type: 'transport',
            title: '공항에서 호텔 이동',
            location: '다낭국제공항 → 미케해변',
            description: '예약된 픽업 차량으로 편안하게 이동',
            estimatedCost: 350000,
            currency: 'VND',
            bookingRequired: true,
          },
          {
            id: 'act-1-2',
            time: '15:30',
            duration: '2시간',
            type: 'attraction',
            title: '미케 해변 산책',
            location: '미케 해변, 다낭',
            description: '아시아 최고의 해변 중 하나인 미케 해변을 즐기세요',
            imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
            estimatedCost: 0,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-1-3',
            time: '19:00',
            duration: '1.5시간',
            type: 'food',
            title: '해산물 레스토랑 저녁',
            location: 'My Khe Seafood Restaurant',
            description: '신선한 베트남 해산물을 저렴한 가격에 즐기세요',
            estimatedCost: 250000,
            currency: 'VND',
            tips: '미리 예약하지 않아도 됩니다. 라이브 수족관에서 원하는 해산물을 고르세요.',
            bookingRequired: false,
          },
        ],
      },
      {
        day: 2,
        date: '2026-04-16',
        title: '바나힐 & 황금다리',
        weatherNote: '구름 조금 27°C — 케이블카 운행 정상',
        estimatedCost: 1200000,
        activities: [
          {
            id: 'act-2-1',
            time: '08:00',
            duration: '30분',
            type: 'food',
            title: '호텔 조식 또는 반미 아침식사',
            location: 'Madam Khanh Banh Mi',
            description: '현지인이 사랑하는 반미로 하루를 시작하세요',
            estimatedCost: 50000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-2-2',
            time: '09:00',
            duration: '6시간',
            type: 'attraction',
            title: '바나힐 & 황금다리',
            location: '바나힐, 다낭',
            description: '세계적으로 유명한 황금다리와 프랑스 빌리지를 탐방하세요',
            imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
            estimatedCost: 750000,
            currency: 'VND',
            tips: '주말보다 평일이 훨씬 덜 붐빕니다. 산 위는 시원하니 가벼운 겉옷 필요',
            bookingRequired: true,
          },
        ],
      },
      {
        day: 3,
        date: '2026-04-17',
        title: '호이안 고대 도시 탐방',
        weatherNote: '맑음 29°C — 완벽한 사진 촬영 날씨',
        estimatedCost: 500000,
        activities: [
          {
            id: 'act-3-1',
            time: '09:00',
            duration: '30분',
            type: 'transport',
            title: '다낭 → 호이안 이동',
            location: '다낭 → 호이안 (약 30분)',
            description: '전용 차량 또는 그랩 택시로 이동',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-3-2',
            time: '09:30',
            duration: '4시간',
            type: 'attraction',
            title: '호이안 구시가지 관광',
            location: '호이안 구시가지',
            description: '유네스코 세계문화유산 구시가지를 도보로 탐방하세요',
            imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
            estimatedCost: 120000,
            currency: 'VND',
            tips: '입장권으로 5개 명소 방문 가능. 일출 직후가 가장 조용함',
            bookingRequired: false,
          },
          {
            id: 'act-3-3',
            time: '19:30',
            duration: '2시간',
            type: 'attraction',
            title: '야시장 & 랜턴 띄우기',
            location: '투본강, 호이안',
            description: '형형색색의 랜턴이 빛나는 야시장을 즐기세요',
            estimatedCost: 100000,
            currency: 'VND',
            bookingRequired: false,
          },
        ],
      },
    ],
  },
  {
    id: 'trip-2',
    title: '하롱베이 크루즈 2박 3일',
    destination: '하롱베이',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    duration: 3,
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    status: 'draft',
    totalEstimatedCost: 1500000,
    currency: 'KRW',
    travelStyle: 'adventure',
    travelers: 'friends',
    createdAt: '2026-03-08T10:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      '5월은 하롱베이의 최적 여행 시기 (맑은 날씨, fewer tourists)',
      '크루즈 선택 시 최소 3성급 이상 추천 (저렴한 크루즈는 실망할 수 있음)',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-05-20',
        title: '하노이 출발 → 하롱베이 탑승',
        weatherNote: '맑음 26°C',
        estimatedCost: 300000,
        activities: [
          {
            id: 'act-a-1',
            time: '08:00',
            duration: '4시간',
            type: 'transport',
            title: '하노이 → 하롱베이',
            location: '하노이 구시가지',
            description: '버스로 하롱베이 항구까지 이동',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: true,
          },
        ],
      },
    ],
  },
];


const mockItinerariesEn: Trip[] = [
  {
    id: 'trip-1',
    title: 'Da Nang & Hoi An — Perfect 5-Day Trip',
    destination: 'Da Nang, Hoi An',
    startDate: '2026-04-15',
    endDate: '2026-04-19',
    duration: 5,
    coverImage: 'https://images.unsplash.com/photo-1552201133-08fd8e8c0fd6?w=800',
    status: 'planned',
    totalEstimatedCost: 3000000,
    currency: 'KRW',
    travelStyle: 'cultural',
    travelers: 'couple',
    createdAt: '2026-03-10T08:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      'April is Da Nang\'s dry season — ideal travel weather',
      'Golden Bridge gets very crowded on weekends. Visit on a weekday morning',
      'Hoi An night market is best visited after 7pm',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-04-15',
        title: 'Arrival & Beach Relaxation',
        weatherNote: 'Sunny 30°C — Apply sunscreen',
        estimatedCost: 200000,
        activities: [
          {
            id: 'act-1-1',
            time: '14:00',
            duration: '1 hr',
            type: 'transport',
            title: 'Airport to Hotel Transfer',
            location: 'Da Nang International Airport → My Khe Beach',
            description: 'Relax in your pre-booked pickup car as you head to the hotel',
            estimatedCost: 350000,
            currency: 'VND',
            bookingRequired: true,
          },
          {
            id: 'act-1-2',
            time: '15:30',
            duration: '2 hrs',
            type: 'attraction',
            title: 'My Khe Beach Stroll',
            location: 'My Khe Beach, Da Nang',
            description: 'Unwind on one of Asia\'s finest beaches — golden sand and clear calm water',
            imageUrl: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
            estimatedCost: 0,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-1-3',
            time: '19:00',
            duration: '1.5 hrs',
            type: 'food',
            title: 'Seafood Restaurant Dinner',
            location: 'My Khe Seafood Restaurant',
            description: 'Enjoy fresh Vietnamese seafood at surprisingly affordable local prices',
            estimatedCost: 250000,
            currency: 'VND',
            tips: 'No reservation needed. Choose your seafood live from the tank.',
            bookingRequired: false,
          },
        ],
      },
      {
        day: 2,
        date: '2026-04-16',
        title: 'Ba Na Hills & Golden Bridge',
        weatherNote: 'Partly cloudy 27°C — Cable car operating normally',
        estimatedCost: 1200000,
        activities: [
          {
            id: 'act-2-1',
            time: '08:00',
            duration: '30 min',
            type: 'food',
            title: 'Hotel Breakfast or Banh Mi',
            location: 'Madam Khanh Banh Mi',
            description: 'Start the day with a local banh mi sandwich — a firm favourite with residents',
            estimatedCost: 50000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-2-2',
            time: '09:00',
            duration: '6 hrs',
            type: 'attraction',
            title: 'Ba Na Hills & Golden Bridge',
            location: 'Ba Na Hills, Da Nang',
            description: 'Explore the world-famous Golden Bridge and the French village at the summit',
            imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
            estimatedCost: 750000,
            currency: 'VND',
            tips: 'Much quieter on weekdays. The summit is cool — bring a light jacket.',
            bookingRequired: true,
          },
        ],
      },
      {
        day: 3,
        date: '2026-04-17',
        title: 'Hoi An Ancient Town',
        weatherNote: 'Sunny 29°C — Perfect photography weather',
        estimatedCost: 500000,
        activities: [
          {
            id: 'act-3-1',
            time: '09:00',
            duration: '30 min',
            type: 'transport',
            title: 'Da Nang → Hoi An Transfer',
            location: 'Da Nang → Hoi An (approx. 30 min)',
            description: 'Travel by private car or Grab taxi — a scenic coastal drive',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: false,
          },
          {
            id: 'act-3-2',
            time: '09:30',
            duration: '4 hrs',
            type: 'attraction',
            title: 'Hoi An Old Town Sightseeing',
            location: 'Hoi An Old Town',
            description: 'Walk the UNESCO World Heritage old town and visit its 5 historic sites',
            imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
            estimatedCost: 120000,
            currency: 'VND',
            tips: 'One ticket covers 5 attractions. Quietest right after sunrise.',
            bookingRequired: false,
          },
          {
            id: 'act-3-3',
            time: '19:30',
            duration: '2 hrs',
            type: 'attraction',
            title: 'Night Market & Lantern Floating',
            location: 'Thu Bon River, Hoi An',
            description: 'Float a glowing lantern on the river and wander the colorful night market',
            estimatedCost: 100000,
            currency: 'VND',
            bookingRequired: false,
          },
        ],
      },
    ],
  },
  {
    id: 'trip-2',
    title: 'Ha Long Bay Cruise — 2 Nights 3 Days',
    destination: 'Ha Long Bay',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    duration: 3,
    coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    status: 'draft',
    totalEstimatedCost: 1500000,
    currency: 'KRW',
    travelStyle: 'adventure',
    travelers: 'friends',
    createdAt: '2026-03-08T10:00:00Z',
    isAIGenerated: true,
    aiInsights: [
      'May is one of Ha Long Bay\'s best months — clear skies and fewer tourists than summer',
      'Always choose a minimum 3-star cruise — budget options often disappoint',
    ],
    itinerary: [
      {
        day: 1,
        date: '2026-05-20',
        title: 'Hanoi Departure → Board the Cruise',
        weatherNote: 'Clear 26°C',
        estimatedCost: 300000,
        activities: [
          {
            id: 'act-a-1',
            time: '08:00',
            duration: '4 hrs',
            type: 'transport',
            title: 'Hanoi → Ha Long Bay Transfer',
            location: 'Hanoi Old Quarter',
            description: 'Comfortable bus transfer arriving at the cruise terminal in Ha Long',
            estimatedCost: 300000,
            currency: 'VND',
            bookingRequired: true,
          },
        ],
      },
    ],
  },
];

export function getMockItineraries(language: string): Trip[] {
  return language === 'ko' ? mockItineraries : mockItinerariesEn;
}

// ── Rich AI Itinerary Engine ──────────────────────────────────────────────────

type DestKey = '다낭' | '호이안' | '하노이' | '호치민' | '푸꾸옥' | '하롱베이' | '사파' | '나트랑' | '후에';

interface DestinationProfile {
  cover: string;
  weather: string[];   // per-day rotation
  dayThemes: string[];
  morningAttractions: { title: string; location: string; desc: string; cost: number; img?: string; tips?: string; booking: boolean }[];
  afternoonAttractions: { title: string; location: string; desc: string; cost: number; img?: string; tips?: string; booking: boolean }[];
  eveningAttractions: { title: string; location: string; desc: string; cost: number; img?: string; tips?: string; booking: boolean }[];
  breakfasts: { title: string; location: string; desc: string; cost: number; tips?: string; booking?: boolean }[];
  lunches: { title: string; location: string; desc: string; cost: number; tips?: string; booking?: boolean }[];
  dinners: { title: string; location: string; desc: string; cost: number; tips?: string; booking?: boolean }[];
  transports: { title: string; location: string; desc: string; cost: number; booking?: boolean }[];
  insights: string[];
  warnings: string[];
  budgetPerDay: { budget: number; medium: number; luxury: number };
}

const DEST_PROFILES: Record<DestKey, DestinationProfile> = {
  '다낭': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['맑음 30°C ☀️ — 자외선 차단제 필수', '구름 조금 28°C 🌤 — 야외 활동 최적', '맑음 31°C ☀️ — 오후 해변이 최고', '소나기 가능 27°C 🌦 — 우산 챙기세요', '맑음 29°C ☀️'],
    dayThemes: ['도착 & 해변 탐방', '바나힐 & 황금다리', '호이안 고대 도시', '마블 마운틴 & 쇼핑', '오행산 & 출발'],
    morningAttractions: [
      { title: '미케 해변 산책', location: '미케 해변, 다낭', desc: '아시아 10대 해변 중 하나 — 이른 아침 파도 소리와 함께 산책', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: '바나힐 케이블카', location: '바나힐 국립공원', desc: '세계 최장 케이블카로 정상까지 이동 — 황금다리가 기다립니다', cost: 750000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: '오전 9시 전 도착하면 대기 없이 탑승 가능', booking: true },
      { title: '오행산(마블 마운틴)', location: '다낭 남쪽 10km', desc: '5개 석회암 산 중 최고봉 등반 — 동굴 불교 사원 탐방', cost: 40000, img: 'https://images.unsplash.com/photo-1614093302611-8eaddbfd1d26?w=600', tips: '엘리베이터 이용 시 추가 15,000₫', booking: false },
    ],
    afternoonAttractions: [
      { title: '한 시장 쇼핑', location: '한 시장, 다낭 중심가', desc: '현지 먹거리와 기념품이 가득한 재래시장', cost: 0, booking: false },
      { title: '황금다리(Golden Bridge)', location: '바나힐 정상', desc: '거대한 손이 받치는 황금빛 다리 — 인생 사진 명소', cost: 0, tips: '줄이 길 수 있으니 평일 방문 권장', booking: false },
      { title: '용교 야경 포토 스팟', location: '한강 용교', desc: '주말 저녁 불 뿜는 드래곤 브리지 구경', cost: 0, tips: '토/일 밤 9시에 불꽃 쇼 진행', booking: false },
    ],
    eveningAttractions: [
      { title: '한강 야경 크루즈', location: '한강 선착장', desc: '다낭 야경을 물 위에서 감상하는 1시간 크루즈', cost: 200000, booking: true },
      { title: '다낭 나이트 마켓', location: '박당 거리', desc: '밤마다 열리는 야시장 — 노점 음식과 기념품', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: '반미 아침식사', location: 'Banh Mi Phuong', desc: '다낭 최고의 반미 맛집 — Anthony Bourdain이 극찬', cost: 35000, tips: '오전 7시~10시 방문 추천. 대기 줄 있음' },
      { title: '쌀국수(퍼) 아침', location: 'Pho Xua Restaurant', desc: '현지인이 즐기는 진한 육수의 퍼', cost: 50000 },
      { title: '호텔 조식 뷔페', location: '숙소 내', desc: '편안하게 호텔 조식으로 하루 시작', cost: 0, tips: '포함 여부 사전 확인' },
    ],
    lunches: [
      { title: '미꽝 (Mi Quang)', location: 'Mi Quang 1A', desc: '다낭 향토 쌀국수 — 강황면에 새우·돼지고기', cost: 60000, tips: '현지인 맛집, 영어 메뉴 없음. 손가락으로 주문' },
      { title: '반쎄오 (Bánh Xèo)', location: 'Quan Com Hué Ba Cu', desc: '바삭한 베트남식 부침개 — 새우/돼지고기/숙주', cost: 70000 },
    ],
    dinners: [
      { title: '해산물 BBQ 디너', location: 'Be Man Quan Seafood', desc: '싱싱한 해산물을 테이블에서 직접 굽는 현지 인기 음식점', cost: 350000, tips: '저녁 6시부터 매우 붐빔. 예약 권장' },
      { title: '루프탑 다이닝', location: 'Sky 36 Restaurant', desc: '36층에서 즐기는 다낭 야경과 서양/아시안 퓨전', cost: 500000, booking: true },
    ],
    transports: [
      { title: '그랩 택시 이동', location: '다낭 시내', desc: '앱으로 편리하게 호출 — 오토바이 택시 훨씬 저렴', cost: 80000 },
      { title: '전동 스쿠터 렌트', location: '미케 해변 렌탈샵', desc: '하루 종일 자유롭게 이동 — 면허 필요 없음(현지 규정)', cost: 150000 },
    ],
    insights: [
      '4~5월은 다낭의 건기로 여행 최적 시기입니다',
      '황금다리는 평일 오전이 가장 한산합니다',
      '미케 해변 선베드: 무료 구역과 유료 구역이 구분됩니다',
      '현금 VND 준비 필수 — 소규모 식당은 카드 미수락',
    ],
    warnings: [
      '⚠️ 바나힐 현지 구매 티켓보다 온라인 사전 구매가 약 10% 저렴합니다',
      '⚠️ 용교 불꽃 쇼는 토·일요일만 운영됩니다',
      '⚠️ 스쿠터 렌트 시 국제면허증 소지 권장',
    ],
    budgetPerDay: { budget: 300000, medium: 600000, luxury: 1200000 },
  },
  '호이안': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['맑음 29°C ☀️ — 구시가지 산책 최적', '흐림 27°C 🌥 — 야외 활동 OK', '맑음 30°C ☀️', '소나기 가능 26°C 🌦', '맑음 28°C ☀️'],
    dayThemes: ['구시가지 탐방', '투본강 & 랜턴 마을', '쿠킹 클래스 & 자전거', '해변 & 쇼핑', '떠나기 전 아침 시장'],
    morningAttractions: [
      { title: '호이안 구시가지', location: '호이안 고대 도시', desc: '유네스코 세계문화유산 — 입장권으로 5개 명소 방문', cost: 120000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: '일출 직후 7~8시가 가장 조용함', booking: false },
      { title: '투본강 보트 투어', location: '투본강 선착장', desc: '강 위에서 구시가지 전경 감상 — 30분 코스', cost: 150000, booking: true },
      { title: '내원사 & 광저우 회관', location: '호이안 구시가지', desc: '200년 역사의 중국식 절과 회관 탐방', cost: 0, tips: '입장권 포함', booking: false },
    ],
    afternoonAttractions: [
      { title: '베트남 쿠킹 클래스', location: 'Miss Ly Cooking Class', desc: '현지 시장에서 재료 구매 후 3가지 요리 직접 만들기', cost: 450000, img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600', tips: '4시간 소요. 사전 예약 필수', booking: true },
      { title: '자전거로 논밭 투어', location: '호이안 외곽 농촌', desc: '자전거 타고 베트남 시골 풍경 만끽 — 반 나절', cost: 200000, booking: false },
    ],
    eveningAttractions: [
      { title: '야시장 & 랜턴 띄우기', location: '투본강, 호이안', desc: '형형색색 랜턴이 강 위를 수놓는 환상적인 밤', cost: 50000, tips: '랜턴 하나 25,000₫, 강변에 내려놓으세요', booking: false },
      { title: '호이안 나이트 마켓', location: '응우옌호앙 거리', desc: '수공예품·기념품·거리 음식 가득한 야시장', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: '까오러우', location: 'Thanh Cao Lau', desc: '호이안 명물 쌀면 요리 — 반드시 맛봐야 할 현지 음식', cost: 55000 },
      { title: '반미 & 어묵탕', location: 'Banh Mi Phuong Hoi An', desc: '오바마가 방문한 전설의 반미 맛집', cost: 35000, tips: '오전 7~9시 줄이 길 수 있음' },
    ],
    lunches: [
      { title: '화이트 로즈 & 반봐이', location: 'White Rose Restaurant', desc: '호이안 전통 새우 만두 요리 — 호이안에서만 맛볼 수 있음', cost: 80000 },
      { title: '쌀국수 & 스프링롤', location: 'Mango Mango Restaurant', desc: '구시가지 뷰를 즐기며 먹는 베트남 음식', cost: 150000 },
    ],
    dinners: [
      { title: '강변 씨푸드 디너', location: 'Mango Rooms', desc: '투본강 뷰 레스토랑에서 즐기는 퓨전 베트남 요리', cost: 400000, booking: true },
      { title: '전통 호이안 세트', location: 'Morning Glory Restaurant', desc: '호이안 대표 음식 모아서 코스로', cost: 350000 },
    ],
    transports: [
      { title: '자전거 렌트', location: '구시가지 렌탈샵', desc: '구시가지 내 이동은 자전거가 최고 — 하루 50,000₫', cost: 50000 },
      { title: '씨클로(인력거) 투어', location: '호이안 구시가지', desc: '현지 씨클로로 구시가지 한 바퀴', cost: 100000 },
    ],
    insights: [
      '음력 14일 밤에는 구시가지 전등을 끄고 랜턴만 밝히는 특별 이벤트가 있습니다',
      '맞춤 의류 제작은 24시간 소요 — 도착 첫날 주문하세요',
      '현지 투본강 보트 투어는 그룹 가격으로 흥정 가능',
    ],
    warnings: [
      '⚠️ 구시가지는 12:00~17:00 오토바이 통행 금지',
      '⚠️ 맞춤 의상 제작 시 여러 가게 비교 후 결정 (바가지 주의)',
      '⚠️ 강물은 우기에 급격히 증가할 수 있습니다',
    ],
    budgetPerDay: { budget: 250000, medium: 500000, luxury: 1000000 },
  },
  '하노이': {
    cover: 'https://images.unsplash.com/photo-1509510983883-40b4c9e3742e?w=800',
    weather: ['선선 23°C 🌥 — 여행 최적', '흐림 21°C — 가벼운 겉옷 필요', '맑음 25°C ☀️', '안개 낀 22°C 🌫 — 신비로운 분위기', '맑음 24°C ☀️'],
    dayThemes: ['구시가지 & 호안끼엠 호수', '호찌민 묘소 & 사원 투어', '올드 쿼터 푸드 투어', '쉔떠이 호수 & 박물관', '출발 전 마지막 커피'],
    morningAttractions: [
      { title: '호안끼엠 호수 & 거북이 사원', location: '호안 끼엠, 하노이', desc: '하노이 심장부에 있는 에메랄드빛 호수와 600년 역사 사원', cost: 0, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', booking: false },
      { title: '호찌민 묘소', location: '바딘 광장, 하노이', desc: '베트남 건국 영웅 호찌민의 묘소 — 무료 입장', cost: 0, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: '화~목 오전 7:30~10:30 개방. 반바지/민소매 입장 불가', booking: false },
      { title: '반딘 사원 (Temple of Literature)', location: '하노이 구시가지', desc: '1070년 창건, 베트남 최초 대학 터 — 공자 사원', cost: 30000, booking: false },
    ],
    afternoonAttractions: [
      { title: '36거리 구시가지 투어', location: '하노이 올드 쿼터', desc: '각 거리마다 다른 전통 공예품 판매 — 항가이, 항봉, 항다오 거리', cost: 0, tips: '협상은 필수 — 처음 가격의 50~60%가 적정 가격', booking: false },
      { title: '베트남 민족학 박물관', location: '하노이 서부', desc: '54개 소수민족 생활문화 전시 — 야외 전통 집 재현', cost: 40000, booking: false },
    ],
    eveningAttractions: [
      { title: '수상인형극', location: 'Thang Long Water Puppet Theatre', desc: '1000년 전통 베트남 전통 공연 — 반드시 봐야 할 필수 체험', cost: 100000, tips: '공연 30분 전 도착 추천. 인기 공연으로 사전 예약 필요', booking: true },
      { title: '타힌 거리 맥주 거리', location: '타힌 거리, 하노이', desc: '하노이 청년들의 집합소 — 330cc 생맥주 5,000₫', cost: 50000, booking: false },
    ],
    breakfasts: [
      { title: '퍼 보 (Phở Bò)', location: 'Pho Bat Dan', desc: '1955년부터 이어온 하노이 전통 쌀국수 — 줄 서는 맛집', cost: 60000, tips: '오전 6시 오픈. 일찍 가야 솥이 남아 있음' },
      { title: '반꾸온 (Bánh Cuốn)', location: 'Bánh Cuốn Gia Truyen', desc: '쌀 크레이프에 돼지고기·목이버섯·파를 넣은 아침식사', cost: 50000 },
    ],
    lunches: [
      { title: '분짜 (Bún Chả)', location: 'Bun Cha Huong Lien', desc: '오바마 & 앤서니 보댕이 방문한 바로 그 식당 — 하노이 국민 음식', cost: 70000, tips: '식당 2층에 오바마 방문 사진 전시', booking: false },
      { title: '넴꾸온 & 스프링롤', location: 'Quan An Ngon', desc: '하노이 전통 요리 세트 — 다양한 요리 한번에', cost: 200000 },
    ],
    dinners: [
      { title: '루프탑 레스토랑', location: 'Summit Lounge, Sofitel Legend Metropole', desc: '하노이 풍경과 함께 즐기는 프렌치-베트남 퓨전 디너', cost: 800000, booking: true },
      { title: '쉽어 (Chả Cá Lã Vọng)', location: 'Cha Ca La Vong', desc: '150년 역사 하노이 명물 — 딜 향草과 함께 구운 생선', cost: 300000 },
    ],
    transports: [
      { title: '시클로 후에 거리 투어', location: '하노이 올드 쿼터', desc: '시클로로 구시가지 감상 — 1시간 투어', cost: 150000, booking: false },
      { title: '그랩 바이크', location: '하노이 시내', desc: '하노이 교통체증 회피 최고 수단', cost: 30000 },
    ],
    insights: [
      '하노이 구시가지는 걸어다니는 것이 가장 좋습니다',
      '주말 저녁 호안끼엠 호수 주변은 보행자 전용 구역으로 변합니다',
      '분짜 식당 앞 번호표 받는 것 잊지 마세요',
    ],
    warnings: [
      '⚠️ 호찌민 묘소: 월요일·금요일 휴관',
      '⚠️ 구시가지 쇼핑 시 바가지 가격 주의 — 반드시 협상',
      '⚠️ 오토바이 vs 歩行者 — 길 건널 때 천천히 일정한 속도로',
    ],
    budgetPerDay: { budget: 280000, medium: 550000, luxury: 1100000 },
  },
  '호치민': {
    cover: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    weather: ['맑고 더움 34°C ☀️ — 물 충분히', '뜨거운 햇살 35°C ☀️', '소나기 가능 31°C 🌦', '맑음 33°C ☀️', '흐림 30°C 🌥'],
    dayThemes: ['프렌치 식민지 구시가지', '전쟁 역사 투어', '쩌런 차이나타운 & 시장', '메콩강 당일치기', '쇼핑 & 귀국'],
    morningAttractions: [
      { title: '통일궁(독립궁)', location: '남끼카이응이아 3번지', desc: '1975년 해방 당시 그대로 보존된 역사적 장소', cost: 40000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', booking: false },
      { title: '전쟁박물관', location: '보반탄 28번지', desc: '베트남 전쟁의 생생한 역사를 담은 박물관 — 감동과 반성', cost: 40000, tips: '아이와 함께라면 내용이 충격적일 수 있음', booking: false },
      { title: '노트르담 성당', location: '파리 코뮌 광장', desc: '프랑스 식민지 시대 건축물 — 빨간 벽돌 성당', cost: 0, booking: false },
    ],
    afternoonAttractions: [
      { title: '빈탄 시장 쇼핑', location: '빈탄 시장, 호치민', desc: '베트남 최대 재래시장 — 의류·식품·기념품', cost: 0, tips: '에어컨 없음. 이른 아침이나 저녁 방문 추천', booking: false },
      { title: '메콩강 당일 투어', location: '호치민 → 메콩강', desc: '쪽배로 수상 마을 탐방 · 코코넛 사탕·과일 맛보기', cost: 500000, tips: '8시간 소요 투어 — 하루 온전히 사용', booking: true },
    ],
    eveningAttractions: [
      { title: 'Bui Vien 워킹스트리트', location: '부이비엔 거리', desc: '베트남 최대 외국인 거리 — 밤새 음악과 맥주', cost: 0, booking: false },
      { title: '루프탑 바', location: 'Chill Sky Bar, 26층', desc: '호치민 야경을 360도로 감상하는 루프탑 칵테일 바', cost: 300000, tips: '드레스 코드 있음 — 반바지/슬리퍼 입장 불가', booking: true },
    ],
    breakfasts: [
      { title: '반미 & 커피', location: 'Banh Mi 37 Nguyen Trai', desc: '호치민 인기 반미 맛집', cost: 40000 },
      { title: '껌떰 (Cơm Tấm)', location: 'Com Tam Ba Ghien', desc: '깨진 쌀밥 위에 구운 돼지고기 — 호치민 국민 아침식사', cost: 60000 },
    ],
    lunches: [
      { title: '분보남보', location: 'Bun Bo Nam Bo', desc: '달콤짭짤한 소스로 비벼 먹는 쌀국수 — 남부 스타일', cost: 70000 },
      { title: '수프 & 럼볼', location: 'Quan Ut Ut BBQ', desc: '호치민 최고 인기 BBQ 레스토랑', cost: 350000, booking: true },
    ],
    dinners: [
      { title: '씨푸드 디너', location: 'Nha Hang Ngon', desc: '오픈 에어 정원 레스토랑에서 즐기는 베트남 요리', cost: 400000 },
      { title: '파인 다이닝', location: 'Anan Saigon', desc: 'Michelin Bib Gourmand 선정 베트남 퓨전 레스토랑', cost: 700000, booking: true },
    ],
    transports: [
      { title: '그랩 택시', location: '호치민 시내', desc: '가장 편리한 이동 수단', cost: 100000 },
      { title: '버스 투어', location: '시내 주요 명소', desc: '오픈탑 버스로 주요 명소 순환 — 1일 패스', cost: 200000 },
    ],
    insights: [
      '낮 12~15시는 너무 더우니 실내 관광 추천',
      '메콩강 투어는 반드시 사전 예약 필수 (성수기 매진)',
      '현지 그랩 앱은 반드시 설치 — 택시보다 훨씬 저렴',
    ],
    warnings: [
      '⚠️ 길거리 음식 위생 주의 — 조리한지 오래된 것은 피하세요',
      '⚠️ 소매치기 주의 — 가방은 앞으로, 핸드폰은 노출 자제',
      '⚠️ 낮 최고 기온 35°C 이상 — 선크림·모자 필수',
    ],
    budgetPerDay: { budget: 320000, medium: 650000, luxury: 1300000 },
  },
  '푸꾸옥': {
    cover: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=800',
    weather: ['맑고 화창 30°C ☀️', '맑음 29°C ☀️ — 스노클링 최적', '바람 조금 28°C 🌤', '맑음 31°C ☀️', '소나기 단시간 27°C 🌦'],
    dayThemes: ['도착 & 북부 해변', '빈원더스 테마파크', '스노클링 & 남부 해변', '후추 농장 & 사원', '자유 시간 & 출발'],
    morningAttractions: [
      { title: '사오 해변 (Sao Beach)', location: '푸꾸옥 남부', desc: '새하얀 모래와 투명한 물 — 베트남 최고 해변 중 하나', cost: 0, img: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=600', booking: false },
      { title: '빈원더스 테마파크', location: '혼텀 섬, 푸꾸옥', desc: '동남아 최대 테마파크 — 수상 놀이기구 & 놀이공원', cost: 900000, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', tips: '오전 9시 오픈 — 개장 시간에 도착이 최고', booking: true },
      { title: '스노클링 투어', location: '안터이 군도', desc: '총 15개 섬 주변 산호초 스노클링 — 열대어 가득', cost: 500000, tips: '4시간 코스. 1~4월이 시야 최고', booking: true },
    ],
    afternoonAttractions: [
      { title: '후추 농장 투어', location: '끄엉안 후추 농장', desc: '세계 최고 품질 푸꾸옥 후추 직접 보고 구매', cost: 50000, booking: false },
      { title: '즈엉동 야시장', location: '즈엉동 야시장', desc: '푸꾸옥 중심 야시장 — 구운 해산물·과일·기념품', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: '선셋 비치 칵테일', location: '롱 비치 선셋 포인트', desc: '수평선 너머 붉게 물드는 일몰을 보며 칵테일 한 잔', cost: 150000, booking: false },
      { title: '해산물 바베큐 디너', location: '즈엉동 야시장', desc: '직접 골라 직화로 구워주는 싱싱한 해산물', cost: 400000, booking: false },
    ],
    breakfasts: [
      { title: '반미 & 열대 과일', location: '숙소 주변', desc: '신선한 열대 과일 플래터로 시작하는 아침', cost: 50000 },
      { title: '해변 조식', location: '비치 사이드 카페', desc: '파도 소리 들으며 즐기는 에그 베네딕트', cost: 120000 },
    ],
    lunches: [
      { title: '게살 볶음밥 (Cơm Ghẹ)', location: 'Cua Bien Restaurant', desc: '게살 듬뿍 볶음밥 — 푸꾸옥 특선', cost: 120000 },
      { title: '쌀국수 & 반쎄오', location: '즈엉동 현지 식당', desc: '현지인 가격의 진짜 베트남 음식', cost: 70000 },
    ],
    dinners: [
      { title: '해산물 레스토랑', location: 'Ganesh Indian & Seafood', desc: '랍스터·새우·오징어 등 직화 구이', cost: 600000 },
      { title: '리조트 디너', location: '숙소 내 레스토랑', desc: '바다 전망 테라스에서 즐기는 파인 다이닝', cost: 800000, booking: true },
    ],
    transports: [
      { title: '전동 스쿠터 렌트', location: '즈엉동 시내', desc: '섬 전체 자유 탐방 — 하루 180,000₫', cost: 180000 },
      { title: '그랩 택시', location: '즈엉동 ~ 공항', desc: '공항~시내 픽업', cost: 120000 },
    ],
    insights: [
      '11월~4월이 건기 — 우기(5~10월)에는 스노클링 시야 나쁨',
      '빈원더스 입장권은 온라인 구매 시 할인 있음',
      '즈엉동 야시장 영업 시간: 18:00~22:00',
    ],
    warnings: [
      '⚠️ 산호초 보호 위해 산호 밟기 금지',
      '⚠️ 수상 레저 시 구명조끼 반드시 착용',
      '⚠️ 우기엔 스노클링 투어가 취소될 수 있으니 일정 여유 두기',
    ],
    budgetPerDay: { budget: 350000, medium: 700000, luxury: 1500000 },
  },
  '하롱베이': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['맑음 26°C ☀️ — 크루즈 최적', '연무 낀 24°C 🌫 — 신비로운 분위기', '맑음 27°C ☀️', '바람 조금 25°C 🌤', '맑음 26°C ☀️'],
    dayThemes: ['하노이 출발 → 하롱베이 크루즈 탑승', '카약 & 동굴 탐험', '티탑 섬 & 진주 농장', '크루즈 귀항 & 하노이 복귀'],
    morningAttractions: [
      { title: '하롱베이 크루즈 탑승', location: '하노이 → 바이차이 항구', desc: '버스로 4시간 이동 후 크루즈 탑승 — 하롱베이 잔잔한 바다 속으로', cost: 1500000, img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600', tips: '최소 3성급 크루즈 선택 권장', booking: true },
      { title: '쑹솟 동굴 탐험', location: '하롱베이 쑹솟 동굴', desc: '하롱베이 최대 동굴 — 종유석 사이로 환상적인 빛', cost: 0, tips: '크루즈 포함 액티비티', booking: false },
      { title: '카약 투어', location: '하롱베이 몽고이 만', desc: '직접 노 저어 절벽 사이를 누비는 짜릿한 체험', cost: 200000, booking: false },
    ],
    afternoonAttractions: [
      { title: '티탑 섬 & 수영', location: '티탑 섬, 하롱베이', desc: '계단 올라 전망대에서 하롱베이 파노라마 뷰 · 해변 수영', cost: 50000, booking: false },
      { title: '진주 농장 방문', location: '하롱베이 진주 섬', desc: '진주 양식 과정 직접 보고 기념품 구매', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: '크루즈 판타지 디너', location: '크루즈 레스토랑 데크', desc: '하롱베이 야경 속 4코스 씨푸드 디너', cost: 0, tips: '크루즈 포함', booking: false },
      { title: '오징어 낚시', location: '크루즈 갑판', desc: '밤 9시 이후 갑판에서 갑오징어 낚시 체험', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: '크루즈 조식 뷔페', location: '크루즈 다이닝룸', desc: '바다 위에서 즐기는 아침 식사 — 죽·쌀국수·에그 스테이션', cost: 0 },
    ],
    lunches: [
      { title: '크루즈 런치', location: '크루즈 갑판', desc: '하롱베이 전경 보며 즐기는 5가지 베트남 요리 코스', cost: 0 },
    ],
    dinners: [
      { title: '크루즈 씨푸드 디너', location: '크루즈 레스토랑', desc: '새우·조개·생선 구이 — 갓 잡은 신선함', cost: 0 },
    ],
    transports: [
      { title: '하노이 → 하롱베이 버스', location: '미딩 버스터미널', desc: '4시간 이동. 크루즈 패키지 포함 여부 확인', cost: 300000, booking: true },
    ],
    insights: [
      '3~5월, 9~11월이 날씨 최적 — 여름 태풍 시즌 피하기',
      '크루즈 패키지는 항상 포함 사항 꼼꼼히 비교',
      '카약은 무료 제공하는 크루즈 선택 권장',
    ],
    warnings: [
      '⚠️ 여름(6~8월) 태풍으로 투어 취소될 수 있음',
      '⚠️ 저가 크루즈는 시설 및 음식 질이 낮을 수 있음',
      '⚠️ 선상 멀미약 미리 준비',
    ],
    budgetPerDay: { budget: 500000, medium: 900000, luxury: 2000000 },
  },
  '사파': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['서늘 15°C 🌥 — 트레킹 최적', '안개 낀 12°C 🌫 — 신비로운 계단식 논', '맑음 18°C ☀️', '비 올 수 있음 13°C 🌧 — 방수 재킷 필수', '서늘 14°C 🌤'],
    dayThemes: ['사파 도착 & 타반 마을', '판시판 정상 정복', '이 리엥 마을 트레킹', '소수민족 마을 체험', '귀환'],
    morningAttractions: [
      { title: '판시판 케이블카', location: '판시판 뷰포인트', desc: '인도차이나 최고봉(3143m) — 케이블카로 쉽게 정상까지', cost: 700000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: '구름 걷히는 오전 7~10시가 최고 시야', booking: true },
      { title: '타반 마을 트레킹', location: '타반 (Ta Van) 마을', desc: '계단식 논밭 사이를 걷는 4시간 트레킹 코스', cost: 200000, tips: '가이드 동행 추천 — 길이 복잡함', booking: true },
    ],
    afternoonAttractions: [
      { title: '흐몽족 마켓', location: '사파 재래시장', desc: '소수민족 전통 의상과 수공예품 쇼핑', cost: 0, booking: false },
      { title: '타오 자연 폭포', location: '사파 타오 폭포', desc: '산속 청정 폭포 — 수영 가능', cost: 20000, booking: false },
    ],
    eveningAttractions: [
      { title: '홈스테이 저녁식사', location: '흐몽족 홈스테이', desc: '소수민족 가정에서 전통 요리 체험 — 진짜 사파의 맛', cost: 200000, booking: true },
    ],
    breakfasts: [
      { title: '사파 계란빵', location: '사파 시내 골목', desc: '화덕에 구운 따끈한 계란빵 — 2,000₫', cost: 20000 },
      { title: '쌀죽 (Cháo)', location: '현지 식당', desc: '산속 아침 — 따뜻한 쌀죽으로 몸 녹이기', cost: 40000 },
    ],
    lunches: [
      { title: '트레킹 도시락', location: '야외 (가이드 준비)', desc: '트레킹 코스 중 쉬어가며 먹는 현지 도시락', cost: 100000 },
    ],
    dinners: [
      { title: '흑돼지 바베큐', location: '사파 전통 식당', desc: '사파 흑돼지 구이 — 이 지역 특산 요리', cost: 250000 },
    ],
    transports: [
      { title: '하노이 → 사파 야간열차', location: '하노이 기차역', desc: '8시간 야간 침대열차 — 이동하며 잠자기', cost: 400000, booking: true },
    ],
    insights: [
      '9~11월 황금기 — 황금빛 계단식 논 사진 최고',
      '판시판은 오전 일찍 출발해야 구름 없는 전망 가능',
      '레인코트/방수 재킷 반드시 지참',
    ],
    warnings: [
      '⚠️ 트레킹 시 미끄러운 진흙길 주의 — 등산화 필수',
      '⚠️ 겨울(12~2월) 기온 0°C 이하 가능 — 방한 준비',
      '⚠️ 고산증 주의 (3143m) — 물 충분히 마시기',
    ],
    budgetPerDay: { budget: 280000, medium: 500000, luxury: 900000 },
  },
  '나트랑': {
    cover: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
    weather: ['맑음 32°C ☀️ — 비치 시즌 최고', '맑음 31°C ☀️', '바람 조금 30°C 🌤', '맑음 33°C ☀️', '소나기 단시간 29°C 🌦'],
    dayThemes: ['나트랑 해변 & 머드 스파', '섬 호핑 투어', '포나가르 탑 & 시내', '빈펄 랜드 & 수족관', '자유 시간 & 출발'],
    morningAttractions: [
      { title: '나트랑 비치', location: '나트랑 시내 해변', desc: '6km 황금 모래사장 — 선베드에서 여유로운 시간', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: '섬 호핑 투어 (4개 섬)', location: '나트랑 항구', desc: '모트 섬·대나무 섬·문 섬을 보트로 하루 탐방', cost: 450000, tips: '스노클링 장비·점심 포함 여부 확인', booking: true },
      { title: '포나가르 참파 탑', location: '포나가르, 나트랑', desc: '2세기 참파 왕국 사원 — 나트랑 역사 탐방', cost: 22000, booking: false },
    ],
    afternoonAttractions: [
      { title: '달 머드 스파 (Thap Ba Mud Bath)', location: '나트랑 달 스파', desc: '화산 열기로 가득한 천연 머드탕 — 피부 미용에 최고', cost: 250000, tips: '주말은 매우 붐빔. 평일 오전 추천', booking: true },
      { title: '빈펄 랜드', location: '혼 나트레 섬', desc: '케이블카로 섬까지 이동 — 테마파크+워터파크+수족관', cost: 900000, booking: true },
    ],
    eveningAttractions: [
      { title: '나트랑 야시장', location: '레탄퉁 야시장', desc: '저녁 5시부터 열리는 야시장 — 해산물 직화 구이', cost: 0, booking: false },
      { title: '루프탑 바', location: '세일링 클럽 나트랑', desc: '해변에서 즐기는 칵테일과 라이브 음악', cost: 200000, booking: false },
    ],
    breakfasts: [
      { title: '반미 & 코코넛 커피', location: '나트랑 시내', desc: '코코넛 크림 위에 드립커피 — 나트랑 스타일', cost: 45000 },
      { title: '쌀국수 & 분보', location: '현지 식당', desc: '진한 육수의 분보 후에 — 본고장의 맛', cost: 55000 },
    ],
    lunches: [
      { title: '바다 뷰 시푸드', location: '해변가 레스토랑', desc: '파도 소리 들으며 먹는 새우·랍스터', cost: 350000 },
    ],
    dinners: [
      { title: '냄비 요리 (Lẩu) 디너', location: '나트랑 냄비 식당', desc: '각종 해산물·채소가 가득한 베트남 전골', cost: 300000 },
    ],
    transports: [
      { title: '시내 버스', location: '나트랑 시내', desc: '저렴한 시내 교통 — 에어컨 버스', cost: 20000 },
      { title: '그랩 택시', location: '나트랑 시내', desc: '편리한 이동', cost: 80000 },
    ],
    insights: [
      '1~8월 비치 시즌 — 9~12월은 우기',
      '섬 호핑 투어는 전날 예약 권장',
      '머드 스파는 평일 오전 10시 전이 가장 한산',
    ],
    warnings: [
      '⚠️ 해파리 주의 (7~9월) — 해변 경고 표지 확인',
      '⚠️ 섬 투어 보트: 최소 안전 기준 갖춘 업체 선택',
      '⚠️ 빈펄 랜드 하루 풀 코스 — 체력 안배 필요',
    ],
    budgetPerDay: { budget: 300000, medium: 620000, luxury: 1300000 },
  },
  '후에': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['흐림 27°C 🌥', '맑음 29°C ☀️', '소나기 가능 25°C 🌦', '맑음 28°C ☀️', '흐림 26°C 🌥'],
    dayThemes: ['후에 황성 & 궁궐 탐방', '왕릉 자전거 투어', '향강 보트 & 티엔무 파고다', '후에 왕실 음식 투어', '다낭 이동'],
    morningAttractions: [
      { title: '후에 황성(Citadel)', location: '후에 왕성, 베트남 중부', desc: '응우옌 왕조 마지막 수도 — 자금성의 베트남 버전', cost: 200000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: '오디오 가이드 렌트 추천 (역사 설명)', booking: false },
      { title: '민망 왕릉', location: '후에 남부 12km', desc: '고요하고 웅장한 황제 무덤 — 황성과 연계 투어', cost: 150000, booking: false },
      { title: '티엔무 파고다', location: '향강 서쪽', desc: '7층 탑이 향강을 굽어보는 후에 상징 불교 사원', cost: 0, tips: '향강 보트로 접근하면 더욱 운치 있음', booking: false },
    ],
    afternoonAttractions: [
      { title: '자전거 왕릉 투어', location: '후에 교외', desc: '자전거로 카이딘·민망·뚜득 왕릉 순례 — 반나절', cost: 350000, booking: true },
      { title: '향강 선셋 보트', location: '향강 선착장', desc: '석양이 물드는 향강 위 1시간 보트 크루즈', cost: 150000, booking: false },
    ],
    eveningAttractions: [
      { title: '후에 나이트마켓', location: '쩐훙다오 거리', desc: '매일 저녁 열리는 야시장 — 길거리 음식·수공예품', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: '반 꾸온 후에', location: '현지 식당', desc: '후에 스타일 쌀 크레이프 — 새우크림 소스', cost: 50000 },
      { title: '반 베오 & 반 남', location: 'Quan Banh Beo Ba Cu', desc: '후에 전통 소형 떡 요리 세트 — 한 끼에 여러 전통 음식', cost: 60000 },
    ],
    lunches: [
      { title: '분보후에 (Bún Bò Huế)', location: 'Bun Bo Hue O Hen', desc: '후에 원조 쌀국수 — 매운 소고기 국물이 기가 막힘', cost: 60000, tips: '하노이·호치민 분보와 다른 진짜 원조 맛' },
    ],
    dinners: [
      { title: '왕실 코스 디너 (Royal Cuisine)', location: 'Y Thao Garden Restaurant', desc: '응우옌 왕조 5대 황제의 요리 재현 — 공연과 함께', cost: 600000, tips: '사전 예약 필수. 전통 의상 착용 가능', booking: true },
      { title: '까리 (Cà Ri Gà) 저녁', location: '현지 식당', desc: '코코넛 밀크 치킨 카레 — 후에 스타일', cost: 100000 },
    ],
    transports: [
      { title: '시클로 (Cyclo) 투어', location: '후에 시내', desc: '시클로 타고 구시가 골목 누비기', cost: 100000 },
      { title: '자전거 렌트', location: '숙소 주변', desc: '후에는 자전거로 이동하기 좋은 도시', cost: 60000 },
    ],
    insights: [
      '후에 황성은 1993년 유네스코 세계문화유산 등재',
      '분보후에는 원조 후에에서만 맛볼 수 있는 진짜 맛',
      '왕릉들은 서로 가깝기 때문에 자전거로 하루에 3개 가능',
    ],
    warnings: [
      '⚠️ 10~11월은 우기 — 우산 필수',
      '⚠️ 황성 내 일부 복원 중인 구역 있음 — 현장에서 확인',
      '⚠️ 왕릉 방문 시 단정한 복장 필요 (민소매·반바지 지양)',
    ],
    budgetPerDay: { budget: 250000, medium: 480000, luxury: 950000 },
  },
};


const DEST_ALIASES: Record<string, DestKey> = {
  '다낭': '다낭', 'da nang': '다낭', '다낭,': '다낭', '\u0111\u00e0 n\u1eb5ng': '다낭', 'da n\u1eb5ng': '다낭',
  '호이안': '호이안', 'hoi an': '호이안', 'h\u1ed9i an': '호이안',
  '하노이': '하노이', 'hanoi': '하노이', 'ha noi': '하노이', 'h\u00e0 n\u1ed9i': '하노이',
  '호치민': '호치민', 'ho chi minh': '호치민', 'saigon': '호치민', 'hcmc': '호치민', 'ho chi minh city': '호치민',
  '푸꾸옥': '푸꾸옥', 'phu quoc': '푸꾸옥', 'ph\u00fa qu\u1ed1c': '푸꾸옥',
  '하롱베이': '하롱베이', 'ha long bay': '하롱베이', 'halong': '하롱베이', 'ha long': '하롱베이', 'h\u1ea1 long': '하롱베이',
  '사파': '사파', 'sapa': '사파', 'sa pa': '사파',
  '나트랑': '나트랑', 'nha trang': '나트랑', 'nhatrang': '나트랑',
  '후에': '후에', 'hue': '후에', 'hu\u1ebf': '후에',
};

const DEST_PROFILES_EN: Record<DestKey, DestinationProfile> = {
  '다낭': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Sunny 30°C ☀️ — Apply sunscreen', 'Partly cloudy 28°C 🌤 — Great for outdoors', 'Sunny 31°C ☀️ — Afternoon beach is best', 'Possible showers 27°C 🌦 — Bring an umbrella', 'Sunny 29°C ☀️'],
    dayThemes: ['Arrival & Beach Relaxation', 'Ba Na Hills & Golden Bridge', 'Hoi An Ancient Town', 'Marble Mountain & Shopping', 'Son Tra & Departure'],
    morningAttractions: [
      { title: 'My Khe Beach Stroll', location: 'My Khe Beach, Da Nang', desc: 'One of Asia\'s top beaches — stroll along the shore in the cool morning breeze', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: 'Ba Na Hills Cable Car', location: 'Ba Na Hills National Park', desc: 'World\'s longest cable car to the summit — the iconic Golden Bridge awaits at the top', cost: 750000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: 'Arrive before 9am to skip the queue', booking: true },
      { title: 'Marble Mountain (Ngu Hanh Son)', location: '10km south of Da Nang', desc: 'Climb the highest limestone peak and explore ancient cave Buddhist temples', cost: 40000, img: 'https://images.unsplash.com/photo-1614093302611-8eaddbfd1d26?w=600', tips: 'Elevator available for an extra ₫15,000', booking: false },
    ],
    afternoonAttractions: [
      { title: 'Han Market Shopping', location: 'Han Market, Da Nang city center', desc: 'Covered traditional market packed with local food, clothing, and souvenirs', cost: 0, booking: false },
      { title: 'Golden Bridge (Cau Vang)', location: 'Ba Na Hills summit', desc: 'The famous bridge "held by giant stone hands" — a must for photos', cost: 0, tips: 'Visit on weekdays to avoid crowds', booking: false },
      { title: 'Dragon Bridge Night View', location: 'Dragon Bridge, Han River', desc: 'Illuminated dragon bridge over the Han River — fire show on weekends', cost: 0, tips: 'Fire & water show every Saturday and Sunday at 9pm', booking: false },
    ],
    eveningAttractions: [
      { title: 'Han River Night Cruise', location: 'Han River Pier, Da Nang', desc: '1-hour boat cruise admiring Da Nang\'s sparkling skyline from the water', cost: 200000, booking: true },
      { title: 'Da Nang Night Market', location: 'Bach Dang Street', desc: 'Lively nightly market with street food stalls and souvenir shops', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi Breakfast', location: 'Banh Mi Phuong', desc: 'Da Nang\'s legendary banh mi — praised by Anthony Bourdain himself', cost: 35000, tips: 'Best visited 7–10am. Expect a short queue' },
      { title: 'Pho Breakfast', location: 'Pho Xua Restaurant', desc: 'Rich local beef noodle soup enjoyed by residents every morning', cost: 50000 },
      { title: 'Hotel Breakfast Buffet', location: 'Your hotel', desc: 'A relaxed start to the day at the hotel buffet', cost: 0, tips: 'Confirm if included in your booking' },
    ],
    lunches: [
      { title: 'Mi Quang (Da Nang Noodles)', location: 'Mi Quang 1A', desc: 'Da Nang\'s signature turmeric noodle dish with shrimp, pork and fresh herbs', cost: 60000, tips: 'Local favorite — no English menu, just point to order' },
      { title: 'Banh Xeo (Vietnamese Crispy Pancake)', location: 'Quan Com Hue Ba Cu', desc: 'Sizzling rice pancake stuffed with shrimp, pork and bean sprouts', cost: 70000 },
    ],
    dinners: [
      { title: 'Seafood BBQ Dinner', location: 'Be Man Quan Seafood', desc: 'Grill your own fresh seafood right at the table — a quintessential Da Nang experience', cost: 350000, tips: 'Fills up fast from 6pm. Reservation recommended' },
      { title: 'Rooftop Dining', location: 'Sky 36 Restaurant', desc: 'Da Nang panorama from the 36th floor — Western and Asian fusion menu', cost: 500000, booking: true },
    ],
    transports: [
      { title: 'Grab Taxi', location: 'Da Nang city', desc: 'Easiest and most affordable way to get around — app required', cost: 80000 },
      { title: 'Electric Scooter Rental', location: 'My Khe Beach rental shops', desc: 'Explore the city freely all day — no international licence needed (local rules)', cost: 150000 },
    ],
    insights: [
      'April–May is Da Nang\'s dry season — the best time to visit',
      'Golden Bridge is least crowded on weekday mornings',
      'My Khe Beach has free public areas and separate paid sunbed zones',
      'Bring cash VND — smaller restaurants usually do not accept cards',
    ],
    warnings: [
      '⚠️ Ba Na Hills: buy tickets online to save ~10% vs. buying on-site',
      '⚠️ Dragon Bridge fire shows only run on Saturdays and Sundays',
      '⚠️ If renting a scooter, carry an international driving permit',
    ],
    budgetPerDay: { budget: 300000, medium: 600000, luxury: 1200000 },
  },
  '호이안': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['Sunny 29°C ☀️ — Perfect for exploring the ancient town', 'Overcast 27°C 🌥 — Still great outdoors', 'Sunny 30°C ☀️', 'Possible rain 26°C 🌦', 'Sunny 28°C ☀️'],
    dayThemes: ['Ancient Town Exploration', 'Thu Bon River & Lantern Village', 'Cooking Class & Countryside Cycling', 'Beach Day & Shopping', 'Morning Market & Farewell'],
    morningAttractions: [
      { title: 'Hoi An Ancient Town', location: 'Hoi An Old Town', desc: 'UNESCO World Heritage Site — your ticket grants access to 5 historic landmarks', cost: 120000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Arrive just after sunrise (7–8am) to beat the tourist crowds', booking: false },
      { title: 'Thu Bon River Boat Tour', location: 'Thu Bon River Pier', desc: '30-minute scenic boat ride with lovely views of the old town waterfront', cost: 150000, booking: true },
      { title: 'Phoc Kien Assembly Hall', location: 'Hoi An Old Town', desc: 'Beautiful 200-year-old Chinese assembly hall and temple — included with town entry', cost: 0, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Vietnamese Cooking Class', location: 'Miss Ly Cooking Class', desc: 'Visit the local market to buy ingredients then cook 3 traditional dishes', cost: 450000, img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600', tips: 'Around 4 hours. Must pre-book in advance', booking: true },
      { title: 'Rice Paddy Cycling Tour', location: 'Hoi An countryside', desc: 'Pedal through scenic rice paddies and traditional villages — half-day activity', cost: 200000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Night Market & Lantern Floating', location: 'Thu Bon River, Hoi An', desc: 'Float a glowing lantern on the river surrounded by hundreds of colourful lights', cost: 50000, tips: 'Lanterns cost ₫25,000 each at riverside stalls', booking: false },
      { title: 'Hoi An Night Market', location: 'Nguyen Hoang Street', desc: 'Handcrafts, keepsakes, and street food among the old town\'s illuminated streets', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Cao Lau Noodles', location: 'Thanh Cao Lau', desc: 'Hoi An\'s famous thick noodle dish topped with pork slices and crispy crackers', cost: 55000 },
      { title: 'Banh Mi', location: 'Banh Mi Phuong Hoi An', desc: 'The legendary banh mi shop visited by Obama — world-famous for good reason', cost: 35000, tips: 'Expect a short queue between 7–9am' },
    ],
    lunches: [
      { title: 'White Rose Dumplings & Banh Vac', location: 'White Rose Restaurant', desc: 'Delicate shrimp dumplings unique to Hoi An — a dish you cannot find elsewhere', cost: 80000 },
      { title: 'Pho & Fresh Spring Rolls', location: 'Mango Mango Restaurant', desc: 'Authentic Vietnamese food with beautiful views of the old town', cost: 150000 },
    ],
    dinners: [
      { title: 'Riverside Seafood Dinner', location: 'Mango Rooms', desc: 'Inventive Vietnamese fusion cuisine on a terrace overlooking the Thu Bon River', cost: 400000, booking: true },
      { title: 'Traditional Hoi An Set Course', location: 'Morning Glory Restaurant', desc: 'The best local dishes served as a tasting set — ideal introduction to Hoi An cuisine', cost: 350000 },
    ],
    transports: [
      { title: 'Bicycle Rental', location: 'Old town rental shops', desc: 'Best way to explore the car-free ancient town — full day for ₫50,000', cost: 50000 },
      { title: 'Cyclo (Pedicab) Tour', location: 'Hoi An Old Town', desc: 'A leisurely pedicab ride around narrow old-town streets and alleyways', cost: 100000 },
    ],
    insights: [
      'On the 14th night of the lunar month, the town switches off electric lights — only lanterns illuminate the streets',
      'Order tailor-made clothes on day one — typically ready within 24 hours',
      'Negotiate group prices for Thu Bon River boat tours',
    ],
    warnings: [
      '⚠️ Motorcycles are banned inside the old town from 12:00–17:00',
      '⚠️ Compare prices at multiple tailors before placing an order',
      '⚠️ River levels can rise sharply during the rainy season',
    ],
    budgetPerDay: { budget: 250000, medium: 500000, luxury: 1000000 },
  },
  '하노이': {
    cover: 'https://images.unsplash.com/photo-1509510983883-40b4c9e3742e?w=800',
    weather: ['Cool 23°C 🌥 — Perfect travel weather', 'Overcast 21°C — Bring a light jacket', 'Sunny 25°C ☀️', 'Misty 22°C 🌫 — Atmospheric and moody', 'Sunny 24°C ☀️'],
    dayThemes: ['Old Quarter & Hoan Kiem Lake', 'Ho Chi Minh Mausoleum & Temples', 'Old Quarter Food Walking Tour', 'West Lake & Ethnology Museum', 'Last Coffee & Departure'],
    morningAttractions: [
      { title: 'Hoan Kiem Lake & Turtle Tower', location: 'Hoan Kiem, Hanoi', desc: 'Emerald lake at the heart of Hanoi with a 600-year-old temple on a tiny island', cost: 0, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', booking: false },
      { title: 'Ho Chi Minh Mausoleum', location: 'Ba Dinh Square, Hanoi', desc: 'Mausoleum of Vietnam\'s founding father — free entry, solemn atmosphere', cost: 0, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', tips: 'Open Tue–Thu 7:30–10:30am. No shorts or sleeveless tops allowed', booking: false },
      { title: 'Temple of Literature (Van Mieu)', location: 'Hanoi', desc: 'Founded in 1070 — Vietnam\'s first university and a stunning Confucian temple complex', cost: 30000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'The 36 Streets of the Old Quarter', location: 'Hanoi Old Quarter', desc: 'Each street historically specialised in a different craft — a fascinating living museum', cost: 0, tips: 'Bargain for 50–60% of the asking price — it\'s expected', booking: false },
      { title: 'Vietnam Museum of Ethnology', location: 'Western Hanoi', desc: 'Fascinating outdoor exhibitions showcasing traditional houses of 54 ethnic groups', cost: 40000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Water Puppet Show', location: 'Thang Long Water Puppet Theatre', desc: '1,000-year tradition of water puppetry — a truly unique Vietnamese cultural experience', cost: 100000, tips: 'Arrive 30 min early — popular show. Pre-booking highly recommended', booking: true },
      { title: 'Ta Hien Street (Beer Street)', location: 'Ta Hien, Hanoi', desc: 'Hanoi\'s legendary beer street — 330ml draft beer for just ₫5,000', cost: 50000, booking: false },
    ],
    breakfasts: [
      { title: 'Pho Bo (Beef Pho)', location: 'Pho Bat Dan', desc: 'Legendary Hanoi pho since 1955 — rich broth worth every minute of the queue', cost: 60000, tips: 'Opens at 6am — go early so the broth does not run out' },
      { title: 'Banh Cuon (Steamed Rice Roll)', location: 'Banh Cuon Gia Truyen', desc: 'Silky rice crepes stuffed with pork, wood-ear mushroom and spring onion', cost: 50000 },
    ],
    lunches: [
      { title: 'Bun Cha (Grilled Pork Noodles)', location: 'Bun Cha Huong Lien', desc: 'The famous restaurant visited by Obama and Anthony Bourdain — Hanoi\'s national dish', cost: 70000, tips: 'Obama\'s visit photo is displayed on the 2nd floor', booking: false },
      { title: 'Nem Cuon & Spring Rolls', location: 'Quan An Ngon', desc: 'Traditional Hanoi dishes served in a beautiful open-air courtyard', cost: 200000 },
    ],
    dinners: [
      { title: 'Rooftop Restaurant', location: 'Summit Lounge, Sofitel Legend Metropole', desc: 'Hanoi panorama with refined French-Vietnamese fusion cuisine', cost: 800000, booking: true },
      { title: 'Cha Ca La Vong (Hanoi Grilled Fish)', location: 'Cha Ca La Vong Restaurant', desc: 'A 150-year dining institution — turmeric fish sizzled at the table with dill', cost: 300000 },
    ],
    transports: [
      { title: 'Cyclo Tour of the Old Quarter', location: 'Hanoi Old Quarter', desc: 'Relaxing pedicab ride through the winding lanes of the old quarter — 1 hour', cost: 150000, booking: false },
      { title: 'Grab Bike', location: 'Hanoi city', desc: 'Best way to beat Hanoi\'s notorious traffic — download the Grab app', cost: 30000 },
    ],
    insights: [
      'The Old Quarter is best explored slowly on foot',
      'Hoan Kiem Lake area becomes a pedestrian-only zone on weekend evenings',
      'Grab a numbered ticket before joining the queue at popular bun cha restaurants',
    ],
    warnings: [
      '⚠️ Ho Chi Minh Mausoleum is closed on Mondays and Fridays',
      '⚠️ Always negotiate in the Old Quarter — initial prices are always inflated',
      '⚠️ When crossing the street, walk slowly and steadily — motorbikes will weave around you',
    ],
    budgetPerDay: { budget: 280000, medium: 550000, luxury: 1100000 },
  },
  '호치민': {
    cover: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    weather: ['Hot sunny 34°C ☀️ — Drink plenty of water', 'Blazing hot 35°C ☀️', 'Possible showers 31°C 🌦', 'Sunny 33°C ☀️', 'Overcast 30°C 🌥'],
    dayThemes: ['French Colonial District Sightseeing', 'War History Tour', 'Cholon Chinatown & Ben Thanh Market', 'Mekong Delta Day Trip', 'Shopping & Departure'],
    morningAttractions: [
      { title: 'Reunification Palace', location: '3 Nam Ky Khoi Nghia, District 1', desc: 'Presidential palace preserved exactly as it appeared on Liberation Day, 1975', cost: 40000, img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600', booking: false },
      { title: 'War Remnants Museum', location: '28 Vo Van Tan, District 3', desc: 'Powerful and thought-provoking museum documenting the Vietnam War', cost: 40000, tips: 'Be aware: content is intense — not suitable for young children', booking: false },
      { title: 'Notre-Dame Cathedral Basilica', location: 'Paris Commune Square, District 1', desc: 'Iconic red brick cathedral built during the French colonial era', cost: 0, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Ben Thanh Market', location: 'Ben Thanh, HCMC', desc: 'Vietnam\'s most famous covered market — clothing, fresh food, and souvenirs in one place', cost: 0, tips: 'No air conditioning — visit early morning or late afternoon', booking: false },
      { title: 'Mekong Delta Day Tour', location: 'HCMC → Mekong Delta', desc: 'Drift through floating villages by sampan and taste fresh coconut sweets and tropical fruit', cost: 500000, tips: 'A full 8-hour day trip — book the day before in peak season', booking: true },
    ],
    eveningAttractions: [
      { title: 'Bui Vien Walking Street', location: 'Bui Vien Street, District 1', desc: 'Vietnam\'s liveliest expat street — pumping music, cold beer, and electric atmosphere all night', cost: 0, booking: false },
      { title: 'Rooftop Sky Bar', location: 'Chill Sky Bar, 26th floor', desc: '360° cocktail bar towering above Ho Chi Minh City\'s neon-lit skyline', cost: 300000, tips: 'Smart casual dress code — no flip flops or shorts allowed', booking: true },
    ],
    breakfasts: [
      { title: 'Banh Mi & Local Coffee', location: 'Banh Mi 37 Nguyen Trai', desc: 'Top-rated banh mi spot in HCMC — fresh, cheap, and delicious', cost: 40000 },
      { title: 'Com Tam (Broken Rice)', location: 'Com Tam Ba Ghien', desc: 'HCMC\'s beloved breakfast staple — broken rice topped with char-grilled pork', cost: 60000 },
    ],
    lunches: [
      { title: 'Bun Bo Nam Bo', location: 'Bun Bo Nam Bo Restaurant', desc: 'Cold beef noodles tossed in a savory-sweet Southern sauce — incredibly addictive', cost: 70000 },
      { title: 'Grilled Ribs & Craft Beer', location: 'Quan Ut Ut BBQ', desc: 'HCMC\'s most popular American-style BBQ restaurant', cost: 350000, booking: true },
    ],
    dinners: [
      { title: 'Open Garden Vietnamese Dinner', location: 'Nha Hang Ngon', desc: 'Open-air garden restaurant serving the full spectrum of Vietnamese classics', cost: 400000 },
      { title: 'Michelin-Recognised Vietnamese', location: 'Anan Saigon', desc: 'Michelin Bib Gourmand — inventive Vietnamese fusion cuisine', cost: 700000, booking: true },
    ],
    transports: [
      { title: 'Grab Taxi', location: 'HCMC city', desc: 'Most convenient transport option — far cheaper than regular metered taxis', cost: 100000 },
      { title: 'Open-Top Hop-On Hop-Off Bus', location: 'Key city landmarks', desc: 'Open-top double-decker bus covering major sights — 1-day pass', cost: 200000 },
    ],
    insights: [
      'Avoid being outside from 12–3pm — it is extremely hot. Plan indoor sightseeing for that window',
      'Mekong Delta tours must be pre-booked in peak season — they fill up fast',
      'Install the Grab app before you arrive — significantly cheaper than street taxis',
    ],
    warnings: [
      '⚠️ Motorbike bag-snatching is common — keep bags in front and phones out of sight',
      '⚠️ Street food hygiene: avoid dishes that have been sitting in the heat for a long time',
      '⚠️ Daytime temperatures regularly exceed 35°C — sunscreen and a hat are essential',
    ],
    budgetPerDay: { budget: 320000, medium: 650000, luxury: 1300000 },
  },
  '푸꾸옥': {
    cover: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=800',
    weather: ['Clear sunny 30°C ☀️', 'Sunny 29°C ☀️ — Excellent snorkelling conditions', 'Light breeze 28°C 🌤', 'Sunny 31°C ☀️', 'Brief shower 27°C 🌦'],
    dayThemes: ['Arrival & North Beach Exploration', 'VinWonders Theme Park Day', 'Island Snorkelling & South Beaches', 'Pepper Farm & Temple Tour', 'Leisure Morning & Departure'],
    morningAttractions: [
      { title: 'Sao Beach', location: 'Southern Phu Quoc', desc: 'Powdery white sand and crystal-clear turquoise water — ranked among Vietnam\'s finest beaches', cost: 0, img: 'https://images.unsplash.com/photo-1540202404-a2f29b0a8f96?w=600', booking: false },
      { title: 'VinWonders Theme Park', location: 'Hon Tre Island, Phu Quoc', desc: 'Southeast Asia\'s biggest theme park — exhilarating water rides and roller coasters', cost: 900000, img: 'https://images.unsplash.com/photo-1555351179-11c9680c497b?w=600', tips: 'Get there at opening (9am) for the shortest queues of the day', booking: true },
      { title: 'An Thoi Islands Snorkelling', location: 'An Thoi Archipelago', desc: 'Boat tour visiting 15 islands with stunning coral reefs and tropical fish', cost: 500000, tips: '4-hour trip. January–April offers the best underwater visibility', booking: true },
    ],
    afternoonAttractions: [
      { title: 'Phu Quoc Pepper Farm', location: 'Kien Giang Pepper Farm', desc: 'See the world\'s most prized pepper in its natural environment — and buy some to take home', cost: 50000, booking: false },
      { title: 'Duong Dong Night Market', location: 'Duong Dong, Phu Quoc', desc: 'Phu Quoc\'s main market — grilled seafood, exotic fruits, and handmade souvenirs', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: 'Sunset Cocktail on Long Beach', location: 'Long Beach, Phu Quoc', desc: 'Watch the sky blaze crimson over the sea while sipping a chilled island cocktail', cost: 150000, booking: false },
      { title: 'Night Market Seafood BBQ', location: 'Duong Dong Night Market', desc: 'Choose live seafood from the display and have it grilled on the spot — astonishingly fresh', cost: 400000, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi & Tropical Fruit Plate', location: 'Near your hotel', desc: 'Start the day with a freshly made baguette sandwich and a colourful tropical fruit platter', cost: 50000 },
      { title: 'Beachside Breakfast', location: 'Beachside café', desc: 'Eggs Benedict served to the soundtrack of gentle waves on the shore', cost: 120000 },
    ],
    lunches: [
      { title: 'Crab Fried Rice (Com Ghe)', location: 'Cua Bien Restaurant', desc: 'Generous heaping of Phu Quoc\'s signature crab fried rice — local favourite', cost: 120000 },
      { title: 'Pho & Banh Xeo', location: 'Local restaurant, Duong Dong', desc: 'Good old Vietnamese food at real local prices', cost: 70000 },
    ],
    dinners: [
      { title: 'Lobster & Seafood Grill', location: 'Ganesh Seafood Restaurant', desc: 'Live lobster, tiger prawns, and squid — grilled to order, outrageously fresh', cost: 600000 },
      { title: 'Resort Fine Dining', location: 'Resort beachfront restaurant', desc: 'Sit on a sea-view terrace and dine in style as the tropical sun sets', cost: 800000, booking: true },
    ],
    transports: [
      { title: 'Electric Scooter Rental', location: 'Duong Dong town center', desc: 'Best way to freely explore the island — available all day for ₫180,000', cost: 180000 },
      { title: 'Grab Taxi', location: 'Duong Dong to Airport', desc: 'Airport transfers and inter-town trips', cost: 120000 },
    ],
    insights: [
      'November–April is the dry season — rainy season (May–Oct) brings poor snorkelling visibility',
      'VinWonders tickets can be bought online at a discount',
      'Duong Dong Night Market operates 6pm–10pm daily',
    ],
    warnings: [
      '⚠️ Never step on coral — it is a protected marine ecosystem',
      '⚠️ Always wear a life jacket during water sports activities',
      '⚠️ Snorkelling tours may be cancelled during the rainy season — build flexibility into your schedule',
    ],
    budgetPerDay: { budget: 350000, medium: 700000, luxury: 1500000 },
  },
  '하롱베이': {
    cover: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    weather: ['Clear 26°C ☀️ — Ideal cruising weather', 'Misty 24°C 🌫 — Hauntingly beautiful', 'Clear 27°C ☀️', 'Light wind 25°C 🌤', 'Clear 26°C ☀️'],
    dayThemes: ['Hanoi Departure & Ha Long Boarding', 'Kayaking & Cave Adventure', 'Ti Top Island & Pearl Farm', 'Sunrise Cruise & Return to Hanoi'],
    morningAttractions: [
      { title: 'Ha Long Bay Cruise Boarding', location: 'Hanoi → Bai Chay Port', desc: '4-hour bus transfer, then board your cruise ship and sail into Ha Long\'s limestone seascape', cost: 1500000, img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600', tips: 'Choose a minimum 3-star cruise for a comfortable experience', booking: true },
      { title: 'Sung Sot Cave (Surprise Cave)', location: 'Ha Long Bay', desc: 'The bay\'s largest cave — dramatic stalactites lit up in vivid colours deep underground', cost: 0, tips: 'Included in cruise activity programme', booking: false },
      { title: 'Kayaking Through Limestone Cliffs', location: 'Luon Cave Area, Ha Long Bay', desc: 'Paddle your own kayak through narrow passages between towering limestone pillars', cost: 200000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Ti Top Island Hike & Swimming', location: 'Ti Top Island, Ha Long Bay', desc: 'Climb the steps to the summit viewpoint for a full panorama of the bay, then cool off swimming', cost: 50000, booking: false },
      { title: 'Pearl Farm Visit', location: 'Pearl Island, Ha Long Bay', desc: 'Watch the pearl cultivation process up close and browse the jewellery at the gift shop', cost: 0, booking: false },
    ],
    eveningAttractions: [
      { title: 'Cruise Seafood Dinner Under the Stars', location: 'Cruise dining deck', desc: 'Four-course seafood dinner surrounded by the silhouettes of Ha Long Bay at night', cost: 0, tips: 'Included in cruise package', booking: false },
      { title: 'Squid Fishing from the Deck', location: 'Cruise deck, Ha Long Bay', desc: 'Try catching squid from the boat deck after 9pm — a fun and memorable evening activity', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Cruise Breakfast Buffet', location: 'Cruise dining room', desc: 'Wake up to breakfast on the water — rice porridge, pho, fresh fruit, and an egg station', cost: 0 },
    ],
    lunches: [
      { title: 'Cruise Lunch on Deck', location: 'Cruise deck', desc: 'Five Vietnamese dishes enjoyed with panoramic views of Ha Long Bay', cost: 0 },
    ],
    dinners: [
      { title: 'Cruise Seafood Dinner', location: 'Cruise restaurant', desc: 'Freshly caught prawns, clams, and fish — grilled simply to let the quality speak for itself', cost: 0 },
    ],
    transports: [
      { title: 'Hanoi to Ha Long Bay Bus', location: 'My Dinh Bus Terminal, Hanoi', desc: '4-hour comfortable bus transfer. Check if your cruise package includes this transport', cost: 300000, booking: true },
    ],
    insights: [
      'March–May and September–November have the best weather conditions',
      'Always compare cruise packages carefully and check what\'s actually included',
      'Select a cruise that provides free kayaks — it greatly enhances the experience',
    ],
    warnings: [
      '⚠️ Summer typhoons (June–August) can cause tour cancellations',
      '⚠️ Budget cruises often have poor facilities and food — do your research',
      '⚠️ Pack seasickness tablets just in case',
    ],
    budgetPerDay: { budget: 500000, medium: 900000, luxury: 2000000 },
  },
  '사파': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Cool 15°C 🌥 — Perfect trekking conditions', 'Misty 12°C 🌫 — Magical terraced rice fields', 'Sunny 18°C ☀️', 'Possible rain 13°C 🌧 — Waterproof jacket essential', 'Cool 14°C 🌤'],
    dayThemes: ['Sapa Arrival & Ta Van Village', 'Fansipan Summit Conquest', 'Y Linh Ho Valley Trekking', 'Ethnic Minority Village Experience', 'Return to Hanoi'],
    morningAttractions: [
      { title: 'Fansipan Cable Car', location: 'Fansipan Viewpoint, Sapa', desc: 'Reach Indochina\'s highest peak (3,143m) by cable car — breathtaking panoramic views', cost: 700000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Best visibility before 10am before cloud cover builds up', booking: true },
      { title: 'Ta Van Village Trek', location: 'Ta Van Village, Sapa', desc: '4-hour guided trek through Muong Hoa Valley with spectacular terraced rice field scenery', cost: 200000, tips: 'A local guide is strongly recommended — the paths are complex', booking: true },
    ],
    afternoonAttractions: [
      { title: 'H\'mong Hill Tribe Market', location: 'Sapa traditional market', desc: 'Browse vibrant traditional costumes and handcrafted goods made by local ethnic minorities', cost: 0, booking: false },
      { title: 'Silver Waterfall (Thac Bac)', location: 'Sapa waterfall area', desc: 'A majestic mountain waterfall — swimming possible in the summer months', cost: 20000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Homestay Dinner Experience', location: 'H\'mong family homestay', desc: 'Share a traditional dinner with an ethnic minority household — the true spirit of Sapa', cost: 200000, booking: true },
    ],
    breakfasts: [
      { title: 'Sapa Egg Bread', location: 'Sapa town lanes', desc: 'Wood-fired egg bun from a street cart — a beloved local morning snack', cost: 20000 },
      { title: 'Rice Porridge (Chao)', location: 'Local restaurant', desc: 'Warming rice porridge to start a crisp mountain morning the right way', cost: 40000 },
    ],
    lunches: [
      { title: 'Trail Bento Box', location: 'Outdoors (prepared by guide)', desc: 'Home-packed lunch eaten amid stunning mountain scenery mid-trek', cost: 100000 },
    ],
    dinners: [
      { title: 'Black Pig BBQ', location: 'Traditional Sapa restaurant', desc: 'Sapa\'s famous black pig roast — a regional speciality that should not be missed', cost: 250000 },
    ],
    transports: [
      { title: 'Hanoi to Sapa Overnight Train', location: 'Hanoi Railway Station', desc: '8-hour sleeper train — travel and sleep simultaneously to save time', cost: 400000, booking: true },
    ],
    insights: [
      'September–November is golden season — terraced fields turn a breathtaking golden hue',
      'Head to Fansipan early to catch clear skies before the clouds roll in',
      'A full waterproof jacket and sturdy hiking boots are absolute essentials',
    ],
    warnings: [
      '⚠️ Trekking paths are steep and often muddy — proper hiking boots required',
      '⚠️ Winter temperatures (Dec–Feb) can drop below 0°C — come very well prepared',
      '⚠️ Altitude sickness can occur at 3,143m — stay hydrated and take it slowly',
    ],
    budgetPerDay: { budget: 280000, medium: 500000, luxury: 900000 },
  },
  '나트랑': {
    cover: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600',
    weather: ['Sunny 32°C ☀️ — Peak beach season', 'Sunny 31°C ☀️', 'Light sea breeze 30°C 🌤', 'Sunny 33°C ☀️', 'Brief shower 29°C 🌦'],
    dayThemes: ['Nha Trang Beach & Mud Spa', 'Island Hopping Adventure', 'Po Nagar Cham Towers & City Tour', 'VinPearl Land & Aquarium', 'Leisure Morning & Departure'],
    morningAttractions: [
      { title: 'Nha Trang City Beach', location: 'Nha Trang beachfront', desc: '6km of golden shoreline — rent a sunbed and swim in the warm clear sea', cost: 0, img: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600', booking: false },
      { title: 'Island Hopping Tour (4 Islands)', location: 'Nha Trang Harbour', desc: 'Fun boat day visiting Mot Island, Bamboo Island, and Moon Island with snorkelling', cost: 450000, tips: 'Confirm whether snorkel gear and lunch are included in the price', booking: true },
      { title: 'Po Nagar Cham Towers', location: 'Po Nagar, Nha Trang', desc: '2nd-century Cham Kingdom temple complex — an extraordinary glimpse of ancient history', cost: 22000, booking: false },
    ],
    afternoonAttractions: [
      { title: 'Thap Ba Mud Bath (I-Resort)', location: 'Thap Ba Hot Springs, Nha Trang', desc: 'Soak in natural volcanic mineral mud — great for skin health and deeply relaxing', cost: 250000, tips: 'Weekday mornings are the least crowded time to visit', booking: true },
      { title: 'VinPearl Land', location: 'Hon Tre Island, Nha Trang', desc: 'Take the cable car to VinPearl Island for a full day of theme park, water park, and aquarium', cost: 900000, booking: true },
    ],
    eveningAttractions: [
      { title: 'Nha Trang Night Market', location: 'Le Thanh Tong Night Market', desc: 'Local evening market from 5pm — grilled seafood, tropical fruit, and snacks', cost: 0, booking: false },
      { title: 'Sailing Club Rooftop Bar', location: 'Sailing Club, Nha Trang Beach', desc: 'Cocktails and live music right on the beach under the stars', cost: 200000, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Mi & Coconut Coffee', location: 'Nha Trang city', desc: 'Vietnamese drip coffee poured over silky coconut cream — the Nha Trang way to start the day', cost: 45000 },
      { title: 'Pho & Bun Bo', location: 'Local restaurant', desc: 'Hearty Hue-style beef noodle soup — a robust and satisfying morning fuel', cost: 55000 },
    ],
    lunches: [
      { title: 'Sea-View Seafood Lunch', location: 'Beachside restaurant', desc: 'Grilled tiger prawns and lobster enjoyed with an ocean backdrop', cost: 350000 },
    ],
    dinners: [
      { title: 'Vietnamese Hot Pot (Lau Hai San)', location: 'Nha Trang harbour restaurant', desc: 'Communal bubbling broth loaded with fresh seafood and crisp vegetables — perfect for groups', cost: 300000 },
    ],
    transports: [
      { title: 'Air-Conditioned City Bus', location: 'Nha Trang city routes', desc: 'Affordable and comfortable local buses serving major routes', cost: 20000 },
      { title: 'Grab Taxi', location: 'Nha Trang city', desc: 'Convenient point-to-point travel around the city', cost: 80000 },
    ],
    insights: [
      'January–August is beach season — September to December brings the rainy season',
      'Island hopping tours should ideally be booked the day before',
      'The mud spa is least crowded on weekday mornings before 10am',
    ],
    warnings: [
      '⚠️ Jellyfish alert in July–September — always check the beach warning flags before swimming',
      '⚠️ Only book island boat tours with reputable operators that have proper safety equipment',
      '⚠️ VinPearl Land is a full-day commitment — pace yourself and manage your energy',
    ],
    budgetPerDay: { budget: 300000, medium: 620000, luxury: 1300000 },
  },
  '후에': {
    cover: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    weather: ['Overcast 27°C 🌥', 'Sunny 29°C ☀️', 'Possible rain 25°C 🌦', 'Sunny 28°C ☀️', 'Overcast 26°C 🌥'],
    dayThemes: ['Hue Citadel & Imperial Palace', 'Royal Tombs Cycling Tour', 'Perfume River Boat & Thien Mu Pagoda', 'Royal Cuisine Food Tour', 'Transfer to Da Nang'],
    morningAttractions: [
      { title: 'Hue Citadel & Imperial City', location: 'Hue Royal Citadel, Central Vietnam', desc: 'The last imperial capital of Vietnam — architecturally dubbed the Vietnamese Forbidden City', cost: 200000, img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600', tips: 'Rent an audio guide at the entrance for a richer historical experience', booking: false },
      { title: 'Minh Mang Royal Tomb', location: '12km south of Hue', desc: 'The most majestic and largest of the royal tombs — beautifully designed and serene', cost: 150000, booking: false },
      { title: 'Thien Mu Pagoda', location: 'West bank of the Perfume River', desc: 'Seven-story tower standing above the Perfume River — the spiritual symbol of Hue', cost: 0, tips: 'Arriving by boat makes the approach even more magical', booking: false },
    ],
    afternoonAttractions: [
      { title: 'Royal Tombs Cycling Tour', location: 'Hue countryside', desc: 'Cycle past three imperial tombs — Khai Dinh, Minh Mang, and Tu Duc — in a single afternoon', cost: 350000, booking: true },
      { title: 'Perfume River Sunset Cruise', location: 'Perfume River Pier, Hue', desc: 'One-hour boat cruise as the river turns golden in the afternoon light', cost: 150000, booking: false },
    ],
    eveningAttractions: [
      { title: 'Hue Night Market', location: 'Tran Hung Dao Street', desc: 'Nightly street market with Hue street food specialities, local crafts, and souvenirs', cost: 0, booking: false },
    ],
    breakfasts: [
      { title: 'Banh Cuon Hue Style', location: 'Local restaurant', desc: 'Hue-style steamed rice crepes served with a fragrant sweet shrimp dipping sauce', cost: 50000 },
      { title: 'Banh Beo & Banh Nam Platter', location: 'Quan Banh Beo Ba Cu', desc: 'A tasting platter of Hue\'s beloved miniature rice cakes — remarkable flavour variety', cost: 60000 },
    ],
    lunches: [
      { title: 'Bun Bo Hue (Spicy Beef Noodle Soup)', location: 'Bun Bo Hue O Hen', desc: 'The original Hue beef noodle soup — spicy, complex, and unlike any version you\'ll find elsewhere', cost: 60000, tips: 'This is the authentic bun bo — far more complex than Hanoi or HCMC interpretations' },
    ],
    dinners: [
      { title: 'Royal Imperial Dinner', location: 'Y Thao Garden Restaurant', desc: 'Nguyen Dynasty imperial recipes recreated with elegance, served with live traditional music', cost: 600000, tips: 'Advance booking is essential. Traditional court costumes can be worn for photos', booking: true },
      { title: 'Ca Ri Ga (Hue Chicken Curry)', location: 'Local restaurant', desc: 'Fragrant coconut milk chicken curry — mildly spiced Hue style', cost: 100000 },
    ],
    transports: [
      { title: 'Cyclo Tour', location: 'Hue city center', desc: 'A gentle pedicab tour through Hue\'s charming old streets and colonial lanes', cost: 100000 },
      { title: 'Bicycle Rental', location: 'Near your accommodation', desc: 'Hue is an exceptionally pleasant city to explore entirely by bicycle', cost: 60000 },
    ],
    insights: [
      'Hue Citadel was designated a UNESCO World Heritage Site in 1993',
      'Bun Bo Hue in its authentic form can only truly be tasted here in Hue itself',
      'The three main royal tombs are close enough together to visit all by bicycle in one day',
    ],
    warnings: [
      '⚠️ October–November is the rainy season in Hue — always carry an umbrella',
      '⚠️ Some areas of the Citadel are still under restoration — check the posted notices on-site',
      '⚠️ Dress modestly when visiting royal tombs — no sleeveless tops or shorts',
    ],
    budgetPerDay: { budget: 250000, medium: 480000, luxury: 950000 },
  },
};
function getProfile(destination: string, language: string = 'ko'): DestinationProfile {
  const normalized = destination.toLowerCase().trim();
  const key = (DEST_ALIASES[normalized] ?? destination) as DestKey;
  if (language === 'ko') {
    return DEST_PROFILES[key] ?? DEST_PROFILES['다낭'];
  }
  return DEST_PROFILES_EN[key] ?? DEST_PROFILES_EN['다낭'];
}


function dateAdd(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const mockAIItineraryResponse = (destination: string, duration: number, budget: 'budget' | 'medium' | 'luxury' = 'medium', language: string = 'ko'): Trip => {
  const p = getProfile(destination, language);
  const startDate = new Date().toISOString().split('T')[0];
  const costPerDay = p.budgetPerDay[budget];

  const itinerary = Array.from({ length: duration }, (_, dayIdx) => {
    const date = dateAdd(startDate, dayIdx);
    const acts: Trip['itinerary'][0]['activities'] = [];
    let actIdx = 0;

    // 07:30 — Breakfast
    const breakfast = pick(p.breakfasts, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '07:30',
      duration: language === 'ko' ? '1시간' : '1 hr',
      type: 'food',
      title: breakfast.title,
      location: breakfast.location,
      description: breakfast.desc,
      estimatedCost: breakfast.cost,
      currency: 'VND',
      tips: breakfast.tips,
      bookingRequired: false,
    });

    // 09:00 — Morning transport
    const transport = pick(p.transports, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '09:00',
      duration: language === 'ko' ? '30분' : '30 min',
      type: 'transport',
      title: transport.title,
      location: transport.location,
      description: transport.desc,
      estimatedCost: transport.cost,
      currency: 'VND',
      bookingRequired: false,
    });

    // 09:30 — Morning attraction
    const morning = pick(p.morningAttractions, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '09:30',
      duration: language === 'ko' ? '2시간 30분' : '2.5 hrs',
      type: 'attraction',
      title: morning.title,
      location: morning.location,
      description: morning.desc,
      imageUrl: morning.img,
      estimatedCost: morning.cost,
      currency: 'VND',
      tips: morning.tips,
      bookingRequired: morning.booking,
    });

    // 12:30 — Lunch
    const lunch = pick(p.lunches, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '12:30',
      duration: language === 'ko' ? '1시간' : '1 hr',
      type: 'food',
      title: lunch.title,
      location: lunch.location,
      description: lunch.desc,
      estimatedCost: lunch.cost,
      currency: 'VND',
      tips: lunch.tips,
      bookingRequired: false,
    });

    // 14:00 — Afternoon attraction
    const afternoon = pick(p.afternoonAttractions, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '14:00',
      duration: language === 'ko' ? '3시간' : '3 hrs',
      type: 'attraction',
      title: afternoon.title,
      location: afternoon.location,
      description: afternoon.desc,
      imageUrl: afternoon.img,
      estimatedCost: afternoon.cost,
      currency: 'VND',
      tips: afternoon.tips,
      bookingRequired: afternoon.booking,
    });

    // 17:30 — Free time / rest
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '17:30',
      duration: language === 'ko' ? '1시간 30분' : '1.5 hrs',
      type: 'free_time',
      title: language === 'ko' ? '자유 시간 & 휴식' : 'Free Time & Rest',
      location: language === 'ko' ? '숙소 또는 인근' : 'Hotel or nearby',
      description: language === 'ko' ? '오후 피로를 풀고 저녁 준비 — 카페에서 현지 커피 한 잔' : 'Relax and recharge before dinner — enjoy a local coffee at a nearby café',
      estimatedCost: 50000,
      currency: 'VND',
      bookingRequired: false,
    });

    // 19:00 — Evening attraction
    const evening = pick(p.eveningAttractions, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '19:00',
      duration: language === 'ko' ? '1시간' : '1 hr',
      type: 'attraction',
      title: evening.title,
      location: evening.location,
      description: evening.desc,
      estimatedCost: evening.cost,
      currency: 'VND',
      tips: evening.tips,
      bookingRequired: evening.booking,
    });

    // 20:00 — Dinner
    const dinner = pick(p.dinners, dayIdx);
    acts.push({
      id: `d${dayIdx}-a${actIdx++}`,
      time: '20:00',
      duration: language === 'ko' ? '1시간 30분' : '1.5 hrs',
      type: 'food',
      title: dinner.title,
      location: dinner.location,
      description: dinner.desc,
      estimatedCost: dinner.cost,
      currency: 'VND',
      tips: dinner.tips,
      bookingRequired: dinner.booking ?? false,
    });

    return {
      day: dayIdx + 1,
      date,
      title: pick(p.dayThemes, dayIdx),
      weatherNote: pick(p.weather, dayIdx),
      estimatedCost: costPerDay,
      activities: acts,
    };
  });

  return {
    id: `ai-trip-${Date.now()}`,
    title: language === 'ko' ? `AI 추천 ${destination} ${duration}박 ${duration + 1}일` : `AI-Planned ${duration}-Day ${destination} Trip`,
    destination,
    startDate,
    endDate: dateAdd(startDate, duration),
    duration,
    coverImage: p.cover,
    status: 'draft',
    totalEstimatedCost: costPerDay * duration,
    currency: 'KRW',
    travelStyle: 'cultural',
    travelers: 'couple',
    createdAt: new Date().toISOString(),
    isAIGenerated: true,
    aiInsights: [...p.insights, ...p.warnings],
    itinerary,
  };
};

import { delay } from '../api.client';
import { mockDestinations, mockAttractions } from '../../mock/destinations';
import { Destination, Attraction } from '../../types/destination.types';
import { Hotel } from '../../types/hotel.types';
import { USE_REAL_API } from '../config/api.config';
import { realDestinationsService } from '../real/destinations.service';
import type { MappedWeather, MappedTips } from '../adapters/destination.adapter';

const _mock = {
  getFeatured: async (): Promise<Destination[]> => {
    await delay(800);
    return mockDestinations.filter(d => d.isFeatured);
  },

  getAll: async (): Promise<Destination[]> => {
    await delay(600);
    return mockDestinations;
  },

  getById: async (id: string): Promise<Destination | null> => {
    await delay(400);
    return mockDestinations.find(d => d.id === id) ?? null;
  },

  search: async (query: string): Promise<Destination[]> => {
    await delay(500);
    const q = query.toLowerCase();
    return mockDestinations.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.nameKo.includes(q) ||
        d.tags.some(t => t.includes(q))
    );
  },

  getByCategory: async (category: string): Promise<Destination[]> => {
    await delay(500);
    return mockDestinations.filter(d => d.category === category);
  },

  getAttractionsByDestination: async (destinationId: string): Promise<Attraction[]> => {
    await delay(400);
    return mockAttractions.filter(a => a.destinationId === destinationId);
  },

  getPopularWithKoreans: async (): Promise<Attraction[]> => {
    await delay(500);
    return mockAttractions.filter(a => a.isPopularWithKoreans);
  },

  getAttractionById: async (id: string): Promise<Attraction | null> => {
    await delay(300);
    return mockAttractions.find(a => a.id === id) ?? null;
  },

  getWeatherData: async (destinationId: string, fallbackBestSeason = ''): Promise<MappedWeather> => {
    await delay(300);
    const dest = mockDestinations.find(d => d.id === destinationId);
    return {
      weather: dest?.weather ?? { temperature: 27, condition: '맑음', humidity: 70, description: '맑고 화창', icon: '☀️', rainfall: 0 },
      bestSeason: dest?.bestSeason ?? dest?.bestTimeToVisit ?? fallbackBestSeason,
      seasonBlocks: [
        { seasonKey: 'spring', label: '봄', monthsLabel: '3월~4월', note: '여행 성수기', icon: '🌸' },
        { seasonKey: 'summer', label: '여름', monthsLabel: '5월~8월', note: '고온 다습', icon: '☀️' },
        { seasonKey: 'autumn', label: '가을', monthsLabel: '9월~10월', note: '최적 시즌', icon: '🍂' },
        { seasonKey: 'winter', label: '겨울', monthsLabel: '11월~2월', note: '선선하고 건조', icon: '❄️' },
      ],
      packingItems: [
        { icon: '🧴', label: '선크림' }, { icon: '💊', label: '의약품' },
        { icon: '🔌', label: '어댑터' }, { icon: '💵', label: '현금' },
        { icon: '🧢', label: '모자' }, { icon: '💧', label: '물' },
      ],
    };
  },

  getTipsData: async (destinationId: string, defaultTips: string[] = []): Promise<MappedTips> => {
    await delay(300);
    const dest = mockDestinations.find(d => d.id === destinationId);
    return {
      tips: dest?.travelTipsKo ?? defaultTips,
      essentialApps: [
        { icon: '🚗', name: 'Grab', descKey: 'destination.apps.grab', subtitle: '택시 호출 앱' },
        { icon: '🗺️', name: 'Google Maps', descKey: 'destination.apps.googleMaps', subtitle: '지도 내비게이션' },
        { icon: '🌐', name: 'DeepL', descKey: 'destination.apps.deepl', subtitle: '번역 앱' },
        { icon: '💱', name: 'XE Money', descKey: 'destination.apps.xeMoney', subtitle: '환율 계산기' },
      ],
    };
  },

  getHotelsByDestination: async (destinationId: string): Promise<Hotel[]> => {
    await delay(400);
    // Mock hotels don't carry a destinationId — return empty; the detail screen
    // will call hotelsService.getByDestination() which has mock data.
    return [];
  },
};

export const destinationsService = USE_REAL_API ? realDestinationsService : _mock;

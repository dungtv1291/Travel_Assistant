import { delay } from '../api.client';
import { mockDestinations, mockAttractions } from '../../mock/destinations';
import { Destination, Attraction } from '../../types/destination.types';

export const destinationsService = {
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
};

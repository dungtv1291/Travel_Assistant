import { delay } from '../api.client';
import { getMockItineraries, mockAIItineraryResponse } from '../../mock/itineraries';
import { Trip, AIItineraryRequest } from '../../types/trip.types';
import { useLanguageStore } from '../../store/language.store';

export const aiPlannerService = {
  generateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    await delay(3000); // simulate AI generation
    const locale = useLanguageStore.getState().locale;
    const budgetLevel = request.budget >= 2000000 ? 'luxury' : request.budget >= 1000000 ? 'medium' : 'budget';
    return mockAIItineraryResponse(request.destination, request.duration, budgetLevel, locale);
  },

  regenerateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    await delay(2500);
    const locale = useLanguageStore.getState().locale;
    const budgetLevel = request.budget >= 2000000 ? 'luxury' : request.budget >= 1000000 ? 'medium' : 'budget';
    return mockAIItineraryResponse(request.destination, request.duration, budgetLevel, locale);
  },

  getSavedTrips: async (): Promise<Trip[]> => {
    await delay(500);
    const locale = useLanguageStore.getState().locale;
    return getMockItineraries(locale);
  },

  getTripById: async (id: string): Promise<Trip | null> => {
    await delay(300);
    const locale = useLanguageStore.getState().locale;
    return getMockItineraries(locale).find(t => t.id === id) ?? null;
  },
};

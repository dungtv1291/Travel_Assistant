import { delay } from '../api.client';
import { getMockItineraries, mockAIItineraryResponse } from '../../mock/itineraries';
import { Trip, AIItineraryRequest } from '../../types/trip.types';
import { useLanguageStore } from '../../store/language.store';
import { USE_REAL_API } from '../config/api.config';
import { realItinerariesService } from '../real/itineraries.service';

const _mock = {
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

  saveTrip: async (_id: string): Promise<void> => {
    // no-op for mock — trip persisted locally via store
  },

  regenerateTripById: async (id: string, _scope?: string): Promise<Trip> => {
    await delay(2500);
    const locale = useLanguageStore.getState().locale;
    const existing = getMockItineraries(locale).find(t => t.id === id);
    const budgetLevel = 'medium';
    return mockAIItineraryResponse(
      existing?.destination ?? '다낭',
      existing?.duration ?? 5,
      budgetLevel,
      locale,
    );
  },
};

export const aiPlannerService = USE_REAL_API ? realItinerariesService : _mock;

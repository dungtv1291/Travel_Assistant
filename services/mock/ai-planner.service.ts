import { delay } from '../api.client';
import { mockItineraries, mockAIItineraryResponse } from '../../mock/itineraries';
import { Trip, AIItineraryRequest } from '../../types/trip.types';

export const aiPlannerService = {
  generateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    await delay(3000); // simulate AI generation
    return mockAIItineraryResponse(request.destination, request.duration);
  },

  regenerateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    await delay(2500);
    return mockAIItineraryResponse(request.destination, request.duration);
  },

  getSavedTrips: async (): Promise<Trip[]> => {
    await delay(500);
    return mockItineraries;
  },

  getTripById: async (id: string): Promise<Trip | null> => {
    await delay(300);
    return mockItineraries.find(t => t.id === id) ?? null;
  },
};

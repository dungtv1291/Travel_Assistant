import { delay } from '../api.client';
import { mockFlights, mockAIFlightAnalysis } from '../../mock/flights';
import { Flight, FlightSearchParams, AIFlightAnalysis } from '../../types/flight.types';

export const flightsService = {
  search: async (_params: FlightSearchParams): Promise<Flight[]> => {
    await delay(2000); // simulate AI search time
    return mockFlights;
  },

  getAIAnalysis: async (_params: FlightSearchParams): Promise<AIFlightAnalysis> => {
    await delay(1500);
    return mockAIFlightAnalysis;
  },

  getDeals: async (): Promise<Flight[]> => {
    await delay(600);
    return mockFlights.slice(0, 3);
  },

  getById: async (id: string): Promise<Flight | null> => {
    await delay(300);
    return mockFlights.find(f => f.id === id) ?? null;
  },
};

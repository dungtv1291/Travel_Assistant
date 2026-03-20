import { delay } from '../api.client';
import { mockFlights, generateMockFlights, generateAIAnalysis } from '../../mock/flights';
import { Flight, FlightSearchParams, AIFlightAnalysis } from '../../types/flight.types';
import { USE_REAL_API } from '../config/api.config';
import { realFlightsService } from '../real/flights.service';

const _mock = {
  search: async (params: FlightSearchParams): Promise<Flight[]> => {
    await delay(2000); // simulate AI search time
    return generateMockFlights(params.origin, params.destination);
  },

  getAIAnalysis: async (params: FlightSearchParams): Promise<AIFlightAnalysis> => {
    await delay(1500);
    const flights = generateMockFlights(params.origin, params.destination);
    return generateAIAnalysis(flights);
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

export const flightsService = USE_REAL_API ? realFlightsService : _mock;

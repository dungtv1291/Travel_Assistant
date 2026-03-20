import type { Destination } from '../../types/destination.types';
import type { Hotel } from '../../types/hotel.types';
import type { Flight } from '../../types/flight.types';
import type { TransportVehicle } from '../../types/transport.types';
import { realDestinationsService } from './destinations.service';
import { realHotelsService } from './hotels.service';
import { realFlightsService } from './flights.service';
import { realTransportService } from './transport.service';

export interface HomeScreenData {
  featuredDestinations: Destination[];
  recommendedHotels: Hotel[];
  flightDeals: Flight[];
  transportHighlights: TransportVehicle[];
}

/**
 * Aggregates all home-screen data in a single parallel fetch.
 * The home screen (app/(tabs)/index.tsx) calls individual services directly,
 * so this aggregator is an optional convenience layer available for
 * screens or widgets that prefer a single call.
 */
export const realHomeService = {
  getHomeData: async (): Promise<HomeScreenData> => {
    const [featuredDestinations, recommendedHotels, flightDeals, transportHighlights] =
      await Promise.all([
        realDestinationsService.getFeatured(),
        realHotelsService.getRecommended(),
        realFlightsService.getDeals(),
        // transports endpoint may not be live — real service already falls back to mock
        realTransportService.getAll().then(all => all.slice(0, 4)),
      ]);

    return { featuredDestinations, recommendedHotels, flightDeals, transportHighlights };
  },
};

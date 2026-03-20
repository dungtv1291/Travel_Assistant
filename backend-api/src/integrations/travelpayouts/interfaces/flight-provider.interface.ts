/**
 * Flight provider abstraction.
 *
 * All external providers (Travelpayouts, future GDS, etc.) must implement
 * IFlightProvider.  The FlightsService depends only on the IFlightProvider
 * token — never on a concrete implementation.
 *
 * To swap providers:
 *   1. Create a new class implementing IFlightProvider.
 *   2. Replace the useClass in TravelpayoutsModule.
 *   3. No other files need to change.
 */

// ---------------------------------------------------------------------------
// Search request — what the service sends to the provider
// ---------------------------------------------------------------------------

export interface FlightSearchRequest {
  tripType: 'one_way' | 'round_trip';
  originCode: string;
  destinationCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string | null;
  seatClass: 'economy' | 'premium_economy' | 'business' | 'first';
  passengerCount: number;
  /** ±n days around departureDate for flexible search. 0 = exact. */
  flexibleDays: number;
  currency: string;
  language: string;
}

// ---------------------------------------------------------------------------
// Normalized flight result — provider-agnostic shape
// ---------------------------------------------------------------------------

export interface NormalizedFlight {
  /** Stable ID formed from provider data — used as the `id` in API responses. */
  id: string;
  airlineName: string;
  airlineCode: string;
  originCode: string;
  destinationCode: string;
  /** Departure local time HH:MM */
  departureTime: string;
  /** Arrival local time HH:MM */
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  priceAmount: number;
  currency: string;
  /** Short descriptive tags, e.g. ["fastest", "cheapest", "best_value"] */
  tags: string[];
  /** Deep-link to provider booking page (affiliate-tagged). */
  bookingUrl: string | null;
}

// ---------------------------------------------------------------------------
// Normalized deal — lightweight, for home-screen deals carousel
// ---------------------------------------------------------------------------

export interface NormalizedDeal {
  id: string;
  airlineName: string;
  airlineCode: string;
  originCode: string;
  destinationCode: string;
  originLabel: string;
  destinationLabel: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  priceAmount: number;
  currency: string;
  dealTag: string;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export const FLIGHT_PROVIDER_SERVICE = 'FLIGHT_PROVIDER_SERVICE';

export interface IFlightProvider {
  /**
   * Search flights for the given params.
   * Returns an empty array on provider error (non-fatal — service will log).
   */
  searchFlights(req: FlightSearchRequest): Promise<NormalizedFlight[]>;

  /**
   * Return a short list of curated cheap deals for the home screen.
   * These can be from a static list, a cached endpoint, or a provider API.
   */
  getDeals(): Promise<NormalizedDeal[]>;
}

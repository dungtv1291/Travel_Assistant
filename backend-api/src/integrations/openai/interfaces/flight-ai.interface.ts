import { NormalizedFlight } from '../../travelpayouts/interfaces/flight-provider.interface';

// ---------------------------------------------------------------------------
// Request / response types for AI flight recommendation
// ---------------------------------------------------------------------------

export interface FlightRecommendRequest {
  /** The flights to analyse — normalised results from the search step. */
  flights: NormalizedFlight[];
  /** User preference hint. */
  preference: 'best_value' | 'cheapest' | 'fastest';
  language: string;
}

export interface RecommendedFlightOption {
  id: string;
  airlineName: string;
  priceAmount: number;
  currency: string;
  /** Short natural-language explanation for returning to the UI. */
  reason: string;
}

export interface FlightRecommendResult {
  bestOption: RecommendedFlightOption;
  cheapestOption: RecommendedFlightOption;
  fastestOption: RecommendedFlightOption;
  reasoningSummary: string;
}

// ---------------------------------------------------------------------------
// Interface + injection token
// ---------------------------------------------------------------------------

export const FLIGHT_AI_SERVICE = 'FLIGHT_AI_SERVICE';

export interface IFlightAiService {
  recommend(req: FlightRecommendRequest): Promise<FlightRecommendResult>;
}

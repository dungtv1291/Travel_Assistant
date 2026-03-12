export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: StopDetail[];
  price: number;
  currency: string;
  class: FlightClass;
  seatsLeft: number;
  baggage: BaggageInfo;
  meal?: boolean;
  tags: FlightTag[];
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  cityKo?: string;
  country: string;
}

export interface StopDetail {
  airport: Airport;
  duration: string;
}

export interface BaggageInfo {
  cabin: string;
  checked: string;
}

export type FlightClass = 'economy' | 'business' | 'first';
export type FlightTag = 'cheapest' | 'fastest' | 'best_value' | 'popular';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  class: FlightClass;
  isFlexible?: boolean;
}

export interface AIFlightAnalysis {
  cheapest: Flight;
  fastest: Flight;
  bestValue: Flight;
  summary: string;
  recommendation: string;
  insights: string[];
  currentPriceLevel?: string;
  priceChangePercent?: number;
  details?: string[];
  bestBookingTime?: string;
}

export interface FlightBooking {
  id: string;
  flightId: string;
  flight: Flight;
  passengers: number;
  totalPrice: number;
  currency: string;
  status: 'watchlist' | 'booked' | 'cancelled';
  bookedAt: string;
  confirmationCode: string;
}

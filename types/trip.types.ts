export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  coverImage: string;
  status: TripStatus;
  itinerary: DayItinerary[];
  totalEstimatedCost: number;
  currency: string;
  travelStyle: TravelStyle;
  travelers: TravelerType;
  createdAt: string;
  isAIGenerated: boolean;
  aiInsights?: string[];
}

export interface DayItinerary {
  day: number;
  date: string;
  title: string;
  weatherNote?: string;
  activities: ItineraryActivity[];
  estimatedCost: number;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  duration: string;
  type: ActivityType;
  title: string;
  location: string;
  description: string;
  imageUrl?: string;
  estimatedCost: number;
  currency: string;
  tips?: string;
  bookingRequired: boolean;
}

export type TripStatus = 'planned' | 'active' | 'completed' | 'draft';
export type TravelStyle = 'adventure' | 'cultural' | 'relaxed' | 'foodie' | 'luxury' | 'budget';
export type TravelerType = 'solo' | 'couple' | 'family' | 'friends';
export type ActivityType = 'attraction' | 'food' | 'transport' | 'hotel' | 'free_time' | 'shopping';

export interface AIItineraryRequest {
  destination: string;
  duration: number;
  budget: number;
  travelStyle: TravelStyle;
  interests: string[];
  travelers: TravelerType;
  pace: 'relaxed' | 'moderate' | 'intensive';
  startDate: string;
  endDate: string;
}

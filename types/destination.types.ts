export interface Destination {
  id: string;
  name: string;
  nameKo: string;
  region: string;
  country: string;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  category: DestinationCategory;
  description: string;
  descriptionKo: string;
  longDescriptionKo?: string;
  travelTipsKo?: string[];
  bestSeason?: string;
  popularityKorean?: number;
  latitude: number;
  longitude: number;
  bestTimeToVisit: string;
  weather: WeatherInfo;
  popularityScore: number;
  isFeatured: boolean;
}

export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  nameKo: string;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  category: AttractionCategory;
  tags: string[];
  description: string;
  descriptionKo?: string;
  address: string;
  openingHours: OpeningHours;
  ticketPrice?: TicketPrice;
  suggestedDuration: string;
  duration?: string;
  latitude: number;
  longitude: number;
  isPopularWithKoreans: boolean;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  description: string;
  icon: string;
  rainfall?: number;
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface TicketPrice {
  adult: number;
  child: number;
  currency: string;
}

export type DestinationCategory = 
  | 'beach' 
  | 'city' 
  | 'mountain' 
  | 'culture' 
  | 'family' 
  | 'food';

export type AttractionCategory = 
  | 'heritage' 
  | 'nature' 
  | 'beach' 
  | 'temple' 
  | 'market' 
  | 'museum' 
  | 'food' 
  | 'entertainment';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  language: string;
}

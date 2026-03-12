export interface Hotel {
  id: string;
  name: string;
  nameKo: string;
  destinationId: string;
  city: string;
  location?: string;
  address: string;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  starRating: 1 | 2 | 3 | 4 | 5;
  category: HotelCategory;
  amenities: string[];
  tags: string[];
  description: string;
  descriptionKo?: string;
  pricePerNight: number;
  currency: string;
  latitude: number;
  longitude: number;
  rooms: RoomType[];
  reviews?: HotelReview[];
  policies: HotelPolicies;
  isRecommended: boolean;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  nameKo: string;
  description: string;
  imageUrl: string;
  maxGuests: number;
  maxOccupancy?: number;
  bedType: string;
  size: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  features?: string[];
  breakfastIncluded?: boolean;
  availability: boolean;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  pets: boolean;
  petsAllowed?: boolean;
  smoking: boolean;
  smokingAllowed?: boolean;
}

export interface HotelReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export type HotelCategory = 'luxury' | 'boutique' | 'resort' | 'business' | 'budget';

export interface HotelBooking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  bookedAt: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

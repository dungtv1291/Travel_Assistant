import { Hotel, HotelBooking, HotelPolicies, HotelReview, RoomType } from '../../types/hotel.types';
import { resolveAssetUrl } from '../config/api.config';

// ── Hotel list / recommended item ─────────────────────────────────────────────

interface BackendHotelListItem {
  id: number;
  slug?: string;
  name: string;
  destinationLabel?: string;
  destinationName?: string;
  addressShort?: string;
  hotelTypeLabel?: string;
  starRating?: 1 | 2 | 3 | 4 | 5;
  rating?: number;
  reviewCount?: number;
  nightlyPrice?: number;
  nightlyFromPrice?: number;
  currency?: string;
  coverImage?: string | null;
  amenityBadges?: string[];
  badges?: string[];
  isFavorite?: boolean;
}

export function mapHotelListItem(raw: BackendHotelListItem): Hotel {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null hotel list item');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    destinationId: '',
    city: raw.destinationLabel ?? raw.destinationName ?? '',
    location: raw.destinationLabel,
    address: raw.addressShort ?? '',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    starRating: (raw.starRating ?? 3) as 1 | 2 | 3 | 4 | 5,
    category: 'boutique',
    amenities: raw.amenityBadges ?? [],
    tags: raw.badges ?? [],
    description: '',
    pricePerNight: raw.nightlyPrice ?? raw.nightlyFromPrice ?? 0,
    currency: raw.currency ?? 'KRW',
    latitude: 0,
    longitude: 0,
    rooms: [],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: '체크인 48시간 전 무료 취소',
      pets: false,
      smoking: false,
    },
    isRecommended: true,
  };
}

// ── Hotel detail (GET /hotels/:id) ────────────────────────────────────────────

interface BackendHotelDetail {
  id: number;
  slug?: string;
  name: string;
  destinationLabel?: string;
  addressFull?: string;
  starRating?: 1 | 2 | 3 | 4 | 5;
  rating?: number;
  reviewCount?: number;
  coverImage?: string | null;
  badges?: string[];
  shortDescription?: string;
  nightlyFromPrice?: number;
  currency?: string;
}

export function mapHotelDetail(raw: BackendHotelDetail): Omit<Hotel, 'rooms' | 'policies'> {
  // [TEMP_FALLBACK] guard: callers have try/catch that returns null when this throws
  if (!raw) throw new Error('null hotel detail');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    destinationId: '',
    city: raw.destinationLabel ?? '',
    location: raw.addressFull ?? raw.destinationLabel ?? undefined,
    address: raw.addressFull ?? '',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    starRating: (raw.starRating ?? 3) as 1 | 2 | 3 | 4 | 5,
    category: 'boutique',
    amenities: [],
    tags: raw.badges ?? [],
    description: raw.shortDescription ?? '',
    descriptionKo: raw.shortDescription ?? undefined,
    pricePerNight: raw.nightlyFromPrice ?? 0,
    currency: raw.currency ?? 'KRW',
    latitude: 0,
    longitude: 0,
    isRecommended: false,
  };
}

// ── Room (GET /hotels/:id/rooms items[]) ──────────────────────────────────────

interface BackendRoom {
  id: number;
  name: string;
  bedLabel?: string;
  roomSizeM2?: number;
  maxGuests?: number;
  coverImage?: string | null;
  featureBadges?: string[];
  mealBadges?: string[];
  nightlyPrice?: number;
  currency?: string;
  isDefaultSelected?: boolean;
}

export function mapRoom(raw: BackendRoom, hotelId: string): RoomType {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null room item');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  const mealBadges = raw.mealBadges ?? [];
  return {
    id: String(raw.id),
    hotelId,
    name: raw.name,
    nameKo: raw.name,
    description: (raw.featureBadges ?? []).join(', '),
    imageUrl,
    maxGuests: raw.maxGuests ?? 2,
    maxOccupancy: raw.maxGuests ?? 2,
    bedType: raw.bedLabel ?? '더블 베드',
    size: raw.roomSizeM2 ?? 30,
    pricePerNight: raw.nightlyPrice ?? 0,
    currency: raw.currency ?? 'KRW',
    amenities: raw.featureBadges ?? [],
    features: raw.featureBadges,
    breakfastIncluded: mealBadges.some((b) => b.includes('조식') || b.toLowerCase().includes('breakfast')),
    availability: true,
  };
}

// ── Hotel policies (GET /hotels/:id/policies) ─────────────────────────────────

interface BackendPolicies {
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicyLabel?: string;
  petsPolicyLabel?: string;
  smokingPolicyLabel?: string;
}

export function mapHotelPolicies(raw: BackendPolicies): HotelPolicies {
  const noPets = (raw.petsPolicyLabel ?? '').includes('불가') || (raw.petsPolicyLabel ?? '').toLowerCase().includes('not');
  const noSmoking = (raw.smokingPolicyLabel ?? '').includes('금연') || (raw.smokingPolicyLabel ?? '').toLowerCase().includes('no smoking');
  return {
    checkIn: raw.checkInTime ?? '14:00',
    checkOut: raw.checkOutTime ?? '12:00',
    cancellation: raw.cancellationPolicyLabel ?? '',
    pets: !noPets,
    petsAllowed: !noPets,
    smoking: !noSmoking,
    smokingAllowed: !noSmoking,
  };
}

// ── Hotel reviews (GET /hotels/:id/reviews) ───────────────────────────────────

interface BackendReview {
  id: number;
  reviewerName?: string;
  reviewerInitial?: string;
  rating?: number;
  reviewDate?: string;
  content?: string;
}

export function mapReview(raw: BackendReview): HotelReview {
  return {
    id: String(raw.id),
    userId: '',
    userName: raw.reviewerName ?? raw.reviewerInitial ?? '익명',
    rating: raw.rating ?? 0,
    comment: raw.content ?? '',
    date: raw.reviewDate ?? '',
  };
}

// ── Hotel booking response (POST /hotel-bookings) ─────────────────────────────

interface BackendHotelBookingResponse {
  bookingId: number;
  bookingCode: string;
  status: string;
  hotelName: string;
  roomName?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCountLabel?: string;
  priceBreakdown?: {
    roomPrice?: number;
    taxAmount?: number;
    totalAmount?: number;
    currency?: string;
  };
}

// ── Amenities (GET /hotels/:id/amenities) ────────────────────────────────────

interface BackendAmenityItem {
  key: string;
  label: string;
  iconKey?: string | null;
}

interface BackendAmenitiesResponse {
  amenities?: BackendAmenityItem[];
  description?: string | null;
}

export function mapAmenitiesResponse(raw: BackendAmenitiesResponse): {
  amenities: string[];
  descriptionKo?: string;
} {
  return {
    amenities: (raw.amenities ?? []).map((a) => a.label),
    descriptionKo: raw.description ?? undefined,
  };
}

// ── Reviews (GET /hotels/:id/reviews) ─────────────────────────────────────────

interface BackendReviewsResponse {
  summary?: { rating: number; reviewCount: number };
  items?: Array<{
    id: number;
    reviewerName?: string;
    reviewerInitial?: string | null;
    rating?: number;
    reviewDate?: string;
    content?: string | null;
  }>;
}

export function mapHotelReviewsResponse(raw: BackendReviewsResponse): HotelReview[] {
  return (raw.items ?? []).map((item) => mapReview(item as any));
}

// ── Hotel booking response (POST /hotel-bookings) ─────────────────────────────

export function mapHotelBookingResponse(
  raw: BackendHotelBookingResponse,
  hotelId: string,
  roomId: string,
  hotelImage: string,
  guestName: string,
  guestEmail: string,
  guests: number,
): HotelBooking {
  const breakdown = raw.priceBreakdown;
  const totalPrice = breakdown?.totalAmount ?? breakdown?.roomPrice ?? 0;
  const pricePerNight = raw.nights > 0 ? Math.round(totalPrice / raw.nights) : totalPrice;
  return {
    id: String(raw.bookingId),
    hotelId,
    hotelName: raw.hotelName,
    hotelImage,
    roomId,
    roomName: raw.roomName ?? '',
    checkIn: raw.checkInDate,
    checkOut: raw.checkOutDate,
    nights: raw.nights,
    guests,
    pricePerNight,
    totalPrice,
    currency: breakdown?.currency ?? 'KRW',
    status: (raw.status as HotelBooking['status']) ?? 'confirmed',
    bookedAt: new Date().toISOString(),
    confirmationCode: raw.bookingCode,
    guestName,
    guestEmail,
  };
}

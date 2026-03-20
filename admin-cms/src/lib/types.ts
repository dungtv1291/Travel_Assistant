// ─── Shared TypeScript types matching the database schema ──────────────────
// Source of truth: docs/database-schema.md
// Only types used by the CMS are defined here; add more as needed.

export type Lang = "ko" | "en" | "vi";

// ── Auth ──────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  language?: string;
  // Future: add role field for admin/super-admin separation
  // role: 'admin' | 'super_admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: AdminUser | null;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Destinations ──────────────────────────────────────────────────────────

export interface Destination {
  id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  region_label_ko: string;
  region_label_en: string;
  region_label_vi: string;
  country_label_ko: string;
  country_label_en: string;
  country_label_vi: string;
  hero_image_url: string | null;
  rating: string | null;
  review_count: number;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  overview_description_ko: string | null;
  overview_description_en: string | null;
  overview_description_vi: string | null;
  best_season_label_ko: string | null;
  best_season_label_en: string | null;
  best_season_label_vi: string | null;
  average_temperature_c: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DestinationBadge {
  id: number;
  destination_id: number;
  label_ko: string;
  label_en: string;
  label_vi: string;
  badge_type: string | null;
  sort_order: number;
}

export interface DestinationFeatureTag {
  id: number;
  destination_id: number;
  label_ko: string;
  label_en: string;
  label_vi: string;
  sort_order: number;
}

export interface DestinationImage {
  id: number;
  destination_id: number;
  image_url: string;
  sort_order: number;
}

export interface DestinationSeason {
  id: number;
  destination_id: number;
  season_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  months_label_ko: string | null;
  months_label_en: string | null;
  months_label_vi: string | null;
  note_ko: string | null;
  note_en: string | null;
  note_vi: string | null;
  icon_key: string | null;
  sort_order: number;
}

export interface DestinationPackingItem {
  id: number;
  destination_id: number;
  icon_key: string | null;
  label_ko: string;
  label_en: string;
  label_vi: string;
  sort_order: number;
}

export interface DestinationTip {
  id: number;
  destination_id: number;
  order_no: number;
  text_ko: string;
  text_en: string;
  text_vi: string;
  is_active: boolean;
}

export interface DestinationEssentialApp {
  id: number;
  destination_id: number;
  name: string;
  subtitle: string | null;
  icon_url: string | null;
  external_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ── Places ────────────────────────────────────────────────────────────────

export interface Place {
  id: number;
  destination_id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  category_label_ko: string | null;
  category_label_en: string | null;
  category_label_vi: string | null;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  cover_image_url: string | null;
  rating: string | null;
  review_count: number;
  visit_duration_label_ko: string | null;
  visit_duration_label_en: string | null;
  visit_duration_label_vi: string | null;
  ticket_price_amount: string | null;
  ticket_price_currency: string | null;
  lat: string | null;
  lng: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface PlaceTag {
  id: number;
  place_id: number;
  label_ko: string;
  label_en: string;
  label_vi: string;
  sort_order: number;
}

// ── Hotels ────────────────────────────────────────────────────────────────

export interface Hotel {
  id: number;
  destination_id: number;
  slug: string;
  name: string;
  destination_label_ko: string | null;
  destination_label_en: string | null;
  destination_label_vi: string | null;
  address_full_ko: string | null;
  address_full_en: string | null;
  address_full_vi: string | null;
  hotel_type_label_ko: string | null;
  hotel_type_label_en: string | null;
  hotel_type_label_vi: string | null;
  star_rating: number | null;
  rating: string | null;
  review_count: number;
  cover_image_url: string | null;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  nightly_from_price: string | null;
  currency: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy_label_ko: string | null;
  cancellation_policy_label_en: string | null;
  cancellation_policy_label_vi: string | null;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface HotelRoomType {
  id: number;
  hotel_id: number;
  name_ko: string;
  name_en: string;
  name_vi: string;
  bed_label_ko: string | null;
  bed_label_en: string | null;
  bed_label_vi: string | null;
  room_size_m2: number | null;
  max_guests: number | null;
  cover_image_url: string | null;
  nightly_price: string | null;
  currency: string | null;
  is_default_selected: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface HotelReview {
  id: number;
  hotel_id: number;
  reviewer_name: string;
  reviewer_initial: string | null;
  rating: string;
  review_date: string | null;
  content_ko: string | null;
  content_en: string | null;
  content_vi: string | null;
  is_active: boolean;
}

// ── Transport Services ────────────────────────────────────────────────────

export type TransportServiceType =
  | "airport_pickup"
  | "private_car"
  | "self_drive"
  | "scooter"
  | "day_trip";

export interface TransportService {
  id: number;
  destination_id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  service_type: TransportServiceType;
  vehicle_model: string | null;
  capacity: number | null;
  luggage_count: number | null;
  with_driver: boolean;
  cover_image_url: string | null;
  rating: string | null;
  review_count: number;
  description_ko: string | null;
  description_en: string | null;
  description_vi: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface TransportDurationOption {
  id: number;
  transport_service_id: number;
  value: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  price_amount: string;
  currency: string;
  sort_order: number;
}

export interface TransportPickupOption {
  id: number;
  transport_service_id: number;
  option_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  description_ko: string | null;
  description_en: string | null;
  description_vi: string | null;
  sort_order: number;
  is_active: boolean;
}

// ── Bookings ──────────────────────────────────────────────────────────────

export type BookingType = "hotel" | "transport";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: number;
  booking_code: string;
  user_id: number | null;
  booking_type: BookingType;
  status: BookingStatus;
  title: string;
  subtitle: string | null;
  start_date: string | null;
  end_date: string | null;
  nights_or_usage_label: string | null;
  guest_info_label: string | null;
  total_amount: string | null;
  currency: string | null;
  confirmation_sent: boolean;
  note: string | null;
  created_at: string;
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  language: string | null;
  preferred_currency: string | null;
  is_active: boolean;
  created_at: string;
}

// ── App Settings ──────────────────────────────────────────────────────────

export interface AppSetting {
  id: number;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  updated_at: string;
}

// ── AI Generation Logs ────────────────────────────────────────────────────

export interface AiGenerationLog {
  id: number;
  user_id: number | null;
  feature_type: string;
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  status: string;
  provider_name: string | null;
  error_message: string | null;
  created_at: string;
}

// ── Itineraries ───────────────────────────────────────────────────────────

export interface Itinerary {
  id: number;
  public_id: string;
  user_id: number | null;
  destination_id: number | null;
  title: string;
  start_date: string | null;
  nights: number;
  days: number;
  traveler_type: string | null;
  budget_level: string | null;
  pace: string | null;
  is_saved: boolean;
  cover_image_url: string | null;
  created_at: string;
}

// ── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

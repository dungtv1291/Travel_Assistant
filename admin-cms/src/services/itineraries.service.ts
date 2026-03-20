// ─── Itineraries service ─────────────────────────────────────────────────
// Admin operations for monitoring AI-generated travel plans.

import { api, createResourceService } from '@/lib/api';
import type { Itinerary, ItineraryDetail, ItineraryDay, ItineraryTimelineItem, ItineraryWarning, ItinerarySmartTip } from '@/types';

const BASE = '/admin/itineraries';

// ─── Core listing and detail ───────────────────────────────────────────────

export const itinerariesService = createResourceService<Itinerary>(BASE);

// ─── Detailed itinerary with sub-resources ────────────────────────────────

export async function getItineraryDetail(itineraryId: number): Promise<ItineraryDetail> {
  return api.get<ItineraryDetail>(`${BASE}/${itineraryId}/detail`);
}

export async function getItineraryDays(itineraryId: number): Promise<ItineraryDay[]> {
  return api.get<ItineraryDay[]>(`${BASE}/${itineraryId}/days`);
}

export async function getDayTimelineItems(dayId: number): Promise<ItineraryTimelineItem[]> {
  return api.get<ItineraryTimelineItem[]>(`${BASE}/days/${dayId}/timeline`);
}

export async function getDayWarnings(dayId: number): Promise<ItineraryWarning[]> {
  return api.get<ItineraryWarning[]>(`${BASE}/days/${dayId}/warnings`);
}

export async function getDaySmartTips(dayId: number): Promise<ItinerarySmartTip[]> {
  return api.get<ItinerarySmartTip[]>(`${BASE}/days/${dayId}/smart-tips`);
}

// ─── Extended list params with itinerary-specific filters ─────────────────

export interface ItineraryListParams {
  page?: number;
  limit?: number;
  search?: string;
  destination_id?: number;
  is_saved?: boolean;
  user_id?: number;
  traveler_type?: string;
  budget_level?: string;
  sort_by?: 'created_at' | 'start_date' | 'nights' | 'estimated_cost_amount' | 'title';
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown; // Index signature for compatibility
}
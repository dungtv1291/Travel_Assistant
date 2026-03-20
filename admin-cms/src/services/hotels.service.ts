// ─── Hotels service ────────────────────────────────────────────────────────

import { api, createResourceService } from '@/lib/api';
import type { Hotel, HotelBadge, HotelImage } from '@/types';

const BASE = '/admin/hotels';

// ─── Core CRUD ─────────────────────────────────────────────────────────────

export const hotelsService = createResourceService<Hotel>(BASE);

// ─── Badge sub-resources ────────────────────────────────────────────────────

export type HotelBadgePayload = Omit<HotelBadge, 'id' | 'hotel_id'>;

export const hotelBadgesService = {
  list: (hotelId: number) =>
    api.get<HotelBadge[]>(`${BASE}/${hotelId}/badges`),

  create: (hotelId: number, body: HotelBadgePayload) =>
    api.post<HotelBadge>(`${BASE}/${hotelId}/badges`, body),

  update: (hotelId: number, badgeId: number, body: Partial<HotelBadgePayload>) =>
    api.patch<HotelBadge>(`${BASE}/${hotelId}/badges/${badgeId}`, body),

  delete: (hotelId: number, badgeId: number) =>
    api.delete<void>(`${BASE}/${hotelId}/badges/${badgeId}`),
};

// ─── Image sub-resources ────────────────────────────────────────────────────

export type HotelImagePayload = Omit<HotelImage, 'id' | 'hotel_id'>;

export const hotelImagesService = {
  list: (hotelId: number) =>
    api.get<HotelImage[]>(`${BASE}/${hotelId}/images`),

  create: (hotelId: number, body: HotelImagePayload) =>
    api.post<HotelImage>(`${BASE}/${hotelId}/images`, body),

  update: (hotelId: number, imageId: number, body: Partial<HotelImagePayload>) =>
    api.patch<HotelImage>(`${BASE}/${hotelId}/images/${imageId}`, body),

  delete: (hotelId: number, imageId: number) =>
    api.delete<void>(`${BASE}/${hotelId}/images/${imageId}`),
};

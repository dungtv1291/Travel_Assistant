// ─── Hotel Room Types service ──────────────────────────────────────────────

import { api, createResourceService } from '@/lib/api';
import type { HotelRoomType, HotelRoomBadge } from '@/types';

const BASE = '/admin/hotel-rooms';

// ─── Core CRUD ─────────────────────────────────────────────────────────────

export const roomTypesService = createResourceService<HotelRoomType>(BASE);

// ─── Room badge sub-resources ───────────────────────────────────────────────

export type RoomBadgePayload = Omit<HotelRoomBadge, 'id' | 'room_type_id'>;

export const roomBadgesService = {
  list: (roomId: number) =>
    api.get<HotelRoomBadge[]>(`${BASE}/${roomId}/badges`),

  create: (roomId: number, body: RoomBadgePayload) =>
    api.post<HotelRoomBadge>(`${BASE}/${roomId}/badges`, body),

  update: (roomId: number, badgeId: number, body: Partial<RoomBadgePayload>) =>
    api.patch<HotelRoomBadge>(`${BASE}/${roomId}/badges/${badgeId}`, body),

  delete: (roomId: number, badgeId: number) =>
    api.delete<void>(`${BASE}/${roomId}/badges/${badgeId}`),
};

// ─── Places service ────────────────────────────────────────────────────────

import { api, createResourceService } from '@/lib/api';
import type { Place, PlaceTag } from '@/types';

const BASE = '/admin/places';

// ─── Core CRUD ─────────────────────────────────────────────────────────────

export const placesService = createResourceService<Place>(BASE);

// ─── Place tag sub-resources ───────────────────────────────────────────────

export type PlaceTagPayload = Omit<PlaceTag, 'id' | 'place_id'>;

export const placeTagsService = {
  list: (placeId: number) =>
    api.get<PlaceTag[]>(`${BASE}/${placeId}/tags`),

  create: (placeId: number, body: PlaceTagPayload) =>
    api.post<PlaceTag>(`${BASE}/${placeId}/tags`, body),

  update: (placeId: number, tagId: number, body: Partial<PlaceTagPayload>) =>
    api.patch<PlaceTag>(`${BASE}/${placeId}/tags/${tagId}`, body),

  delete: (placeId: number, tagId: number) =>
    api.delete<void>(`${BASE}/${placeId}/tags/${tagId}`),
};

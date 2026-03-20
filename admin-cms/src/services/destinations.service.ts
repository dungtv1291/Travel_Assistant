// ─── Destinations service ──────────────────────────────────────────────────
// All calls go through /admin/destinations. Badge and feature-tag sub-resources
// live under /admin/destinations/:id/badges and /admin/destinations/:id/feature-tags.

import { api, createResourceService } from '@/lib/api';
import type { Destination, DestinationBadge, DestinationFeatureTag } from '@/types';

const BASE = '/admin/destinations';

// ─── Core CRUD ─────────────────────────────────────────────────────────────

export const destinationsService = createResourceService<Destination>(BASE);

// ─── Badge sub-resources ────────────────────────────────────────────────────

export type BadgePayload = Omit<DestinationBadge, 'id' | 'destination_id'>;

export const destinationBadgesService = {
  list: (destId: number) =>
    api.get<DestinationBadge[]>(`${BASE}/${destId}/badges`),

  create: (destId: number, body: BadgePayload) =>
    api.post<DestinationBadge>(`${BASE}/${destId}/badges`, body),

  update: (destId: number, badgeId: number, body: Partial<BadgePayload>) =>
    api.patch<DestinationBadge>(`${BASE}/${destId}/badges/${badgeId}`, body),

  delete: (destId: number, badgeId: number) =>
    api.delete<void>(`${BASE}/${destId}/badges/${badgeId}`),
};

// ─── Feature-tag sub-resources ──────────────────────────────────────────────

export type FeatureTagPayload = Omit<DestinationFeatureTag, 'id' | 'destination_id'>;

export const destinationFeatureTagsService = {
  list: (destId: number) =>
    api.get<DestinationFeatureTag[]>(`${BASE}/${destId}/feature-tags`),

  create: (destId: number, body: FeatureTagPayload) =>
    api.post<DestinationFeatureTag>(`${BASE}/${destId}/feature-tags`, body),

  update: (destId: number, tagId: number, body: Partial<FeatureTagPayload>) =>
    api.patch<DestinationFeatureTag>(`${BASE}/${destId}/feature-tags/${tagId}`, body),

  delete: (destId: number, tagId: number) =>
    api.delete<void>(`${BASE}/${destId}/feature-tags/${tagId}`),
};

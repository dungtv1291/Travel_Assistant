// ─── Transports service ─────────────────────────────────────────────────────

import { api, createResourceService } from '@/lib/api';
import type {
  TransportService,
  TransportBadge,
  TransportDurationOption,
  TransportPickupOption,
} from '@/types';

const BASE = '/admin/transports';

// ─── Core CRUD ──────────────────────────────────────────────────────────────

export const transportsService = createResourceService<TransportService>(BASE);

// ─── Badge sub-resources ────────────────────────────────────────────────────

export type TransportBadgePayload = Omit<TransportBadge, 'id' | 'transport_service_id'>;

export const transportBadgesService = {
  list: (transportId: number) =>
    api.get<TransportBadge[]>(`${BASE}/${transportId}/badges`),

  create: (transportId: number, body: TransportBadgePayload) =>
    api.post<TransportBadge>(`${BASE}/${transportId}/badges`, body),

  update: (transportId: number, badgeId: number, body: Partial<TransportBadgePayload>) =>
    api.patch<TransportBadge>(`${BASE}/${transportId}/badges/${badgeId}`, body),

  delete: (transportId: number, badgeId: number) =>
    api.delete<void>(`${BASE}/${transportId}/badges/${badgeId}`),
};

// ─── Duration options CRUD ──────────────────────────────────────────────────

export const transportDurationOptionsService =
  createResourceService<TransportDurationOption>('/admin/transport-duration-options');

// ─── Pickup options CRUD ────────────────────────────────────────────────────

export const transportPickupOptionsService =
  createResourceService<TransportPickupOption>('/admin/transport-pickup-options');

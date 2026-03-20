import { TransportVehicle, TransportType } from '../../types/transport.types';
import { resolveAssetUrl } from '../config/api.config';

// ── Transport list item (GET /transports items[]) ─────────────────────────────

interface BackendTransportItem {
  id: number | string;
  name: string;
  serviceType?: string;
  vehicleModel?: string;
  transmissionLabel?: string;
  capacity?: number;
  luggageCount?: number;
  withDriver?: boolean;
  priceAmount?: number;
  currency?: string;
  coverImage?: string | null;
  rating?: number;
  reviewCount?: number;
  featureBadges?: string[];
  categoryBadge?: string;
  isPopular?: boolean;
}

const SERVICE_TYPE_MAP: Record<string, TransportType> = {
  airport_pickup: 'airport_pickup',
  private_car: 'private_car',
  self_drive: 'self_drive',
  day_tour: 'day_tour',
  scooter: 'scooter',
};

export function mapTransportItem(raw: BackendTransportItem): TransportVehicle {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null transport item');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  const type: TransportType = SERVICE_TYPE_MAP[raw.serviceType ?? ''] ?? 'private_car';
  return {
    id: String(raw.id),
    type,
    name: raw.name,
    nameKo: raw.name,
    imageUrl,
    description: (raw.featureBadges ?? []).join(' · '),
    vehicleModel: raw.vehicleModel,
    capacity: raw.capacity ?? 4,
    luggageCapacity: raw.luggageCount,
    pricePerTrip: type === 'airport_pickup' || type === 'day_tour' ? raw.priceAmount : undefined,
    pricePerDay: type === 'self_drive' || type === 'private_car' ? raw.priceAmount : undefined,
    currency: raw.currency ?? 'KRW',
    features: raw.featureBadges ?? [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    driverIncluded: raw.withDriver ?? false,
    available: true,
    isPopular: raw.isPopular,
    tags: raw.featureBadges ?? [],
  };
}

// ── Transport highlight (GET /transports/highlights items[]) ──────────────────
// Highlights are UI shortcut tiles, not full vehicle records — they don't map
// directly to TransportVehicle.  Exposed as a separate type for the home screen.

export interface TransportHighlight {
  type: string;
  label: string;
  shortDescription: string;
  iconKey: string;
}

interface BackendTransportHighlight {
  type: string;
  label: string;
  shortDescription: string;
  iconKey: string;
}

export function mapTransportHighlight(raw: BackendTransportHighlight): TransportHighlight {
  return {
    type: raw.type,
    label: raw.label,
    shortDescription: raw.shortDescription,
    iconKey: raw.iconKey,
  };
}

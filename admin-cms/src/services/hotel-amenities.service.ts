// ─── Hotel Amenities service ───────────────────────────────────────────────

import { createResourceService } from '@/lib/api';
import type { HotelAmenity } from '@/types';

const BASE = '/admin/hotel-amenities';

export const hotelAmenitiesService = createResourceService<HotelAmenity>(BASE);

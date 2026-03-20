// ─── Hotel Reviews service ─────────────────────────────────────────────────

import { createResourceService } from '@/lib/api';
import type { HotelReview } from '@/types';

const BASE = '/admin/hotel-reviews';

export const hotelReviewsService = createResourceService<HotelReview>(BASE);

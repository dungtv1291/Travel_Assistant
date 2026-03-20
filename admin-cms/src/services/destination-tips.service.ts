// ─── Destination Tips service ────────────────────────────────────────────────

import { createResourceService } from '@/lib/api';
import type { DestinationTip } from '@/types';

export const destinationTipsService = createResourceService<DestinationTip>('/admin/destination-tips');

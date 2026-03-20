// ─── Essential Apps service ──────────────────────────────────────────────────

import { createResourceService } from '@/lib/api';
import type { DestinationEssentialApp } from '@/types';

export const essentialAppsService = createResourceService<DestinationEssentialApp>('/admin/essential-apps');

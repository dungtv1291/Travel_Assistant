// ─── App Settings service ─────────────────────────────────────────────────
// Admin operations for managing key-value app configuration.

import { api, createResourceService } from '@/lib/api';
import type { AppSetting } from '@/types';

const BASE = '/admin/app-settings';

// ─── Core CRUD operations ──────────────────────────────────────────────────

export const appSettingsService = createResourceService<AppSetting>(BASE);

// ─── Settings-specific operations ──────────────────────────────────────────

export async function updateSettingValue(
  settingId: number,
  value: string | null,
): Promise<AppSetting> {
  return api.patch<AppSetting>(`${BASE}/${settingId}/value`, { setting_value: value });
}

export async function createSetting(data: {
  setting_key: string;
  setting_value: string | null;
  description?: string;
}): Promise<AppSetting> {
  return api.post<AppSetting>(BASE, data);
}

// ─── Known setting keys for validation ─────────────────────────────────────

export const KNOWN_SETTING_KEYS = [
  'app_version',
  'support_email',
  'support_hours_ko',
  'support_hours_en', 
  'support_hours_vi',
  'privacy_policy_url',
  'terms_of_service_url',
] as const;

export type KnownSettingKey = typeof KNOWN_SETTING_KEYS[number];

// ─── List params for filtering ─────────────────────────────────────────────

export interface AppSettingListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown; // Index signature for compatibility
}
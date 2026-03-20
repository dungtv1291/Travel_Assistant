import { User, UserPreferences } from '../../types/user.types';

// ── Auth response (POST /auth/login, POST /auth/register) ─────────────────────

interface BackendAuthUser {
  id: number | string;
  email: string;
  fullName?: string;
  avatarUrl?: string | null;
  language?: 'ko' | 'en' | 'vi';
  preferredCurrency?: string;
}

interface BackendTokens {
  accessToken: string;
  refreshToken?: string;
}

interface BackendAuthResponse {
  user: BackendAuthUser;
  tokens: BackendTokens;
}

/**
 * Maps a login/register response to the frontend User model + token strings.
 */
export function mapAuthResponse(raw: BackendAuthResponse): {
  user: User;
  accessToken: string;
  refreshToken: string;
} {
  return {
    user: mapAuthUser(raw.user),
    accessToken: raw.tokens.accessToken,
    refreshToken: raw.tokens.refreshToken ?? '',
  };
}

/**
 * Maps just the user portion of an auth payload to the frontend User model.
 * Used for `GET /auth/me` as well as the login / register response.
 */
export function mapAuthUser(raw: BackendAuthUser): User {
  const lang = raw.language === 'vi' ? 'ko' : (raw.language ?? 'ko');
  return {
    id: String(raw.id),
    email: raw.email,
    name: raw.fullName ?? raw.email,
    nameKo: raw.fullName,
    avatar: raw.avatarUrl ?? undefined,
    nationality: 'Korean',
    language: lang as 'ko' | 'en',
    currency: raw.preferredCurrency ?? 'KRW',
    preferences: buildDefaultPreferences(lang as 'ko' | 'en', raw.preferredCurrency),
    createdAt: new Date().toISOString(),
    isGuest: false,
  };
}

// ── Profile response (GET /users/profile) ─────────────────────────────────────

interface BackendUserProfile {
  id: number | string;
  fullName?: string;
  email: string;
  avatarUrl?: string | null;
  savedTripsCount?: number;
  bookingsCount?: number;
  favoritesCount?: number;
  travelStyles?: string[];
  interestKeywords?: string[];
}

/**
 * Maps profile data into the frontend User, merging with an existing user
 * if already hydrated (preserves phone, preferences.language, etc.).
 */
export function mapUserProfile(raw: BackendUserProfile, existing?: User | null): User {
  return {
    ...(existing ?? buildDefaultUser(raw.email)),
    id: String(raw.id),
    email: raw.email,
    name: raw.fullName ?? raw.email,
    nameKo: raw.fullName,
    avatar: raw.avatarUrl ?? existing?.avatar,
    preferences: {
      ...buildDefaultPreferences(existing?.language ?? 'ko', existing?.currency),
      travelStyle: raw.travelStyles ?? existing?.preferences?.travelStyle ?? [],
      interests: raw.interestKeywords ?? existing?.preferences?.interests ?? [],
    },
    isGuest: false,
  };
}

// ── Preferences response (GET /users/preferences) ─────────────────────────────

interface BackendPreferences {
  language?: 'ko' | 'en' | 'vi';
  preferredCurrency?: string;
  darkModeEnabled?: boolean;
  pushNotificationEnabled?: boolean;
  travelerType?: string;
  budgetLevel?: string;
  pace?: string;
}

/**
 * Merges backend preferences into the frontend User model while keeping the
 * existing user fields intact.
 */
export function mergeUserPreferences(raw: BackendPreferences, existing: User): User {
  const lang = raw.language === 'vi' ? 'ko' : (raw.language ?? existing.language);
  return {
    ...existing,
    language: lang as 'ko' | 'en',
    currency: raw.preferredCurrency ?? existing.currency,
    preferences: {
      ...existing.preferences,
      language: lang,
      currency: raw.preferredCurrency ?? existing.currency,
      notificationsEnabled: raw.pushNotificationEnabled ?? existing.preferences.notificationsEnabled,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDefaultPreferences(
  lang: 'ko' | 'en' | 'vi' = 'ko',
  currency = 'KRW',
): UserPreferences {
  return {
    travelStyle: [],
    interests: [],
    dietaryRestrictions: [],
    notificationsEnabled: true,
    emailNotifications: true,
    currency,
    language: lang,
  };
}

function buildDefaultUser(email: string): User {
  return {
    id: '',
    email,
    name: email,
    nationality: 'Korean',
    language: 'ko',
    currency: 'KRW',
    preferences: buildDefaultPreferences(),
    createdAt: new Date().toISOString(),
    isGuest: false,
  };
}

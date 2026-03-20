import { User } from '../../types/user.types';
import { httpClient } from '../http/http.client';
import { mapUserProfile, mergeUserPreferences } from '../adapters/user.adapter';

/**
 * Profile service — wraps the /users/profile and /users/preferences endpoints.
 *
 * This service has no mock counterpart because the profile screen reads from
 * the auth store (populated at login) rather than calling a service directly.
 * It is used internally by the real auth service and is available for any
 * screen that needs to refresh or update profile data explicitly.
 */
export const profileService = {
  /** Fetch full profile and preferences, merges into a complete User object. */
  getFullProfile: async (existing?: User | null): Promise<User> => {
    const [profile, prefs] = await Promise.all([
      httpClient.get<Record<string, unknown>>('/users/profile'),
      httpClient.get<Record<string, unknown>>('/users/preferences').catch(() => ({})),
    ]);
    const user = mapUserProfile(profile as any, existing);
    return mergeUserPreferences(prefs as any, user);
  },

  /** Persist profile name / avatar changes. */
  updateProfile: async (
    updates: { fullName?: string; avatarUrl?: string },
    existing: User,
  ): Promise<User> => {
    const data = await httpClient.patch<Record<string, unknown>>('/users/profile', updates);
    return mapUserProfile(data as any, existing);
  },

  /** Persist preference changes (language, currency, notifications). */
  updatePreferences: async (
    updates: {
      language?: 'ko' | 'en';
      preferredCurrency?: string;
      darkModeEnabled?: boolean;
      pushNotificationEnabled?: boolean;
    },
    existing: User,
  ): Promise<User> => {
    const data = await httpClient.patch<Record<string, unknown>>('/users/preferences', updates);
    return mergeUserPreferences(data as any, existing);
  },

  /** Fetch just the aggregate counts shown in the profile stats widget. */
  getProfileCounts: async (): Promise<{
    savedTrips: number;
    bookings: number;
    favorites: number;
  }> => {
    const data = await httpClient.get<{
      savedTripsCount?: number;
      bookingsCount?: number;
      favoritesCount?: number;
    }>('/users/profile');
    return {
      savedTrips: data.savedTripsCount ?? 0,
      bookings: data.bookingsCount ?? 0,
      favorites: data.favoritesCount ?? 0,
    };
  },
};

import type { User } from '../../types/user.types';
import { USE_REAL_API } from '../config/api.config';
import { profileService as realProfileService } from '../real/profile.service';

const _mock = {
  getFullProfile: async (existing?: User | null): Promise<User> => {
    if (!existing) throw new Error('No user');
    return existing;
  },

  updateProfile: async (
    updates: { fullName?: string; avatarUrl?: string },
    existing: User,
  ): Promise<User> => {
    return { ...existing, name: updates.fullName ?? existing.name };
  },

  updatePreferences: async (
    _updates: {
      language?: 'ko' | 'en';
      preferredCurrency?: string;
      darkModeEnabled?: boolean;
      pushNotificationEnabled?: boolean;
    },
    existing: User,
  ): Promise<User> => existing,

  getProfileCounts: async (): Promise<{
    savedTrips: number;
    bookings: number;
    favorites: number;
  }> => ({ savedTrips: 0, bookings: 0, favorites: 0 }),
};

export const profileService = USE_REAL_API ? realProfileService : _mock;

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    await AsyncStorage.multiRemove(keys);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

// Typed keys — prevents key typos across the codebase
export const StorageKeys = {
  AUTH_USER: '@vt_auth_user',
  AUTH_TOKEN: '@vt_auth_token',
  BOOKINGS: '@vt_bookings',
  TRIPS: '@vt_trips',
  FAVORITES: '@vt_favorites',
  RECENT_SEARCHES: '@vt_recent_searches',
  ONBOARDING_DONE: '@vt_onboarding_done',
  PREFERRED_CURRENCY: '@vt_currency',
  PREFERRED_LANGUAGE: '@vt_language',
} as const;

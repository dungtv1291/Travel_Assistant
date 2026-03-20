import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData } from '../../types/user.types';
import { httpClient, ApiError, TOKEN_KEY } from '../http/http.client';
import { mapAuthResponse, mapAuthUser, mapUserProfile, mergeUserPreferences } from '../adapters/user.adapter';

const AUTH_STORAGE_KEY = '@vt_auth_user';

// ── Real implementation mirroring mock/auth.service.ts interface ──────────────

export const realAuthService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const data = await httpClient.post<{ user: Record<string, unknown>; tokens: Record<string, unknown> }>(
      '/auth/login',
      { email: credentials.email, password: credentials.password },
    );
    const { user, accessToken, refreshToken } = mapAuthResponse(data as any);
    await httpClient.setTokens(accessToken, refreshToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user, token: accessToken };
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const res = await httpClient.post<{ user: Record<string, unknown>; tokens: Record<string, unknown> }>(
      '/auth/register',
      { email: data.email, password: data.password, fullName: data.name, language: 'ko' },
    );
    const { user, accessToken, refreshToken } = mapAuthResponse(res as any);
    await httpClient.setTokens(accessToken, refreshToken);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { user, token: accessToken };
  },

  logout: async (): Promise<void> => {
    // Best-effort: revoke the refresh token on the server before clearing local state
    await httpClient.post('/auth/logout', {}).catch(() => undefined);
    await httpClient.clearTokens();
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /** Guest session — no backend equivalent; keep a local guest user. */
  continueAsGuest: async (): Promise<{ user: User; token: string }> => {
    const guestUser: User = {
      id: 'guest',
      email: '',
      name: '게스트',
      nationality: 'Korean',
      language: 'ko',
      currency: 'KRW',
      preferences: {
        travelStyle: [],
        interests: [],
        dietaryRestrictions: [],
        notificationsEnabled: false,
        emailNotifications: false,
        currency: 'KRW',
        language: 'ko',
      },
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
    return { user: guestUser, token: 'guest' };
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    if (!email.includes('@')) throw new Error('올바른 이메일 주소를 입력해주세요.');
    await httpClient
      .post('/auth/forgot-password', { email })
      .catch(() => undefined); // best-effort; never surface backend errors to the user
  },

  restoreSession: async (): Promise<{ user: User; token: string } | null> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token || token === 'guest') {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          const user = JSON.parse(raw) as User;
          return { user, token: token ?? 'guest' };
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      // Revalidate the stored token against the server
      const me = await httpClient.get<Record<string, unknown>>('/auth/me');
      const user = mapAuthUser(me as any);

      // Also hydrate preferences in the background
      httpClient
        .get<Record<string, unknown>>('/users/preferences')
        .then((prefs) => {
          const merged = mergeUserPreferences(prefs as any, user);
          AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
        })
        .catch(() => undefined);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { user, token };
    } catch (err) {
      // 401 means the token is invalid/expired and refresh failed — force re-login
      if (err instanceof ApiError && err.statusCode === 401) {
        await httpClient.clearTokens();
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      // Network or other error — return the cached user so the app stays usable offline
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          return { user: JSON.parse(raw) as User, token };
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  /**
   * Fetches the current user's full profile from the server.
   * Returns fresh user data (name, avatar, travelStyles, interests) and
   * server-side activity counts (trips, bookings, favorites).
   * Guaranteed not to throw — returns nulls on any error.
   */
  loadProfile: async (): Promise<{
    user: ReturnType<typeof mapUserProfile> | null;
    counts: { trips: number; bookings: number; favorites: number } | null;
  }> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>('/users/profile');
      const user = mapUserProfile(data as any);
      const counts = {
        trips: (data.savedTripsCount as number) ?? 0,
        bookings: (data.bookingsCount as number) ?? 0,
        favorites: (data.favoritesCount as number) ?? 0,
      };
      return { user, counts };
    } catch {
      return { user: null, counts: null };
    }
  },
};

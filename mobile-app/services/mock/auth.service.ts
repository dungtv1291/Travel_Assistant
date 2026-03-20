import { delay } from '../api.client';
import { User, LoginCredentials, RegisterData } from '../../types/user.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_REAL_API } from '../config/api.config';
import { realAuthService } from '../real/auth.service';

const AUTH_KEY = '@vt_auth_user';
const TOKEN_KEY = '@vt_auth_token';

const mockUser: User = {
  id: 'user-1',
  email: 'kim.travel@gmail.com',
  name: 'Kim Minji',
  nameKo: '김민지',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  phone: '+82-10-1234-5678',
  nationality: 'Korean',
  language: 'ko',
  currency: 'KRW',
  preferences: {
    travelStyle: ['cultural', 'foodie'],
    interests: ['photography', 'local food', 'history'],
    dietaryRestrictions: [],
    notificationsEnabled: true,
    emailNotifications: true,
    currency: 'KRW',
    language: 'ko',
  },
  createdAt: '2025-01-15T00:00:00Z',
  isGuest: false,
};

const _mock = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    await delay(1200);
    if (credentials.email && credentials.password.length >= 6) {
      const token = `mock_token_${Date.now()}`;
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return { user: mockUser, token };
    }
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    await delay(1500);
    const newUser: User = {
      ...mockUser,
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
    };
    const token = `mock_token_${Date.now()}`;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return { user: newUser, token };
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([AUTH_KEY, TOKEN_KEY]);
  },

  continueAsGuest: async (): Promise<{ user: User; token: string }> => {
    await delay(500);
    const guestUser: User = {
      ...mockUser,
      id: `guest-${Date.now()}`,
      name: 'Guest',
      nameKo: '게스트',
      email: '',
      isGuest: true,
    };
    const token = `guest_token_${Date.now()}`;
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(guestUser));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return { user: guestUser, token };
  },

  restoreSession: async (): Promise<{ user: User; token: string } | null> => {
    try {
      const [userStr, token] = await AsyncStorage.multiGet([AUTH_KEY, TOKEN_KEY]);
      if (userStr[1] && token[1]) {
        return { user: JSON.parse(userStr[1]), token: token[1] };
      }
      return null;
    } catch {
      return null;
    }
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    await delay(1000);
    if (!email.includes('@')) throw new Error('올바른 이메일 주소를 입력해주세요.');
    // mock: always succeeds
  },

  loadProfile: async (): Promise<{
    user: User | null;
    counts: { trips: number; bookings: number; favorites: number } | null;
  }> => {
    // Mock: return nulls so the profile screen falls back to local store data
    return { user: null, counts: null };
  },
};

export const authService = USE_REAL_API ? realAuthService : _mock;

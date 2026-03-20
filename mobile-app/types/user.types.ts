export interface User {
  id: string;
  email: string;
  name: string;
  nameKo?: string;
  avatar?: string;
  phone?: string;
  nationality: string;
  language: 'ko' | 'en';
  currency: string;
  preferences: UserPreferences;
  createdAt: string;
  isGuest: boolean;
}

export interface UserPreferences {
  travelStyle: string[];
  interests: string[];
  dietaryRestrictions: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  currency: string;
  language: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

import { create } from 'zustand';
import { User, AuthState } from '../types/user.types';
import { authService } from '../services/mock/auth.service';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,   // true until restoreSession() completes
  token: null,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.login({ email, password });
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, confirmPassword) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authService.register({ name, email, password, confirmPassword });
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  continueAsGuest: async () => {
    set({ isLoading: true });
    const { user, token } = await authService.continueAsGuest();
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    const session = await authService.restoreSession();
    if (session) {
      set({ user: session.user, token: session.token, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateUser: (updates) => {
    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

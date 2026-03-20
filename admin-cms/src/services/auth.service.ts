import { api, saveTokens, clearTokens } from './api';
import type { AdminUser } from '@/lib/types';
import { getRefreshToken, getAccessToken } from '@/lib/auth';

// Backend response shapes (api-contract.md §2)
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginApiResponse {
  user: AdminUser;
  tokens: TokenPair;
}

interface RefreshApiResponse {
  tokens: TokenPair;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginApiResponse> {
    const data = await api.post<LoginApiResponse>('/auth/login', { email, password });
    saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout API errors — always clear local tokens
    } finally {
      clearTokens();
    }
  },

  async refreshTokens(): Promise<RefreshResponse | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    
    try {
      const data = await api.post<RefreshResponse>('/auth/refresh', { refreshToken });
      saveTokens(data.accessToken, data.refreshToken);
      return data;
    } catch {
      // Refresh failed, clear tokens
      clearTokens();
      return null;
    }
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const data = await api.get<{ user: AdminUser }>('/auth/me');
      return data.user;
    } catch {
      // Token invalid, try refresh
      const refreshed = await this.refreshTokens();
      if (!refreshed) return null;
      
      try {
        const data = await api.get<{ user: AdminUser }>('/auth/me');
        return data.user;
      } catch {
        clearTokens();
        return null;
      }
    }
  },

  async validateSession(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
};

"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { isLoggedIn } from "@/lib/auth";
import type { AuthState } from "@/lib/types";

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
} {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    user: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Quick check: if no token, we're done
      if (!isLoggedIn()) {
        if (mounted) {
          setState({ isAuthenticated: false, loading: false, user: null });
        }
        return;
      }

      // Validate session with server
      try {
        const user = await authService.getCurrentUser();
        if (mounted) {
          setState({
            isAuthenticated: !!user,
            loading: false,
            user: user || null,
          });
        }
      } catch {
        if (mounted) {
          setState({ isAuthenticated: false, loading: false, user: null });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await authService.login(email, password);
      setState({
        isAuthenticated: true,
        loading: false,
        user: response.user,
      });
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, loading: false, user: null });
    
    // Fire and forget - don't block UI on logout API call
    authService.logout().catch(() => {
      // Ignore errors - local state already cleared
    });
    
    // Redirect to login
    window.location.href = "/login";
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setState(prev => ({ ...prev, user, isAuthenticated: true }));
        return true;
      } else {
        setState({ isAuthenticated: false, loading: false, user: null });
        return false;
      }
    } catch {
      setState({ isAuthenticated: false, loading: false, user: null });
      return false;
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshSession,
  };
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthPayload, User } from '@juls/pickleball-kit/types';
import {
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
} from '@juls/pickleball-kit/graphql';
import { api, clearToken, getToken, setToken } from '@/lib/api';

interface RegisterValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (values: RegisterValues) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.request<{ me: User }>(ME_QUERY);
      setUser(data.me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.request<{ login: AuthPayload }>(LOGIN_MUTATION, {
      input: { email, password },
    });
    setToken(data.login.accessToken);
    setUser(data.login.user);
  }, []);

  const register = useCallback(async (values: RegisterValues) => {
    const data = await api.request<{ register: AuthPayload }>(
      REGISTER_MUTATION,
      { input: values },
    );
    setToken(data.register.accessToken);
    setUser(data.register.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

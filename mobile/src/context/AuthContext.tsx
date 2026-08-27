import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken, getUser, setToken, setUser, clearToken, clearUser } from '@/lib/storage';
import { login as apiLogin, checkHealth, onAuthExpired } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Central 401 handler: force logout when API says token invalid
  useEffect(() => {
    const unsub = onAuthExpired(() => {
      signOut().catch(() => {});
    });
    return unsub;
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const t = await getToken();
      const u = await getUser();
      if (t && u) {
        setTokenState(t);
        setUserState(u);
      } else {
        await clearToken();
        await clearUser();
        setTokenState(null);
        setUserState(null);
      }
    } catch {
      setTokenState(null);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    const data = await apiLogin(email, password);
    await setToken(data.access_token);
    await setUser(data.user);
    setTokenState(data.access_token);
    setUserState(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    const { register } = await import('@/lib/api');
    await register(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    await clearUser();
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
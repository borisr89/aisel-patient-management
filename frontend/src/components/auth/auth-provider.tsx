'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

import {
  getAuthSessionServerSnapshot,
  getAuthSessionSnapshot,
  parseAuthSession,
  removeAuthSession,
  saveAuthSession,
  subscribeToAuthSession,
} from '@/lib/auth-storage';
import { authApi } from '@/services/auth-api';
import type {
  AuthSession,
  LoginRequest,
} from '@/types/auth';

interface AuthContextValue {
  session: AuthSession | null;
  isHydrated: boolean;
  login: (
    payload: LoginRequest,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

interface AuthProviderProps {
  children: React.ReactNode;
}

function subscribeToHydration():
  () => void {
  return () => undefined;
}

function getClientHydrationSnapshot():
  boolean {
  return true;
}

function getServerHydrationSnapshot():
  boolean {
  return false;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const sessionSnapshot =
    useSyncExternalStore(
      subscribeToAuthSession,
      getAuthSessionSnapshot,
      getAuthSessionServerSnapshot,
    );

  const isHydrated =
    useSyncExternalStore(
      subscribeToHydration,
      getClientHydrationSnapshot,
      getServerHydrationSnapshot,
    );

  const session = useMemo(
    () =>
      parseAuthSession(
        sessionSnapshot,
      ),
    [sessionSnapshot],
  );

  const login = useCallback(
    async (
      payload: LoginRequest,
    ): Promise<void> => {
      const response =
        await authApi.login(payload);

      saveAuthSession(response);
    },
    [],
  );

  const logout =
    useCallback((): void => {
      removeAuthSession();
    }, []);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        session,
        isHydrated,
        login,
        logout,
      }),
      [
        session,
        isHydrated,
        login,
        logout,
      ],
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
  AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    );
  }

  return context;
}

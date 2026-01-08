import React, { createContext, useContext, useMemo, useState } from 'react';
import { RoleName, User } from '../types';

const STORAGE_KEY = 'campusEventAuth';

interface StoredAuth {
  token: string;
  user: User;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  role: RoleName | null;
  login: (data: StoredAuth) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(): StoredAuth | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as StoredAuth;
    if (!parsed.token || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(data: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStorage());

  const login = (data: StoredAuth) => {
    setAuth(data);
    writeStorage(data);
  };

  const logout = () => {
    setAuth(null);
    clearStorage();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth?.token ?? null,
      user: auth?.user ?? null,
      role: auth?.user?.role ?? null,
      login,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthProvider gerekli.');
  }
  return ctx;
}

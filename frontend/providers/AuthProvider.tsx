"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { AuthUser } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { LoginInput, RegisterInput } from "@/types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: use the httpOnly refresh cookie to silently restore the session.
  // This issues a new access token without requiring the user to log in again.
  useEffect(() => {
    authService
      .restoreSession()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthUser> => {
    const { user: authUser } = await authService.login(input);
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
    await authService.register(input);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

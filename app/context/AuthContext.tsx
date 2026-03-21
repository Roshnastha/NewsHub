"use client";

import React, { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  email: string;
  role: "reader" | "publisher" | "admin";
  name: string;
  status?: string;
  provider?: "email" | "google" | "microsoft" | "apple";
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: (
    email: string,
    password: string,
    role: "reader" | "publisher" | "admin",
  ) => void;
  signUp: (email: string, password: string, name: string) => void;
  socialLogin: (
    email: string,
    name: string,
    provider: "google" | "microsoft" | "apple",
  ) => void;
  logout: () => void;
  isPublisher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (
    email: string,
    password: string,
    role: "reader" | "publisher" | "admin",
  ) => {
    if (email && password) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        name: email.split("@")[0],
        provider: "email",
      });
    }
  };

  const signUp = (email: string, password: string, name: string) => {
    if (email && password) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: "reader",
        name,
        provider: "email",
      });
    }
  };

  const socialLogin = (
    email: string,
    name: string,
    provider: "google" | "microsoft" | "apple",
  ) => {
    if (email && name) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: "reader",
        name,
        provider,
      });
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        setUser,
        login,
        signUp,
        socialLogin,
        logout,
        isPublisher: user?.role === "publisher",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

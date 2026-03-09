'use client';

import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'publisher';
  name: string;
  provider?: 'email' | 'google' | 'microsoft' | 'apple';
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, role: 'user' | 'publisher') => void;
  signUp: (email: string, password: string, name: string) => void;
  socialLogin: (email: string, name: string, provider: 'google' | 'microsoft' | 'apple') => void;
  logout: () => void;
  isPublisher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: 'user' | 'publisher') => {
    // For publisher role, only allow admin credentials
    if (role === 'publisher') {
      if (email === 'admin@gmail.com' && password === 'admin') {
        setUser({
          id: Math.random().toString(36).substr(2, 9),
          email,
          role,
          name: 'Publisher',
          provider: 'email',
        });
      } else {
        // Invalid publisher credentials
        throw new Error('Invalid publisher credentials. Use admin@gmail.com / admin');
      }
      return;
    }
    
    // For user role, allow any email/password
    if (email && password) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        name: email.split('@')[0],
        provider: 'email',
      });
    }
  };

  const signUp = (email: string, password: string, name: string) => {
    // Sign up creates a reader account by default
    if (email && password) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: 'user',
        name,
        provider: 'email',
      });
    }
  };

  const socialLogin = (email: string, name: string, provider: 'google' | 'microsoft' | 'apple') => {
    // Social login creates a reader account by default
    if (email && name) {
      setUser({
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: 'user',
        name,
        provider,
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      signUp,
      socialLogin,
      logout,
      isPublisher: user?.role === 'publisher'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStoredToken, storeToken, clearToken } from '@/lib/auth';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  nom?: string;
  prenom?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      const token = await getStoredToken();
      if (token) {
        const userData = await authApi.me();
        setUser(userData ?? null);
      }
    } catch {
      await clearToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    const token = response?.token;
    if (typeof token !== 'string' || !token) {
      throw new Error('Échec de connexion : le serveur n\'a pas retourné de token. Vérifiez que le serveur est bien déployé.');
    }
    await storeToken(token);
    const userData = await authApi.me();
    setUser(userData ?? null);
  }

  async function register(data: RegisterData) {
    const response = await authApi.register(data);
    const token = response?.token;
    if (typeof token !== 'string' || !token) {
      throw new Error('Échec d\'inscription : le serveur n\'a pas retourné de token. Vérifiez que le serveur est bien déployé.');
    }
    await storeToken(token);
    const userData = await authApi.me();
    setUser(userData ?? null);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore — on efface quand même le token local
    }
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import * as authApi from '@/api/auth';
import { ApiError, setAuthToken } from '@/api/client';
import { getMe, updateMe, type ProfileChanges } from '@/api/users';
import { deleteToken, getToken, saveToken } from '@/utils/token';
import type { User } from '@/api/types';

type AuthState = {
  user: User | null;
  // true mientras se revisa si había una sesión guardada al abrir la app
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (changes: ProfileChanges) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app: si hay un token guardado, se pide el usuario a GET /users/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        setAuthToken(token);
        const { user } = await getMe();
        setUser(user);
      } catch (error) {
        // Token vencido o cuenta borrada: se descarta. Si es un error de red, se conserva para el próximo intento.
        setAuthToken(null);
        if (error instanceof ApiError && error.status === 401) {
          await deleteToken();
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const startSession = async ({ user, token }: authApi.AuthResponse) => {
    await saveToken(token);
    setAuthToken(token);
    setUser(user);
  };

  const signIn = async (email: string, password: string) => {
    await startSession(await authApi.login(email, password));
  };

  const signUp = async (username: string, email: string, password: string) => {
    await startSession(await authApi.register(username, email, password));
  };

  // El backend no tiene logout: cerrar sesión es olvidar el token
  const signOut = async () => {
    await deleteToken();
    setAuthToken(null);
    setUser(null);
  };

  // Guarda en el backend y actualiza el usuario de toda la app (avatar, nombre…)
  const updateProfile = async (changes: ProfileChanges) => {
    const { user } = await updateMe(changes);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

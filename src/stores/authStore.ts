import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (emailOrUsername: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

const STORAGE_KEY_USER = '@sorteo_user';
const STORAGE_KEY_TOKEN = '@sorteo_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (emailOrUsername, pass) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(emailOrUsername, pass);
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, res.token);

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return res.user;
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al iniciar sesión';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      console.warn('Failed to clear async storage auth session', e);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);

      if (storedUser && storedToken) {
        set({
          user: JSON.parse(storedUser),
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      set({ user: updated });
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    }
  },

  clearError: () => set({ error: null }),
}));

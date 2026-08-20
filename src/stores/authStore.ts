import { create } from 'zustand';
import { User } from '../types/user';
import { authService } from '../services/authService';
import { supabase } from '../../server/config/supabase';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, pass) => {

    set({
      isLoading: true,
      error: null,
    });

    try {

      const res = await authService.login(
        email,
        pass
      );

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return res.user;

    } catch (err: any) {

      const errorMsg =
        err?.message ||
        'Error al iniciar sesión';

      set({
        isLoading: false,
        error: errorMsg,
      });

      throw new Error(errorMsg);
    }
  },

  logout: async () => {

    set({
      isLoading: true,
    });

    try {

      await supabase.auth.signOut();

    } catch (error) {

      console.warn(
        'Error al cerrar sesión:',
        error
      );

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

    set({
      isLoading: true,
    });

    try {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return;
      }

      const user =
        await authService.getCurrentUser(
          session.user.id
        );

      if (!user) {

        await supabase.auth.signOut();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        return;
      }

      set({
        user,
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
      });

    } catch (error) {

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (data) => {

    const currentUser = get().user;

    if (!currentUser) return;

    set({
      user: {
        ...currentUser,
        ...data,
      },
    });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
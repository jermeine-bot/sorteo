import { create } from 'zustand';
import { User } from '../types/user';
import { mockSellers } from '../mocks/users';
import { sellerService } from '../services/sellerService';

interface SellerState {
  sellers: User[];
  isLoading: boolean;
  error: string | null;

  fetchSellers: () => Promise<void>;
  addSeller: (sellerData: Omit<User, 'id' | 'role' | 'dailySales' | 'totalSales' | 'createdAt'>) => Promise<User>;
  toggleSellerActive: (id: string) => Promise<void>;
}

export const useSellerStore = create<SellerState>((set) => ({
  sellers: mockSellers,
  isLoading: false,
  error: null,

  fetchSellers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await sellerService.getSellers();
      set({ sellers: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al cargar vendedores' });
    }
  },

  addSeller: async (sellerData) => {
    set({ isLoading: true, error: null });
    try {
      const newSeller = await sellerService.createSeller(sellerData);
      set((state) => ({
        sellers: [newSeller, ...state.sellers],
        isLoading: false,
      }));
      return newSeller;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al agregar vendedor' });
      throw err;
    }
  },

  toggleSellerActive: async (id) => {
    set((state) => ({
      sellers: state.sellers.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    }));
  },
}));

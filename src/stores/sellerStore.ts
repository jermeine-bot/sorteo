import { create } from 'zustand';
import { User } from '../types/user';
import { sellerService } from '../services/sellerService';

interface SellerState {
  sellers: User[];
  isLoading: boolean;
  error: string | null;

  fetchSellers: () => Promise<void>;

  addSeller: (
    sellerData: Omit<
      User,
      'id' | 'role' | 'dailySales' | 'totalSales' | 'createdAt'
    >
  ) => Promise<User>;

  updateSeller: (
    id: string,
    sellerData: {
      name: string;
      lastName: string;
      username: string;
      email: string;
      phone: string;
      commissionPercentage: number;
    }
  ) => Promise<User>;

  changeSellerPassword: (
    sellerId: string,
    newPassword: string
  ) => Promise<void>;

  toggleSellerActive: (id: string) => Promise<void>;
}

export const useSellerStore = create<SellerState>((set) => ({
  sellers: [],
  isLoading: false,
  error: null,

  // ============================================================
  // OBTENER VENDEDORES
  // ============================================================
  fetchSellers: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const data = await sellerService.getSellers();

      set({
        sellers: data,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error(
        'Error al cargar vendedores:',
        err
      );

      set({
        sellers: [],
        isLoading: false,
        error:
          err?.message ||
          'Error al cargar vendedores',
      });
    }
  },

  // ============================================================
  // CREAR VENDEDOR
  // ============================================================
  addSeller: async (sellerData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const newSeller =
        await sellerService.createSeller(
          sellerData
        );

      set((state) => ({
        sellers: [
          newSeller,
          ...state.sellers,
        ],
        isLoading: false,
        error: null,
      }));

      return newSeller;
    } catch (err: any) {
      console.error(
        'Error al agregar vendedor:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al agregar vendedor',
      });

      throw err;
    }
  },

  // ============================================================
  // EDITAR VENDEDOR
  // ============================================================
  updateSeller: async (
    id,
    sellerData
  ) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const updatedSeller =
        await sellerService.updateSeller(
          id,
          sellerData
        );

      set((state) => ({
        sellers: state.sellers.map(
          (seller) =>
            seller.id === id
              ? updatedSeller
              : seller
        ),
        isLoading: false,
        error: null,
      }));

      return updatedSeller;
    } catch (err: any) {
      console.error(
        'Error al actualizar vendedor:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al actualizar vendedor',
      });

      throw err;
    }
  },

  // ============================================================
  // CAMBIAR CONTRASEÑA DEL VENDEDOR
  // ============================================================
  changeSellerPassword: async (
    sellerId,
    newPassword
  ) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      await sellerService.changeSellerPassword(
        sellerId,
        newPassword
      );

      set({
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error(
        'Error al cambiar contraseña del vendedor:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al cambiar la contraseña del vendedor',
      });

      throw err;
    }
  },

  // ============================================================
  // ACTIVAR / DESACTIVAR VENDEDOR
  // ============================================================
  toggleSellerActive: async (id) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const newStatus =
        await sellerService.toggleSellerStatus(
          id
        );

      set((state) => ({
        sellers: state.sellers.map(
          (seller) =>
            seller.id === id
              ? {
                  ...seller,
                  active: newStatus,
                }
              : seller
        ),
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      console.error(
        'Error al cambiar estado del vendedor:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al cambiar estado del vendedor',
      });

      throw err;
    }
  },
}));

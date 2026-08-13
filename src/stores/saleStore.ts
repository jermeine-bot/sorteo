import { create } from 'zustand';
import { Sale } from '../types/sale';
import { mockSales } from '../mocks/sales';
import { saleService } from '../services/saleService';

interface SaleState {
  sales: Sale[];
  currentReceipt: Sale | null;
  isLoading: boolean;
  error: string | null;

  fetchSales: () => Promise<void>;
  createSale: (saleData: {
    raffleId: string;
    raffleName: string;
    sellerId: string;
    sellerName: string;
    number: string;
    amount: number;
    commissionPercentage: number;
  }) => Promise<Sale>;
  setCurrentReceipt: (sale: Sale | null) => void;
  getSalesBySeller: (sellerId: string) => Sale[];
  getTodaySalesAmount: () => number;
  getTodaySalesCount: () => number;
  getTotalCommissions: () => number;
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: mockSales,
  currentReceipt: null,
  isLoading: false,
  error: null,

  fetchSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await saleService.getSales();
      set({ sales: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al cargar ventas' });
    }
  },

  createSale: async (saleData) => {
    set({ isLoading: true, error: null });
    try {
      const newSale = await saleService.createSale(saleData);
      set((state) => ({
        sales: [newSale, ...state.sales],
        currentReceipt: newSale,
        isLoading: false,
      }));
      return newSale;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al procesar la venta' });
      throw err;
    }
  },

  setCurrentReceipt: (sale) => set({ currentReceipt: sale }),

  getSalesBySeller: (sellerId: string) => {
    return get().sales.filter((s) => s.sellerId === sellerId);
  },

  getTodaySalesAmount: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sales
      .filter((s) => s.date === today && s.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + curr.amount, 0);
  },

  getTodaySalesCount: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sales.filter((s) => s.date === today && s.status === 'CONFIRMED').length;
  },

  getTotalCommissions: () => {
    return get().sales
      .filter((s) => s.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + curr.commission, 0);
  },
}));

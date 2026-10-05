import { create } from 'zustand';
import { Sale } from '../types/sale';
import { saleService } from '../services/saleService';

interface SaleState {
  sales: Sale[];
  currentReceipt: Sale | null;
  isLoading: boolean;
  error: string | null;

  fetchSales: () => Promise<void>;

  createSale: (saleData: {
    raffleId: string;
    number: string;
    amount: number;
  }) => Promise<Sale>;

  setCurrentReceipt: (sale: Sale | null) => void;

  getSalesBySeller: (sellerId: string) => Sale[];

  getTodaySalesAmount: () => number;

  getTodaySalesCount: () => number;

  getTotalCommissions: () => number;
}

// funcion para corregir la hora en los sorteos
const getLocalDateString = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  currentReceipt: null,
  isLoading: false,
  error: null,

  fetchSales: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const data = await saleService.getSales();

      set({
        sales: data,
        isLoading: false,
      });
    } catch (err: any) {
      console.error(
        '❌ Error cargando ventas:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al cargar ventas.',
      });
    }
  },

  createSale: async (saleData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const newSale =
        await saleService.createSale(saleData);

      set((state) => ({
        sales: [
          newSale,
          ...state.sales,
        ],
        currentReceipt: newSale,
        isLoading: false,
      }));

      console.log(
        '✅ Venta agregada al store:',
        newSale
      );

      return newSale;

    } catch (err: any) {
      console.error(
        '❌ Error creando venta:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al procesar la venta.',
      });

      throw err;
    }
  },

  setCurrentReceipt: (sale) => {
    set({
      currentReceipt: sale,
    });
  },

  getSalesBySeller: (sellerId: string) => {
    return get().sales.filter(
      (sale) =>
        sale.sellerId === sellerId
    );
  },

  getTodaySalesAmount: () => {
    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    return get()
      .sales
      .filter(
        (sale) =>
          sale.date === today &&
          sale.status === 'CONFIRMED'
      )
      .reduce(
        (total, sale) =>
          total + sale.amount,
        0
      );
  },

  getTodaySalesCount: () => {
    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    return get()
      .sales
      .filter(
        (sale) =>
          sale.date === today &&
          sale.status === 'CONFIRMED'
      )
      .length;
  },

  getTotalCommissions: () => {
    return get()
      .sales
      .filter(
        (sale) =>
          sale.status === 'CONFIRMED'
      )
      .reduce(
        (total, sale) =>
          total + sale.commission,
        0
      );
  },
}));


import { create } from 'zustand';
import { Prize } from '../types/prize';
import { prizeService } from '../services/prizeService';

interface PrizeState {
  prizes: Prize[];
  isLoading: boolean;
  error: string | null;

  fetchPrizes: () => Promise<void>;

  registerWinner: (
    raffleId: string,
    raffleName: string,
    winningNumber: string,
    prizeDescription: string,
    amount: number
  ) => Promise<Prize>;

  markAsPaid: (id: string) => Promise<void>;
}

export const usePrizeStore = create<PrizeState>((set) => ({

  prizes: [],

  isLoading: false,

  error: null,

  // Obtener premios desde Supabase
  fetchPrizes: async () => {

    set({
      isLoading: true,
      error: null,
    });

    try {

      const data = await prizeService.getPrizes();

      set({
        prizes: data,
        isLoading: false,
      });

    } catch (err: any) {

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al cargar premios',
      });
    }
  },

  // Registrar ganador
  registerWinner: async (
    raffleId,
    raffleName,
    winningNumber,
    prizeDescription,
    amount
  ) => {

    set({
      isLoading: true,
      error: null,
    });

    try {

      const newPrize =
        await prizeService.registerWinner(
          raffleId,
          raffleName,
          winningNumber,
          prizeDescription,
          amount
        );

      set((state) => ({
        prizes: [
          newPrize,
          ...state.prizes,
        ],
        isLoading: false,
      }));

      return newPrize;

    } catch (err: any) {

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al registrar ganador',
      });

      throw err;
    }
  },

  // Marcar premio como pagado
  markAsPaid: async (id) => {

    set({
      isLoading: true,
      error: null,
    });

    try {

      const updated =
        await prizeService.markAsPaid(id);

      set((state) => ({
        prizes: state.prizes.map((p) =>
          p.id === id
            ? updated
            : p
        ),

        isLoading: false,
      }));

    } catch (err: any) {

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al marcar premio como pagado',
      });

      throw err;
    }
  },
}));
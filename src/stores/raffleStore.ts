import { create } from 'zustand';
import { Raffle } from '../types/raffle';
import { mockRaffles } from '../mocks/raffles';
import { raffleService } from '../services/raffleService';

interface RaffleState {
  raffles: Raffle[];
  isLoading: boolean;
  error: string | null;

  fetchRaffles: () => Promise<void>;
  createRaffle: (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'totalSold'>) => Promise<Raffle>;
  updateRaffle: (id: string, updates: Partial<Raffle>) => Promise<void>;
  getActiveRaffle: () => Raffle | undefined;
}

export const useRaffleStore = create<RaffleState>((set, get) => ({
  raffles: mockRaffles,
  isLoading: false,
  error: null,

  fetchRaffles: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await raffleService.getRaffles();
      set({ raffles: data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al cargar sorteos' });
    }
  },

  createRaffle: async (raffleData) => {
    set({ isLoading: true, error: null });
    try {
      const newRaffle = await raffleService.createRaffle(raffleData);
      set((state) => ({
        raffles: [newRaffle, ...state.raffles],
        isLoading: false,
      }));
      return newRaffle;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al crear sorteo' });
      throw err;
    }
  },

  updateRaffle: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await raffleService.updateRaffle(id, updates);
      set((state) => ({
        raffles: state.raffles.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Error al actualizar sorteo' });
      throw err;
    }
  },

  getActiveRaffle: () => {
    return get().raffles.find((r) => r.status === 'ACTIVE') || get().raffles[0];
  },
}));

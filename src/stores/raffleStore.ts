import { create } from 'zustand';
import { Raffle } from '../types/raffle';
import { raffleService } from '../services/raffleService';

interface RaffleState {
  raffles: Raffle[];
  isLoading: boolean;
  error: string | null;

  fetchRaffles: () => Promise<void>;

  createRaffle: (
    raffleData: Omit<
      Raffle,
      'id' | 'createdAt' | 'totalSold' | 'totalTickets' | 'winningNumber' | 'status'
    >
  ) => Promise<Raffle>;

  updateRaffle: (
    id: string,
    updates: Partial<Raffle>
  ) => Promise<void>;

  getActiveRaffle: () => Raffle | undefined;
}

export const useRaffleStore = create<RaffleState>((set, get) => ({
  raffles: [],

  isLoading: false,
  error: null,

  // obtener datos
  fetchRaffles: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const data = await raffleService.getRaffles();

      set({
        raffles: data,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Error cargando sorteos:', err);

      set({
        raffles: [],
        isLoading: false,
        error:
          err?.message ||
          'No se pudieron cargar los sorteos.',
      });
    }
  },

  // creacion de sorteos
  createRaffle: async (raffleData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const newRaffle =
        await raffleService.createRaffle(raffleData);

      set((state) => ({
        raffles: [
          newRaffle,
          ...state.raffles,
        ],
        isLoading: false,
      }));

      return newRaffle;

    } catch (err: any) {
      console.error('Error creando sorteo:', err);

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al crear sorteo.',
      });

      throw err;
    }
  },

  // Actualizar sorteo
  updateRaffle: async (id, updates) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const updated =
        await raffleService.updateRaffle(
          id,
          updates
        );

      set((state) => ({
        raffles: state.raffles.map((raffle) =>
          raffle.id === id
            ? updated
            : raffle
        ),
        isLoading: false,
      }));

    } catch (err: any) {
      console.error(
        'Error actualizando sorteo:',
        err
      );

      set({
        isLoading: false,
        error:
          err?.message ||
          'Error al actualizar sorteo.',
      });

      throw err;
    }
  },

  // obtener sorteo activo
  getActiveRaffle: () => {
    return get().raffles.find(
      (raffle) =>
        raffle.status === 'ACTIVE'
    );
  },
}));
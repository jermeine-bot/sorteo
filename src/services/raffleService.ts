import { mockRaffles } from '../mocks/raffles';
import { Raffle } from '../types/raffle';

export const raffleService = {
  async getRaffles(): Promise<Raffle[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockRaffles];
  },

  async getActiveRaffles(): Promise<Raffle[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRaffles.filter((r) => r.status === 'ACTIVE');
  },

  async createRaffle(raffleData: Omit<Raffle, 'id' | 'createdAt' | 'totalSold'>): Promise<Raffle> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newRaffle: Raffle = {
      ...raffleData,
      id: `raf-${Date.now().toString().slice(-4)}`,
      totalSold: 0,
      createdAt: new Date().toISOString(),
    };
    return newRaffle;
  },

  async updateRaffle(id: string, updates: Partial<Raffle>): Promise<Raffle> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const existing = mockRaffles.find((r) => r.id === id);
    if (!existing) throw new Error('Sorteo no encontrado');
    return { ...existing, ...updates };
  },
};

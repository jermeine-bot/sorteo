import { mockPrizes } from '../mocks/prizes';
import { Prize } from '../types/prize';

export const prizeService = {
  async getPrizes(): Promise<Prize[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockPrizes];
  },

  async registerWinner(raffleId: string, raffleName: string, winningNumber: string, prizeDescription: string, amount: number): Promise<Prize> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newPrize: Prize = {
      id: `prz-${Date.now().toString().slice(-4)}`,
      raffleId,
      raffleName,
      winningNumber,
      prizeDescription,
      amount,
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };
    return newPrize;
  },

  async markAsPaid(prizeId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return true;
  },
};

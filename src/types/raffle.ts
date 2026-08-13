export type RaffleStatus = 'PROGRAMMED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';

export interface Raffle {
  id: string;
  name: string;
  description: string;
  drawDate: string; // YYYY-MM-DD
  drawTime: string; // HH:mm
  mainPrize: string;
  prizeAmount: number;
  ticketPrice: number;
  commissionPercentage: number;
  status: RaffleStatus;
  totalSold: number;
  totalTickets: number;
  winningNumber?: string;
  createdAt: string;
}

export type RaffleStatus = 'PROGRAMMED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';

export interface Raffle {
  id: string;
  raffleNumber: string; // Ej. "SRT-001" o "101"
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  drawDate: string; // YYYY-MM-DD
  drawTime: string; // HH:mm
  mainPrize: string;
  prizeAmount: number;
  ticketPrice: number;
  commissionPercentage: number;
  status: RaffleStatus;
  isUnlimitedTickets: boolean;
  totalSold: number;
  totalTickets: number;
  winningNumber?: string;
  createdAt: string;
}

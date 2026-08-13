export type PrizeStatus = 'PENDING' | 'VERIFIED' | 'PAID';

export interface Prize {
  id: string;
  raffleId: string;
  raffleName: string;
  winningNumber: string;
  prizeDescription: string;
  amount: number;
  status: PrizeStatus;
  winnerSaleId?: string;
  winnerCode?: string;
  winnerSellerName?: string;
  paidAt?: string;
  createdAt: string;
}

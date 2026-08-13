export type SaleStatus = 'CONFIRMED' | 'CANCELLED';

export interface Sale {
  id: string;
  code: string; // e.g. VNT-000125
  raffleId: string;
  raffleName: string;
  sellerId: string;
  sellerName: string;
  number: string; // The chosen number (e.g. 4587)
  amount: number; // Monto in C$
  commission: number; // Commission calculated in C$
  status: SaleStatus;
  createdAt: string; // ISO date string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface CreateSaleDTO {
  raffleId: string;
  number: string;
  amount: number;
}

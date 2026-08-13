import { mockSales } from '../mocks/sales';
import { Sale } from '../types/sale';
import { generateTicketCode } from '../utils/ticket';
import { getTodayISO, getCurrentTimeHHMM } from '../utils/date';

export const saleService = {
  async getSales(): Promise<Sale[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockSales];
  },

  async getSalesBySeller(sellerId: string): Promise<Sale[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockSales.filter((s) => s.sellerId === sellerId);
  },

  async createSale(saleData: {
    raffleId: string;
    raffleName: string;
    sellerId: string;
    sellerName: string;
    number: string;
    amount: number;
    commissionPercentage: number;
  }): Promise<Sale> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const commission = (saleData.amount * saleData.commissionPercentage) / 100;
    const newSale: Sale = {
      id: `sale-${Date.now().toString().slice(-5)}`,
      code: generateTicketCode(),
      raffleId: saleData.raffleId,
      raffleName: saleData.raffleName,
      sellerId: saleData.sellerId,
      sellerName: saleData.sellerName,
      number: saleData.number,
      amount: saleData.amount,
      commission,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      date: getTodayISO(),
      time: getCurrentTimeHHMM(),
    };

    return newSale;
  },
};

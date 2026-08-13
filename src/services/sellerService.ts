import { mockSellers } from '../mocks/users';
import { User } from '../types/user';

export const sellerService = {
  async getSellers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockSellers];
  },

  async createSeller(sellerData: Omit<User, 'id' | 'role' | 'dailySales' | 'totalSales' | 'createdAt'>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newSeller: User = {
      ...sellerData,
      id: `usr-seller-${Date.now().toString().slice(-4)}`,
      role: 'SELLER',
      dailySales: 0,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };
    return newSeller;
  },

  async toggleSellerStatus(sellerId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  },
};

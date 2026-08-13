export type UserRole = 'ADMIN' | 'SELLER';

export interface User {
  id: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
  commissionPercentage: number;
  dailySales: number;
  totalSales: number;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

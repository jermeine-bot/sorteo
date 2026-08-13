import { mockAdmin, mockSellers } from '../mocks/users';
import { User, LoginResponse } from '../types/user';

export const authService = {
  async login(emailOrUsername: string, password: string): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanInput = emailOrUsername.trim().toLowerCase();

    // Check Admin
    if (
      (cleanInput === 'admin@sorteo.com' || cleanInput === 'admin') &&
      password === '123456'
    ) {
      return {
        user: mockAdmin,
        token: 'mock-jwt-token-admin-123456',
      };
    }

    // Check Seller
    const foundSeller = mockSellers.find(
      (s) =>
        (s.email.toLowerCase() === cleanInput ||
          s.username.toLowerCase() === cleanInput) &&
        s.active
    );

    if (
      (cleanInput === 'vendedor@sorteo.com' || cleanInput === 'vendedor' || foundSeller) &&
      password === '123456'
    ) {
      const user = foundSeller || mockSellers[0];
      return {
        user,
        token: `mock-jwt-token-${user.id}`,
      };
    }

    throw new Error('Credenciales inválidas. Verifica tu usuario y contraseña.');
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { ...mockAdmin, ...data, id: userId };
  },
};

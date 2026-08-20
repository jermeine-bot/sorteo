import { supabase } from '../../server/config/supabase';
import { mockAdmin, mockSellers } from '../mocks/users';
import { User, LoginResponse } from '../types/user';

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    console.log('AUTH USER:', data.user?.id);
    console.log(
      'AUTH SESSION:',
      data.session?.access_token ? 'SESSION OK' : 'NO SESSION'
    );

    if (error || !data.user) {
      throw new Error(
        'Credenciales inválidas. Verifica tu correo y contraseña.'
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError || !profile) {

      await supabase.auth.signOut();

      throw new Error(
        'El usuario no tiene un perfil configurado.'
      );
    }

    if (!profile.active) {

      await supabase.auth.signOut();

      throw new Error(
        'Este usuario se encuentra desactivado.'
      );
    }

    const user: User = {
      id: profile.id,
      name: profile.name,
      lastName: profile.last_name,
      username: profile.username,
      email: data.user.email ?? '',
      role: profile.role,
      phone: profile.phone ?? '',
      active: profile.active,
      commissionPercentage:
        Number(profile.commission_percentage),
      dailySales: 0,
      totalSales: 0,
      createdAt: profile.created_at,
    };

    return {
      user,
      token: data.session?.access_token ?? '',
    };
  },

  async getCurrentUser(
    userId: string
  ): Promise<User | null> {

    const { data: profile, error } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile || !profile.active) {
      return null;
    }

    return {
      id: profile.id,
      name: profile.name,
      lastName: profile.last_name,
      username: profile.username,
      email: '',
      role: profile.role,
      phone: profile.phone ?? '',
      active: profile.active,
      commissionPercentage:
        Number(profile.commission_percentage),
      dailySales: 0,
      totalSales: 0,
      createdAt: profile.created_at,
    };
  },

  async updateProfile(
    userId: string,
    data: Partial<User>
  ): Promise<User> {

    const { data: profile, error } =
      await supabase
        .from('profiles')
        .update({
          name: data.name,
          last_name: data.lastName,
          username: data.username,
          phone: data.phone,
        })
        .eq('id', userId)
        .select()
        .single();

    if (error || !profile) {
      throw new Error(
        'No se pudo actualizar el perfil.'
      );
    }

    return {
      id: profile.id,
      name: profile.name,
      lastName: profile.last_name,
      username: profile.username,
      email: data.email ?? '',
      role: profile.role,
      phone: profile.phone ?? '',
      active: profile.active,
      commissionPercentage:
        Number(profile.commission_percentage),
      dailySales: 0,
      totalSales: 0,
      createdAt: profile.created_at,
    };
  },
};
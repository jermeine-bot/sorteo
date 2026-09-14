import { supabase } from '../../server/config/supabase';
import { User } from '../types/user';

// Funcion dedicada para obtener los vendedores registrados
export const sellerService = {
  async getSellers(): Promise<User[]> {
    console.log('Buscando vendedores en Supabase...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'SELLER')
      .order('created_at', { ascending: false });

    console.log('Vendedores obtenidos:', data);
    console.log('Error vendedores:', error);

    if (error) {
      throw new Error(
        `No se pudieron obtener los vendedores: ${error.message}`
      );
    }

    return (data ?? []).map((profile): User => ({
      id: profile.id,
      name: profile.name,
      lastName: profile.last_name,
      username: profile.username,
      email: '',
      role: profile.role,
      phone: profile.phone ?? '',
      active: profile.active,
      commissionPercentage: Number(profile.commission_percentage),
      dailySales: 0,
      totalSales: 0,
      createdAt: profile.created_at,
    }));
  },

  // Funcion para la creacion de vendedores
  async createSeller(
    sellerData: Omit<
      User,
      'id' | 'role' | 'dailySales' | 'totalSales' | 'createdAt'
    >
  ): Promise<User> {
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

  // Funcion para editar un vendedor existente
  async updateSeller(
    sellerId: string,
    sellerData: {
      name: string;
      lastName: string;
      username: string;
      phone: string;
      commissionPercentage: number;
    }
  ): Promise<User> {
    console.log('Actualizando vendedor en Supabase:', sellerId);
    console.log('Datos a actualizar:', sellerData);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: sellerData.name,
        last_name: sellerData.lastName,
        username: sellerData.username,
        phone: sellerData.phone,
        commission_percentage: sellerData.commissionPercentage,
      })
      .eq('id', sellerId)
      .eq('role', 'SELLER')
      .select('*')
      .single();

    console.log('📦 Vendedor actualizado:', data);
    console.log('❌ Error actualización:', error);

    if (error) {
      throw new Error(
        `No se pudo actualizar el vendedor: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        'No se encontró el vendedor que se desea actualizar.'
      );
    }

    return {
      id: data.id,
      name: data.name,
      lastName: data.last_name,
      username: data.username,
      email: '',
      role: data.role,
      phone: data.phone ?? '',
      active: data.active,
      commissionPercentage: Number(data.commission_percentage),
      dailySales: 0,
      totalSales: 0,
      createdAt: data.created_at,
    };
  },

  // password 
  // async changeSellerPassword(
  // sellerId: string,
  // newPassword: string
  // ): Promise<void> {
  //   console.log(
  //     'Solicitando cambio de contraseña para vendedor:',
  //     sellerId
  //   );

  //   const { data, error } =
  //     await supabase.functions.invoke(
  //       'change-seller-password',
  //       {
  //         body: {
  //           sellerId,
  //           newPassword,
  //         },
  //       }
  //     );

  //   console.log('📦 Respuesta cambio contraseña:', data);
  //   console.log('❌ Error cambio contraseña:', error);

  //   if (error) {
  //     throw new Error(
  //       `No se pudo cambiar la contraseña: ${error.message}`
  //     );
  //   }

  //   if (!data?.success) {
  //     throw new Error(
  //       data?.message ||
  //         'No se pudo cambiar la contraseña.'
  //     );
  //   }
  // },

  async changeSellerPassword(
  sellerId: string,
  newPassword: string
  ): Promise<void> {
    console.log(
      'Solicitando cambio de contraseña para vendedor:',
      sellerId
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      '🔐 SESIÓN ANTES DE CAMBIAR PASSWORD:',
      session?.access_token ? 'TOKEN OK' : 'SIN TOKEN'
    );

    console.log(
      '👤 USUARIO AUTENTICADO:',
      session?.user?.email ?? 'SIN USUARIO'
    );

    const { data, error } =
      await supabase.functions.invoke(
        'change-seller-password',
        {
          body: {
            sellerId,
            newPassword,
          },
        }
      );

    console.log('📦 Respuesta cambio contraseña:', data);
    console.log('❌ Error cambio contraseña:', error);

    if (error) {
      throw new Error(
        `No se pudo cambiar la contraseña: ${error.message}`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'No se pudo cambiar la contraseña.'
      );
    }
  },

  async toggleSellerStatus(sellerId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  },
};
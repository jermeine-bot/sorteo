import { supabase } from '../../server/config/supabase';
import { User } from '../types/user';

export interface CreateSellerData {
  name: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  commissionPercentage: number;
}

// Convierte un registro de profiles al tipo User de la aplicación
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  lastName: profile.last_name,
  username: profile.username,
  email: profile.email ?? '',
  role: profile.role,
  phone: profile.phone ?? '',
  active: profile.active ?? true,
  commissionPercentage: Number(
    profile.commission_percentage ?? 0
  ),
  dailySales: 0,
  totalSales: 0,
  createdAt: profile.created_at,
});

export const sellerService = {
  // ============================================================
  // OBTENER VENDEDORES
  // ============================================================
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

    return (data ?? []).map(mapProfileToUser);
  },

  // ============================================================
  // CREAR VENDEDOR
  // ============================================================
  async createSeller(
    sellerData: CreateSellerData
  ): Promise<User> {
    console.log('Creando vendedor mediante Edge Function...');
    console.log('Datos del vendedor:', {
      name: sellerData.name,
      lastName: sellerData.lastName,
      username: sellerData.username,
      email: sellerData.email,
      phone: sellerData.phone,
      commissionPercentage:
        sellerData.commissionPercentage,
      // No mostramos la contraseña en consola
    });

    // Validaciones básicas antes de enviar los datos
    const name = sellerData.name.trim();
    const lastName = sellerData.lastName.trim();
    const username = sellerData.username.trim();
    const email = sellerData.email.trim().toLowerCase();
    const phone = sellerData.phone.trim();
    const password = sellerData.password;
    const commissionPercentage = Number(
      sellerData.commissionPercentage
    );

    if (!name || !lastName || !username || !email || !phone) {
      throw new Error(
        'Todos los campos obligatorios deben estar completos.'
      );
    }

    if (password.length < 6) {
      throw new Error(
        'La contraseña debe tener al menos 6 caracteres.'
      );
    }

    if (
      !Number.isFinite(commissionPercentage) ||
      commissionPercentage < 0 ||
      commissionPercentage > 50
    ) {
      throw new Error(
        'El porcentaje de comisión debe estar entre 0% y 50%.'
      );
    }

    // Llamamos a la Edge Function.
    // La función será la encargada de:
    // 1. Verificar que el usuario actual sea ADMIN.
    // 2. Crear el usuario en Supabase Auth.
    // 3. Crear su registro en profiles.
    const { data, error } =
      await supabase.functions.invoke(
        'create-seller',
        {
          body: {
            name,
            lastName,
            username,
            email,
            phone,
            password,
            commissionPercentage,
          },
        }
      );

    console.log(
      '📦 Respuesta creación vendedor:',
      data
    );

    console.log(
      '❌ Error creación vendedor:',
      error
    );

    if (error) {
      console.log(
        '🔴 Error en Edge Function create-seller:',
        error
      );
      console.log('🔴 Nombre del error:', error.name);
      console.log('🔴 Mensaje:', error.message);
      console.log('🔴 Contexto:', error.context);

      if (error.context) {
        try {
          const responseBody = await error.context.text();

          console.log(
            '🔴 RESPUESTA REAL DE CREATE-SELLER:',
            responseBody
          );
        } catch (readError) {
          console.log(
            '⚠️ No se pudo leer la respuesta de la Edge Function:',
            readError
          );
        }
      }

      throw new Error(
        `No se pudo crear el vendedor: ${error.message}`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'No se pudo crear el vendedor.'
      );
    }

    if (!data?.seller) {
      throw new Error(
        'El vendedor fue creado, pero no se recibió su información.'
      );
    }

    console.log(
      '✅ Vendedor creado correctamente:',
      data.seller
    );

    return mapProfileToUser(data.seller);
  },

  // ============================================================
  // EDITAR VENDEDOR
  // ============================================================
  async updateSeller(
    sellerId: string,
    sellerData: {
      name: string;
      lastName: string;
      username: string;
      email: string;
      phone: string;
      commissionPercentage: number;
    }
  ): Promise<User> {
    console.log(
      'Actualizando vendedor mediante Edge Function:',
      sellerId
    );

    // Limpiamos y normalizamos los datos antes de enviarlos.
    const name = sellerData.name.trim();
    const lastName = sellerData.lastName.trim();
    const username = sellerData.username.trim();
    const email = sellerData.email.trim().toLowerCase();
    const phone = sellerData.phone.trim();
    const commissionPercentage = Number(
      sellerData.commissionPercentage
    );

    console.log('📤 Datos enviados a update-seller:', {
      name,
      lastName,
      username,
      email,
      phone,
      commissionPercentage,
    });

    // Validaciones básicas del lado del cliente.
    // La Edge Function también debe validarlos del lado del servidor.
    if (!name || !lastName || !username || !email || !phone) {
      throw new Error(
        'Todos los campos obligatorios deben estar completos.'
      );
    }

    if (
      !Number.isFinite(commissionPercentage) ||
      commissionPercentage < 0 ||
      commissionPercentage > 50
    ) {
      throw new Error(
        'El porcentaje de comisión debe estar entre 0% y 50%.'
      );
    }

    // La Edge Function update-seller será responsable de:
    // 1. Verificar que el usuario actual sea ADMIN.
    // 2. Verificar que el usuario objetivo sea SELLER.
    // 3. Validar los datos.
    // 4. Actualizar auth.users.email.
    // 5. Actualizar profiles.email y demás datos.
    // 6. Mantener ambos correos sincronizados.
    const { data, error } =
      await supabase.functions.invoke(
        'update-seller',
        {
          body: {
            sellerId,
            name,
            lastName,
            username,
            email,
            phone,
            commissionPercentage,
          },
        }
      );

    console.log(
      '📦 Respuesta actualización vendedor:',
      data
    );

    console.log(
      '❌ Error actualización vendedor:',
      error
    );

    if (error) {
      console.log(
        '🔴 Error en Edge Function update-seller:',
        error
      );
      console.log(
        '🔴 Nombre del error:',
        error.name
      );
      console.log(
        '🔴 Mensaje:',
        error.message
      );
      console.log(
        '🔴 Contexto:',
        error.context
      );

      // Intentamos leer el cuerpo real que devolvió
      // la Edge Function.
      if (error.context) {
        try {
          const responseBody =
            await error.context.text();

          console.log(
            '🔴 RESPUESTA REAL DE UPDATE-SELLER:',
            responseBody
          );
        } catch (readError) {
          console.log(
            '⚠️ No se pudo leer la respuesta de la Edge Function:',
            readError
          );
        }
      }

      throw new Error(
        `No se pudo actualizar el vendedor: ${error.message}`
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'No se pudo actualizar el vendedor.'
      );
    }

    if (!data?.seller) {
      throw new Error(
        'El vendedor fue actualizado, pero no se recibió su información.'
      );
    }

    console.log(
      '✅ Vendedor actualizado correctamente:',
      data.seller
    );

    return mapProfileToUser(data.seller);
  },

  // ============================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================
  async changeSellerPassword(
    sellerId: string,
    newPassword: string
  ): Promise<void> {
    console.log(
      'Solicitando cambio de contraseña para vendedor:',
      sellerId
    );

    const {
      data: sessionData,
    } = await supabase.auth.getSession();

    console.log(
      '🔐 SESIÓN ANTES DE CAMBIAR PASSWORD:',
      sessionData.session?.access_token
        ? 'TOKEN OK'
        : 'NO HAY TOKEN'
    );

    console.log(
      '👤 USUARIO AUTENTICADO:',
      sessionData.session?.user?.email
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

    console.log(
      '📦 Respuesta cambio contraseña:',
      data
    );

    console.log(
      '❌ Error cambio contraseña:',
      error
    );

    if (error) {
      console.log(
        '🔴 ERROR NAME:',
        error.name
      );

      console.log(
        '🔴 ERROR MESSAGE:',
        error.message
      );

      console.log(
        '🔴 ERROR CONTEXT:',
        error.context
      );

      // Intentamos leer el cuerpo real
      // que devolvió la Edge Function
      if (error.context) {
        try {
          const responseBody =
            await error.context.text();

          console.log(
            '🔴 RESPUESTA REAL DE EDGE FUNCTION:',
            responseBody
          );
        } catch (readError) {
          console.log(
            '⚠️ No se pudo leer el cuerpo del error:',
            readError
          );
        }
      }

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

    console.log(
      '✅ Contraseña del vendedor actualizada correctamente'
    );
  },

  // ============================================================
  // ACTIVAR / DESACTIVAR VENDEDOR
  // ============================================================
  async toggleSellerStatus(
    sellerId: string
  ): Promise<boolean> {
    console.log(
      'Cambiando estado del vendedor:',
      sellerId
    );

    const { data: seller, error: getError } =
      await supabase
        .from('profiles')
        .select('active')
        .eq('id', sellerId)
        .eq('role', 'SELLER')
        .single();

    if (getError) {
      throw new Error(
        `No se pudo consultar el vendedor: ${getError.message}`
      );
    }

    if (!seller) {
      throw new Error(
        'No se encontró el vendedor.'
      );
    }

    const newStatus = !seller.active;

    const { error: updateError } =
      await supabase
        .from('profiles')
        .update({
          active: newStatus,
        })
        .eq('id', sellerId)
        .eq('role', 'SELLER');

    if (updateError) {
      throw new Error(
        `No se pudo cambiar el estado del vendedor: ${updateError.message}`
      );
    }

    console.log(
      '✅ Nuevo estado del vendedor:',
      newStatus
    );

    return newStatus;
  },
};


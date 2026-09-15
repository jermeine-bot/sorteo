import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceRoleKey = Deno.env.get(
  'SUPABASE_SERVICE_ROLE_KEY'
)!;

// --------------------------------------------------
// Cliente para validar al usuario autenticado
// --------------------------------------------------

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// --------------------------------------------------
// Cliente administrativo
// --------------------------------------------------

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// --------------------------------------------------
// CORS
// --------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// --------------------------------------------------
// Respuesta JSON
// --------------------------------------------------

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders,
    }
  );
}

// --------------------------------------------------
// Edge Function
// --------------------------------------------------

Deno.serve(async (req: Request) => {
  // --------------------------------------------------
  // 1. CORS
  // --------------------------------------------------

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  // --------------------------------------------------
  // 2. Validar método
  // --------------------------------------------------

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        success: false,
        message: 'Método no permitido.',
      },
      405
    );
  }

  try {
    // --------------------------------------------------
    // 3. Obtener Authorization
    // --------------------------------------------------

    const authorizationHeader =
      req.headers.get('Authorization');

    if (!authorizationHeader) {
      return jsonResponse(
        {
          success: false,
          message:
            'No se recibió el token de autenticación.',
        },
        401
      );
    }

    const token = authorizationHeader
      .replace('Bearer ', '')
      .trim();

    if (!token) {
      return jsonResponse(
        {
          success: false,
          message:
            'El token de autenticación está vacío.',
        },
        401
      );
    }

    // --------------------------------------------------
    // 4. Validar usuario autenticado
    // --------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error(
        'Error validando usuario autenticado:',
        userError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'La sesión no es válida o ha expirado.',
        },
        401
      );
    }

    const adminUserId = user.id;

    // --------------------------------------------------
    // 5. Verificar que sea ADMIN activo
    // --------------------------------------------------

    const {
      data: adminProfile,
      error: adminError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id, role, active')
      .eq('id', adminUserId)
      .single();

    if (adminError || !adminProfile) {
      console.error(
        'Error obteniendo perfil administrador:',
        adminError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No se encontró el perfil del administrador.',
        },
        403
      );
    }

    if (
      adminProfile.role !== 'ADMIN' ||
      !adminProfile.active
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'No tienes permisos para realizar esta operación.',
        },
        403
      );
    }

    // --------------------------------------------------
    // 6. Leer body
    // --------------------------------------------------

    let body: {
      sellerId?: unknown;
      name?: unknown;
      lastName?: unknown;
      username?: unknown;
      email?: unknown;
      phone?: unknown;
      commissionPercentage?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            'El cuerpo de la solicitud no es válido.',
        },
        400
      );
    }

    // --------------------------------------------------
    // 7. Validar sellerId
    // --------------------------------------------------

    const sellerId = body.sellerId;

    if (
      !sellerId ||
      typeof sellerId !== 'string'
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'El identificador del vendedor es obligatorio.',
        },
        400
      );
    }

    // --------------------------------------------------
    // 8. Validar campos
    // --------------------------------------------------

    if (
      typeof body.name !== 'string' ||
      typeof body.lastName !== 'string' ||
      typeof body.username !== 'string' ||
      typeof body.email !== 'string' ||
      typeof body.phone !== 'string'
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'Los datos del vendedor no son válidos.',
        },
        400
      );
    }

    const name = body.name.trim();
    const lastName = body.lastName.trim();
    const username = body.username.trim();
    const email = body.email.trim().toLowerCase();
    const phone = body.phone.trim();

    const commissionPercentage = Number(
      body.commissionPercentage
    );

    // --------------------------------------------------
    // 9. Validaciones específicas
    // --------------------------------------------------

    if (name.length < 2) {
      return jsonResponse(
        {
          success: false,
          message:
            'El nombre debe tener al menos 2 caracteres.',
        },
        400
      );
    }

    if (lastName.length < 2) {
      return jsonResponse(
        {
          success: false,
          message:
            'El apellido debe tener al menos 2 caracteres.',
        },
        400
      );
    }

    if (username.length < 3) {
      return jsonResponse(
        {
          success: false,
          message:
            'El usuario debe tener al menos 3 caracteres.',
        },
        400
      );
    }

    // Validación básica del correo
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return jsonResponse(
        {
          success: false,
          message:
            'El correo electrónico no es válido.',
        },
        400
      );
    }

    if (phone.length < 8) {
      return jsonResponse(
        {
          success: false,
          message:
            'El teléfono debe ser válido.',
        },
        400
      );
    }

    if (
      !Number.isFinite(commissionPercentage) ||
      commissionPercentage < 0 ||
      commissionPercentage > 50
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'El porcentaje de comisión debe estar entre 0% y 50%.',
        },
        400
      );
    }

    // --------------------------------------------------
    // 10. Obtener vendedor actual
    // --------------------------------------------------

    const {
      data: sellerProfile,
      error: sellerError,
    } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, name, last_name, username, email, phone, active, commission_percentage, role'
      )
      .eq('id', sellerId)
      .single();

    if (sellerError || !sellerProfile) {
      console.error(
        'Error obteniendo vendedor:',
        sellerError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No se encontró el vendedor.',
        },
        404
      );
    }

    // --------------------------------------------------
    // 11. Confirmar que sea SELLER
    // --------------------------------------------------

    if (sellerProfile.role !== 'SELLER') {
      return jsonResponse(
        {
          success: false,
          message:
            'El usuario seleccionado no es un vendedor.',
        },
        400
      );
    }

    // --------------------------------------------------
    // 12. Verificar username único
    // --------------------------------------------------

    const {
      data: usernameExists,
      error: usernameError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', sellerId)
      .maybeSingle();

    if (usernameError) {
      console.error(
        'Error verificando username:',
        usernameError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No se pudo verificar el nombre de usuario.',
        },
        500
      );
    }

    if (usernameExists) {
      return jsonResponse(
        {
          success: false,
          message:
            'El nombre de usuario ya está registrado.',
        },
        409
      );
    }

    // --------------------------------------------------
    // 13. Obtener correo actual de Supabase Auth
    // --------------------------------------------------

    const {
      data: authUserData,
      error: authUserError,
    } =
      await supabaseAdmin.auth.admin.getUserById(
        sellerId
      );

    if (
      authUserError ||
      !authUserData?.user
    ) {
      console.error(
        'Error obteniendo usuario de Auth:',
        authUserError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No se pudo obtener el usuario de autenticación.',
        },
        500
      );
    }

    const currentAuthEmail =
      authUserData.user.email ?? '';

    // --------------------------------------------------
    // 14. Actualizar correo en Supabase Auth
    //    solamente si realmente cambió
    // --------------------------------------------------

    const emailChanged =
      currentAuthEmail.toLowerCase() !== email;

    if (emailChanged) {
      console.log(
        'Actualizando correo de Supabase Auth:',
        {
          sellerId,
          oldEmail: currentAuthEmail,
          newEmail: email,
        }
      );

      const {
        error: authEmailError,
      } =
        await supabaseAdmin.auth.admin.updateUserById(
          sellerId,
          {
            email,
            email_confirm: true,
          }
        );

      if (authEmailError) {
        console.error(
          'Error actualizando correo en Auth:',
          authEmailError
        );

        return jsonResponse(
          {
            success: false,
            message:
              'No se pudo actualizar el correo electrónico en Supabase Auth.',
          },
          400
        );
      }
    }

    // --------------------------------------------------
    // 15. Actualizar perfil
    // --------------------------------------------------

    const {
      data: updatedProfile,
      error: profileUpdateError,
    } =
      await supabaseAdmin
        .from('profiles')
        .update({
          name,
          last_name: lastName,
          username,
          email,
          phone,
          commission_percentage:
            commissionPercentage,
        })
        .eq('id', sellerId)
        .eq('role', 'SELLER')
        .select('*')
        .single();

    if (
  profileUpdateError ||
  !updatedProfile
) {
  console.error(
    '❌ ERROR ACTUALIZANDO PROFILES:',
    profileUpdateError
  );

  console.error(
    '❌ Código:',
    profileUpdateError?.code
  );

  console.error(
    '❌ Mensaje:',
    profileUpdateError?.message
  );

  console.error(
    '❌ Detalles:',
    profileUpdateError?.details
  );

  console.error(
    '❌ Hint:',
    profileUpdateError?.hint
  );

  // --------------------------------------------------
  // Rollback del correo de Auth
  // --------------------------------------------------

  if (emailChanged) {
    console.log(
      '🔄 Intentando rollback del correo de Auth...'
    );

    const {
      error: rollbackError,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        sellerId,
        {
          email: currentAuthEmail,
          email_confirm: true,
        }
      );

    if (rollbackError) {
      console.error(
        '❌ ERROR CRÍTICO: no se pudo hacer rollback del correo de Auth:',
        rollbackError
      );
    } else {
      console.log(
        '✅ Rollback del correo realizado correctamente.'
      );
    }
  }

  return jsonResponse(
    {
      success: false,
      message:
        'No se pudo actualizar la información del vendedor.',
      error: profileUpdateError?.message ?? 'Error desconocido.',
      code: profileUpdateError?.code ?? null,
      details: profileUpdateError?.details ?? null,
      hint: profileUpdateError?.hint ?? null,
    },
    500
  );
}
    

    // --------------------------------------------------
    // 17. Respuesta exitosa
    // --------------------------------------------------

    console.log(
      '✅ Vendedor actualizado correctamente:',
      updatedProfile
    );

    return jsonResponse({
      success: true,
      message:
        'El vendedor fue actualizado correctamente.',
      seller: updatedProfile,
    });
  } catch (error) {
    console.error(
      'Error inesperado en update-seller:',
      error
    );

    return jsonResponse(
      {
        success: false,
        message:
          'Ocurrió un error inesperado.',
      },
      500
    );
  }
});
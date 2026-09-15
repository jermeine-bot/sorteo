import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get(
  'SUPABASE_SERVICE_ROLE_KEY'
)!;

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

Deno.serve(async (req) => {
  // ============================================================
  // CORS
  // ============================================================
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Método no permitido.',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    // ============================================================
    // 1. OBTENER TOKEN DEL ADMIN
    // ============================================================
    const authHeader =
      req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'No se proporcionó el token de autenticación.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const token = authHeader.replace(
      'Bearer ',
      ''
    ).trim();

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'Token de autenticación inválido.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // ============================================================
    // 2. VERIFICAR USUARIO AUTENTICADO
    // ============================================================
    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user) {
      console.error(
        'Error verificando usuario:',
        userError
      );

      return new Response(
        JSON.stringify({
          success: false,
          message:
            'La sesión no es válida o ha expirado.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const authenticatedUser =
      userData.user;

    console.log(
      '👤 Usuario autenticado:',
      authenticatedUser.email
    );

    // ============================================================
    // 3. VERIFICAR QUE EL USUARIO SEA ADMIN
    // ============================================================
    const {
      data: adminProfile,
      error: profileError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', authenticatedUser.id)
      .single();

    if (profileError || !adminProfile) {
      console.error(
        'Error obteniendo perfil del usuario:',
        profileError
      );

      return new Response(
        JSON.stringify({
          success: false,
          message:
            'No se encontró el perfil del usuario autenticado.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (adminProfile.role !== 'ADMIN') {
      console.warn(
        '🚫 Intento no autorizado de crear vendedor:',
        authenticatedUser.id
      );

      return new Response(
        JSON.stringify({
          success: false,
          message:
            'No tienes permisos para crear vendedores.',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(
      '✅ Usuario autorizado como ADMIN'
    );

    // ============================================================
    // 4. LEER DATOS DEL VENDEDOR
    // ============================================================
    const body = await req.json();

    const {
      name,
      lastName,
      username,
      email,
      phone,
      password,
      commissionPercentage,
    } = body;

    // ============================================================
    // 5. VALIDACIONES
    // ============================================================
    if (
      typeof name !== 'string' ||
      typeof lastName !== 'string' ||
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof password !== 'string'
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'Los datos enviados no son válidos.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const cleanName = name.trim();
    const cleanLastName =
      lastName.trim();
    const cleanUsername =
      username.trim();
    const cleanEmail =
      email.trim().toLowerCase();
    const cleanPhone =
      phone.trim();

    const cleanCommission =
      Number(commissionPercentage);

    if (
      !cleanName ||
      !cleanLastName ||
      !cleanUsername ||
      !cleanEmail ||
      !cleanPhone
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'Todos los campos obligatorios deben estar completos.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (cleanName.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El nombre debe tener al menos 2 caracteres.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (cleanLastName.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El apellido debe tener al menos 2 caracteres.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (cleanUsername.length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El nombre de usuario debe tener al menos 3 caracteres.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validación básica de email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El correo electrónico no es válido.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'La contraseña debe tener al menos 6 caracteres.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (
      !Number.isFinite(cleanCommission) ||
      cleanCommission < 0 ||
      cleanCommission > 50
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El porcentaje de comisión debe estar entre 0% y 50%.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // ============================================================
    // 6. COMPROBAR USERNAME DUPLICADO
    // ============================================================
    const {
      data: existingUsername,
      error: usernameError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (usernameError) {
      console.error(
        'Error comprobando username:',
        usernameError
      );

      return new Response(
        JSON.stringify({
          success: false,
          message:
            'No se pudo comprobar el nombre de usuario.',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (existingUsername) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'El nombre de usuario ya está registrado.',
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // ============================================================
    // 7. CREAR USUARIO EN SUPABASE AUTH
    // ============================================================
    console.log(
      'Creando usuario Auth:',
      cleanEmail
    );

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          last_name: cleanLastName,
          username: cleanUsername,
          phone: cleanPhone,
          role: 'SELLER',
        },
      });

    if (authError || !authData.user) {
      console.error(
        'Error creando usuario Auth:',
        authError
      );

      let message =
        'No se pudo crear el usuario.';

      if (
        authError?.message
          ?.toLowerCase()
          .includes('already')
      ) {
        message =
          'El correo electrónico ya está registrado.';
      }

      return new Response(
        JSON.stringify({
          success: false,
          message,
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const newUser =
      authData.user;

    console.log(
      '✅ Usuario Auth creado:',
      newUser.id
    );

    // ============================================================
    // 8. CREAR PROFILE DEL VENDEDOR
    // ============================================================
    const {
      data: newProfile,
      error: newProfileError,
    } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.id,
        name: cleanName,
        last_name: cleanLastName,
        username: cleanUsername,
        email: cleanEmail,
        role: 'SELLER',
        phone: cleanPhone,
        active: true,
        commission_percentage:
          cleanCommission,
      })
      .select('*')
      .single();

    // ============================================================
    // 9. ROLLBACK SI FALLA PROFILES
    // ============================================================
    if (newProfileError || !newProfile) {
      console.error(
        '❌ ERROR COMPLETO CREANDO PROFILE:',
        newProfileError
      );

      console.error(
        '❌ Código:',
        newProfileError?.code
      );

      console.error(
        '❌ Mensaje:',
        newProfileError?.message
      );

      console.error(
        '❌ Detalles:',
        newProfileError?.details
      );

      console.error(
        '❌ Hint:',
        newProfileError?.hint
      );

      console.log(
        '🔄 Eliminando usuario Auth para hacer rollback...'
      );

      const {
        error: deleteError,
      } = await supabaseAdmin.auth.admin.deleteUser(
        newUser.id
      );

      if (deleteError) {
        console.error(
          '❌ No se pudo eliminar el usuario Auth durante rollback:',
          deleteError
        );
      } else {
        console.log(
          '✅ Usuario Auth eliminado durante rollback.'
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message:
            'No se pudo crear el perfil del vendedor.',
          error: newProfileError?.message ?? 'Error desconocido',
          code: newProfileError?.code ?? null,
          details: newProfileError?.details ?? null,
          hint: newProfileError?.hint ?? null,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(
      '✅ Profile del vendedor creado correctamente.'
    );

    // ============================================================
    // 10. RESPUESTA
    // ============================================================
    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Vendedor creado correctamente.',
        seller: newProfile,
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      '🔥 Error inesperado en create-seller:',
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        message:
          'Ocurrió un error inesperado al crear el vendedor.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
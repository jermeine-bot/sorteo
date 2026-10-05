import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceRoleKey = Deno.env.get(
  'SUPABASE_SERVICE_ROLE_KEY'
)!;

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

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

    const token = authorizationHeader.replace(
      'Bearer ',
      ''
    ).trim();

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

    let body: {
      sellerId?: unknown;
      newPassword?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: 'El cuerpo de la solicitud no es válido.',
        },
        400
      );
    }

    const sellerId = body.sellerId;
    const newPassword = body.newPassword;

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

    if (
      !newPassword ||
      typeof newPassword !== 'string'
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'La nueva contraseña es obligatoria.',
        },
        400
      );
    }

    const cleanPassword = newPassword.trim();

    if (cleanPassword.length < 6) {
      return jsonResponse(
        {
          success: false,
          message:
            'La contraseña debe tener al menos 6 caracteres.',
        },
        400
      );
    }

    const {
      data: sellerProfile,
      error: sellerError,
    } = await supabaseAdmin
      .from('profiles')
      .select('id, role, active')
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
          message: 'No se encontró el vendedor.',
        },
        404
      );
    }

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

    const {
      error: passwordError,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        sellerId,
        {
          password: cleanPassword,
        }
      );

    if (passwordError) {
      console.error(
        'Error al actualizar contraseña:',
        passwordError
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No se pudo actualizar la contraseña.',
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message:
        'La contraseña del vendedor fue actualizada correctamente.',
    });
  } catch (error) {
    console.error(
      'Error inesperado en change-seller-password:',
      error
    );

    return jsonResponse(
      {
        success: false,
        message: 'Ocurrió un error inesperado.',
      },
      500
    );
  }
});
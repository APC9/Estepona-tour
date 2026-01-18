import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revokeSession, revokeAllUserSessions } from '@/lib/security/session-manager';
import { z } from 'zod';

/**
 * Schema de validación para revocación de sesión
 */
const RevokeSessionSchema = z.object({
  sessionToken: z.string().optional(),
  revokeAll: z.boolean().optional(),
  reason: z.string().optional(),
});

/**
 * POST /api/auth/revoke
 * 
 * Revoca una o todas las sesiones del usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validation = RevokeSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sessionToken, revokeAll, reason } = validation.data;

    // Revocar todas las sesiones
    if (revokeAll) {
      await revokeAllUserSessions(
        session.user.id,
        reason || 'Revocación manual por el usuario'
      );

      return NextResponse.json({
        success: true,
        message: 'Todas las sesiones han sido revocadas',
      });
    }

    // Revocar sesión específica
    if (sessionToken) {
      await revokeSession(
        sessionToken,
        reason || 'Revocación manual por el usuario'
      );

      return NextResponse.json({
        success: true,
        message: 'Sesión revocada exitosamente',
      });
    }

    return NextResponse.json(
      { error: 'Debes especificar sessionToken o revokeAll' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json(
      { error: 'Error al revocar sesión' },
      { status: 500 }
    );
  }
}

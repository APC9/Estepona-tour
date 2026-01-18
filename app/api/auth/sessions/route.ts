import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserActiveSessions } from '@/lib/security/session-manager';

/**
 * GET /api/auth/sessions
 * 
 * Obtiene todas las sesiones activas del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener sesiones activas
    const activeSessions = await getUserActiveSessions(session.user.id);

    // Ocultar parte del session token por seguridad
    const safeSessions = activeSessions.map((s) => ({
      ...s,
      sessionToken: s.sessionToken.substring(0, 8) + '...' + s.sessionToken.slice(-4),
      isCurrent: s.sessionToken === (session.user as any).sessionToken,
    }));

    return NextResponse.json({
      success: true,
      sessions: safeSessions,
      total: safeSessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}

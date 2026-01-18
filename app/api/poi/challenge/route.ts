import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateVisitChallenge } from '@/lib/security/poi-validation';

/**
 * POST /api/poi/challenge
 * 
 * Genera un challenge único para iniciar el proceso de escaneo NFC
 * El challenge debe ser usado dentro de 1 minuto
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Generar challenge
    const challenge = await generateVisitChallenge(session.user.id);

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      { error: 'Error al generar challenge' },
      { status: 500 }
    );
  }
}

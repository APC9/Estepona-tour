import { NextRequest, NextResponse } from 'next/server';
import { getRewardsConfig } from '@/lib/rewards';

/**
 * GET /api/rewards/config
 * Obtiene la configuración pública de premios
 */
export async function GET(req: NextRequest) {
  try {
    const config = await getRewardsConfig();
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener configuración de premios:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

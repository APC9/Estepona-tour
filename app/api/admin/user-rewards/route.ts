import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/user-rewards
 * Obtiene todas las solicitudes de premios
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true },
    });

    if (!user?.isAdmin || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener todos los premios reclamados
    const rewards = await prisma.userReward.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            totalPoints: true,
          },
        },
      },
      orderBy: {
        claimedAt: 'desc',
      },
    });

    return NextResponse.json({ rewards }, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener premios:', error);
    return NextResponse.json(
      { error: 'Error al obtener premios' },
      { status: 500 }
    );
  }
}

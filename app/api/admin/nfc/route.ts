import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si es admin
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Obtener todos los POIs con contador de visitas
    const pois = await prisma.pOI.findMany({
      select: {
        id: true,
        nfcUid: true,
        nameEs: true,
        category: true,
        points: true,
        xpReward: true,
        isActive: true,
        _count: {
          select: {
            visits: true,
          },
        },
      },
      orderBy: {
        nameEs: 'asc',
      },
    });

    return NextResponse.json({ pois });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

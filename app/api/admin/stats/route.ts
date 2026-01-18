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

    // Verificar si es admin (solo usando email)
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Obtener estadísticas
    const [totalPOIs, totalUsers, visits] = await Promise.all([
      prisma.pOI.count(),
      prisma.user.count(),
      prisma.visit.findMany({
        include: {
          poi: true,
          user: true,
        },
        orderBy: {
          scannedAt: 'desc',
        },
        take: 100,
      }),
    ]);

    // Calcular escaneos totales
    const totalScans = visits.length;

    // Usuarios activos hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await prisma.visit.groupBy({
      by: ['userId'],
      where: {
        scannedAt: {
          gte: today,
        },
      },
    });

    // Top POIs por visitas
    const poiVisits = visits.reduce((acc, visit) => {
      const poiId = visit.poiId;
      if (!acc[poiId]) {
        acc[poiId] = {
          id: visit.poi.id,
          name: visit.poi.nameEs,
          scans: 0,
        };
      }
      acc[poiId].scans += 1;
      return acc;
    }, {} as Record<string, { id: string; name: string; scans: number }>);

    const topPOIs = Object.values(poiVisits)
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5);

    // Escaneos recientes
    const recentScans = visits.slice(0, 10).map((visit) => ({
      id: visit.id,
      poiName: visit.poi.nameEs,
      userName: visit.user.name || visit.user.email || 'Usuario',
      timestamp: visit.scannedAt.toISOString(),
    }));

    return NextResponse.json({
      totalPOIs,
      totalScans,
      totalUsers,
      activeToday: activeToday.length,
      topPOIs,
      recentScans,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'all';

    // Calcular fecha de inicio según el rango
    let startDate: Date | undefined;
    const now = new Date();

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = undefined;
    }

    // Construir filtro de fecha
    const dateFilter = startDate
      ? {
        scannedAt: {
          gte: startDate,
        },
      }
      : {};

    // Obtener métricas generales
    const [totalScans, uniqueUsers, pointsAndXP] = await Promise.all([
      prisma.visit.count({
        where: dateFilter,
      }),
      prisma.visit.findMany({
        where: dateFilter,
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.visit.aggregate({
        where: dateFilter,
        _sum: {
          pointsEarned: true,
          xpEarned: true,
        },
      }),
    ]);

    // Top POIs más visitados
    const topPOIs = await prisma.pOI.findMany({
      select: {
        id: true,
        nameEs: true,
        category: true,
        _count: {
          select: {
            visits: true,
          },
        },
        visits: {
          where: dateFilter,
          select: {
            pointsEarned: true,
            xpEarned: true,
          },
        },
      },
      orderBy: {
        visits: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Calcular totales por POI
    const topPOIsWithTotals = topPOIs.map((poi) => ({
      id: poi.id,
      nameEs: poi.nameEs,
      category: poi.category,
      _count: poi._count,
      totalPoints: poi.visits.reduce((sum, v) => sum + v.pointsEarned, 0),
      totalXP: poi.visits.reduce((sum, v) => sum + v.xpEarned, 0),
    }));

    // Escaneos recientes
    const recentScans = await prisma.visit.findMany({
      where: dateFilter,
      select: {
        id: true,
        scannedAt: true,
        pointsEarned: true,
        xpEarned: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        poi: {
          select: {
            nameEs: true,
            category: true,
          },
        },
      },
      orderBy: {
        scannedAt: 'desc',
      },
      take: 20,
    });

    // Escaneos por categoría
    const scansByCategory = await prisma.visit.groupBy({
      by: ['poiId'],
      where: dateFilter,
      _count: true,
    });

    const poiCategories = await prisma.pOI.findMany({
      select: { id: true, category: true },
    });

    const categoryMap = new Map(poiCategories.map((p) => [p.id, p.category]));
    const scansByCategoryResult: Record<string, number> = {};

    scansByCategory.forEach((item) => {
      const category = categoryMap.get(item.poiId);
      if (category) {
        scansByCategoryResult[category] = (scansByCategoryResult[category] || 0) + item._count;
      }
    });

    return NextResponse.json({
      totalScans,
      uniqueUsers: uniqueUsers.length,
      totalPointsAwarded: pointsAndXP._sum.pointsEarned || 0,
      totalXPAwarded: pointsAndXP._sum.xpEarned || 0,
      topPOIs: topPOIsWithTotals,
      recentScans,
      scansByCategory: scansByCategoryResult,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

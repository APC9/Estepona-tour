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
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total de visitas en el período
    const visits = await prisma.visit.findMany({
      where: {
        scannedAt: {
          gte: startDate,
        },
      },
      include: {
        user: true,
        poi: true,
      },
    });

    // Usuarios únicos
    const uniqueUsers = new Set(visits.map((v) => v.userId)).size;

    // Visitas por día
    const visitsPerDay: Record<string, number> = {};
    visits.forEach((visit) => {
      const date = visit.scannedAt.toISOString().split('T')[0];
      visitsPerDay[date] = (visitsPerDay[date] || 0) + 1;
    });

    const visitsOverTime = Object.entries(visitsPerDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // POIs por categoría
    const pois = await prisma.pOI.findMany();
    const poiByType: Record<string, number> = {};
    pois.forEach((poi) => {
      poiByType[poi.category] = (poiByType[poi.category] || 0) + 1;
    });

    const poiByTypeArray = Object.entries(poiByType).map(([type, count]) => ({
      type,
      count,
    }));

    // Top usuarios
    const userVisits: Record<string, { name: string; visits: number }> = {};
    visits.forEach((visit) => {
      const userId = visit.userId;
      const userName = visit.user.name || visit.user.email || 'Usuario';
      if (!userVisits[userId]) {
        userVisits[userId] = { name: userName, visits: 0 };
      }
      userVisits[userId].visits += 1;
    });

    const topUsers = Object.values(userVisits)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // Stats totales
    const totalStats = {
      totalVisits: visits.length,
      uniqueUsers,
      avgVisitsPerUser: uniqueUsers > 0 ? visits.length / uniqueUsers : 0,
      avgVisitsPerPOI: pois.length > 0 ? visits.length / pois.length : 0,
    };

    return NextResponse.json({
      visitsOverTime,
      poiByType: poiByTypeArray,
      topUsers,
      totalStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

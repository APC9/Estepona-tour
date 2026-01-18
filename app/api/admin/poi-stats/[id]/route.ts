import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener estadísticas del POI
    const visitCount = await prisma.visit.count({
      where: { poiId: id },
    });

    const recentVisits = await prisma.visit.findMany({
      where: { poiId: id },
      include: { user: true },
      orderBy: { scannedAt: 'desc' },
      take: 10,
    });

    // Visitas por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visitsOverTime = await prisma.visit.findMany({
      where: {
        poiId: id,
        scannedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        scannedAt: true,
      },
    });

    return NextResponse.json({
      visitCount,
      recentVisits: recentVisits.map((v) => ({
        id: v.id,
        userName: v.user.name || v.user.email || 'Usuario',
        timestamp: v.scannedAt.toISOString(),
      })),
      visitsOverTime: visitsOverTime.map((v) => ({
        date: v.scannedAt.toISOString().split('T')[0],
        count: 1,
      })),
    });
  } catch (error) {
    console.error('Error fetching POI stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

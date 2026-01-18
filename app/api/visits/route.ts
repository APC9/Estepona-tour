import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/visits
 * Obtener todas las visitas del usuario autenticado
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const visits = await prisma.visit.findMany({
      where: { userId: user.id },
      include: {
        poi: {
          select: {
            id: true,
            nameEs: true,
            nameEn: true,
            category: true,
          },
        },
      },
      orderBy: {
        scannedAt: 'desc',
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visits
 * Registrar visita a un POI (escaneo NFC/QR)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { poiId, nfcUid, latitude, longitude, deviceInfo } = data;

    // Validar que se proporcione poiId o nfcUid
    if (!poiId && !nfcUid) {
      return NextResponse.json(
        { success: false, error: 'Se requiere poiId o nfcUid' },
        { status: 400 }
      );
    }

    // Buscar POI
    const poi = await prisma.pOI.findFirst({
      where: poiId ? { id: poiId } : { nfcUid },
    });

    if (!poi) {
      return NextResponse.json(
        { success: false, error: 'POI no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si es premium y el usuario tiene acceso
    if (poi.premiumOnly && session.user.tier === 'FREE') {
      return NextResponse.json(
        { success: false, error: 'Contenido premium - Actualiza tu plan' },
        { status: 403 }
      );
    }

    // Validar proximidad si se proporciona ubicación
    if (latitude && longitude) {
      const distance = calculateDistance(latitude, longitude, poi.lat, poi.lng);
      const proximityThreshold = parseInt(process.env.NEXT_PUBLIC_PROXIMITY_THRESHOLD_METERS || '50');

      if (distance > proximityThreshold) {
        return NextResponse.json(
          {
            success: false,
            error: `Debes estar a menos de ${proximityThreshold}m del POI (estás a ${Math.round(distance)}m)`
          },
          { status: 400 }
        );
      }
    }

    // Verificar si ya visitó este POI
    const existingVisit = await prisma.visit.findUnique({
      where: {
        userId_poiId: {
          userId: session.user.id,
          poiId: poi.id,
        },
      },
    });

    if (existingVisit) {
      return NextResponse.json(
        { success: false, error: 'Ya has visitado este POI' },
        { status: 400 }
      );
    }

    // Crear visita
    const visit = await prisma.visit.create({
      data: {
        userId: session.user.id,
        poiId: poi.id,
        pointsEarned: poi.points,
        xpEarned: poi.xpReward,
        latitude,
        longitude,
        deviceInfo,
      },
    });

    // Actualizar puntos y XP del usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPoints: { increment: poi.points },
        experiencePoints: { increment: poi.xpReward },
      },
    });

    // Calcular nuevo nivel
    const newLevel = Math.floor(Math.sqrt(updatedUser.experiencePoints / 100)) + 1;
    const leveledUp = newLevel > updatedUser.level;

    if (leveledUp) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { level: newLevel },
      });
    }

    // Verificar logros/badges
    await checkAndUnlockBadges(session.user.id);

    // Webhook a n8n
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/poi-visited`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            poiId: poi.id,
            poiName: poi.nameEs,
            points: poi.points,
            xp: poi.xpReward,
            leveledUp,
            newLevel,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Error sending webhook:', error);
      }
    }

    return NextResponse.json({
      success: true,
      visit,
      rewards: {
        points: poi.points,
        xp: poi.xpReward,
        leveledUp,
        newLevel: leveledUp ? newLevel : updatedUser.level,
      },
    });
  } catch (error) {
    console.error('Error registering visit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar visita' },
      { status: 500 }
    );
  }
}

// Helper: Calcular distancia entre dos coordenadas (fórmula Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper: Verificar y desbloquear badges
async function checkAndUnlockBadges(userId: string) {
  // Obtener badges disponibles
  const badges = await prisma.badge.findMany({
    where: { isActive: true },
  });

  // Obtener visitas del usuario
  const visits = await prisma.visit.findMany({
    where: { userId },
    include: { poi: true },
  });

  for (const badge of badges) {
    // Verificar si ya tiene este badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) continue;

    // Evaluar requisitos (ejemplo simple)
    const requirement = badge.requirement as Record<string, number | string>;
    let unlocked = false;

    if (requirement.type === 'visits_count') {
      const count = visits.filter((v) =>
        requirement.category ? v.poi.category === requirement.category : true
      ).length;
      unlocked = count >= Number(requirement.value);
    }

    // Desbloquear badge
    if (unlocked) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });
    }
  }
}

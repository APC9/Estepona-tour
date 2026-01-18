import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateProximity, detectSuspiciousPatterns } from '@/lib/security/geovalidation';
import { rateLimitScan, rateLimitUser, getRateLimitHeaders } from '@/lib/security/ratelimit';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nfcUid: string }> }
) {
  try {
    const { nfcUid } = await context.params;
    console.log('🔍 Scan request received:', { nfcUid, url: req.url });

    const session = await getServerSession(authOptions);
    console.log('🔐 Session status:', session ? 'Authenticated' : 'Not authenticated', session?.user?.email);

    if (!session?.user?.email) {
      console.log('❌ Unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude } = body;
    console.log('📍 Location received:', { latitude, longitude });

    // 🔒 SECURITY: Rate limiting por usuario
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔒 SECURITY: Rate limiting - máximo 10 scans por minuto
    const userRateLimit = await rateLimitUser(user.id);
    if (!userRateLimit.success) {
      console.log('⚠️ Rate limit exceeded for user:', user.id);

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'RATE_LIMIT_EXCEEDED',
          severity: 'MEDIUM',
          details: { endpoint: '/api/scan', limit: 'user' },
          ipAddress: clientIP,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      });

      const headers = getRateLimitHeaders(userRateLimit);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before scanning again.' },
        { status: 429, headers }
      );
    }

    // Buscar POI por NFC UID
    const poi = await prisma.pOI.findUnique({
      where: { nfcUid },
    });

    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    // 🔒 SECURITY: Rate limiting - 1 scan por POI cada 24 horas
    const scanRateLimit = await rateLimitScan(user.id, poi.id);
    if (!scanRateLimit.success) {
      console.log('⚠️ POI scan rate limit exceeded:', { userId: user.id, poiId: poi.id });

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'POI_SCAN_COOLDOWN',
          severity: 'LOW',
          details: { poiId: poi.id, cooldown: '24h' },
          ipAddress: clientIP,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      });

      const headers = getRateLimitHeaders(scanRateLimit);
      return NextResponse.json(
        { error: 'You can only scan this POI once every 24 hours.' },
        { status: 429, headers }
      );
    }

    // 🔒 SECURITY: Validar GPS - proximidad al POI
    const gpsValidation = await validateProximity(
      user.id,
      { lat: poi.lat, lng: poi.lng },
      { latitude, longitude },
      nfcUid,
      prisma
    );

    if (!gpsValidation.isValid) {
      console.log('⚠️ GPS validation failed:', gpsValidation.reason);

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'GPS_VALIDATION_FAILED',
          severity: gpsValidation.reason === 'SUSPICIOUS_PATTERN' ? 'HIGH' : 'MEDIUM',
          details: {
            reason: gpsValidation.reason,
            distance: gpsValidation.distance,
            poiId: poi.id,
            coordinates: { latitude, longitude },
          },
          ipAddress: clientIP,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      });

      return NextResponse.json(
        {
          error: 'GPS validation failed. Please ensure you are at the POI location.',
          reason: gpsValidation.reason,
          distance: gpsValidation.distance,
        },
        { status: 403 }
      );
    }

    // 🔒 SECURITY: Detectar patrones sospechosos
    const suspiciousCheck = await detectSuspiciousPatterns(user.id, prisma);
    if (suspiciousCheck.isSuspicious) {
      console.log('⚠️ Suspicious pattern detected:', suspiciousCheck.reason);

      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'SUSPICIOUS_PATTERN_DETECTED',
          severity: 'HIGH',
          details: {
            reason: suspiciousCheck.reason,
            pattern: suspiciousCheck.pattern,
          },
          ipAddress: clientIP,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      });

      // No bloquear, solo loggear para revisión
    }

    // Verificar si el POI está activo
    if (!poi.isActive) {
      return NextResponse.json({ error: 'POI is inactive' }, { status: 403 });
    }

    // Verificar si ya visitó este POI
    const existingVisit = await prisma.visit.findUnique({
      where: {
        userId_poiId: {
          userId: user.id,
          poiId: poi.id,
        },
      },
    });

    if (existingVisit) {
      return NextResponse.json(
        {
          error: 'Already visited',
          alreadyVisited: true,
          visit: existingVisit,
        },
        { status: 400 }
      );
    }

    // Verificar si es premium y el usuario tiene acceso
    if (poi.premiumOnly && user.tier === 'FREE') {
      return NextResponse.json(
        { error: 'Premium POI requires subscription' },
        { status: 403 }
      );
    }

    // Crear visita y actualizar usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear visita
      const visit = await tx.visit.create({
        data: {
          userId: user.id,
          poiId: poi.id,
          pointsEarned: poi.points,
          xpEarned: poi.xpReward,
          latitude,
          longitude,
          deviceInfo: req.headers.get('user-agent') || undefined,
        },
      });

      // Actualizar usuario: sumar puntos, XP y calcular nuevo nivel
      const newTotalPoints = user.totalPoints + poi.points;
      const newExperiencePoints = user.experiencePoints + poi.xpReward;

      // Calcular nivel (cada nivel requiere 100 XP más que el anterior)
      let newLevel = user.level;
      let xpForCurrentLevel = newExperiencePoints;
      while (xpForCurrentLevel >= newLevel * 100) {
        xpForCurrentLevel -= newLevel * 100;
        newLevel++;
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          totalPoints: newTotalPoints,
          experiencePoints: newExperiencePoints,
          level: newLevel,
          lastVisitDate: new Date(),
        },
      });

      return { visit, updatedUser };
    });

    return NextResponse.json({
      success: true,
      visit: result.visit,
      user: {
        level: result.updatedUser.level,
        experiencePoints: result.updatedUser.experiencePoints,
        totalPoints: result.updatedUser.totalPoints,
      },
      rewards: {
        points: poi.points,
        xp: poi.xpReward,
      },
      poi: {
        id: poi.id,
        nameEs: poi.nameEs,
        nameEn: poi.nameEn,
        nameFr: poi.nameFr,
        nameDe: poi.nameDe,
        nameIt: poi.nameIt,
        category: poi.category,
      },
    });
  } catch (error) {
    console.error('Error processing NFC scan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/security/api-decorators';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/security/metrics
 * 
 * Obtiene métricas de seguridad para el dashboard de admin
 * 
 * Query params:
 * - range: '24h' | '7d' | '30d'
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    // Calcular fecha de inicio
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // 1. Métricas de Anti-Spoofing
    const totalVisits = await prisma.visitAuditLog.count({
      where: {
        timestamp: { gte: startDate },
      },
    });

    const spoofingAttempts = await prisma.visitAuditLog.count({
      where: {
        timestamp: { gte: startDate },
        confidence: { lt: 50 },
      },
    });

    const avgConfidenceScore = await prisma.visitAuditLog.aggregate({
      where: {
        timestamp: { gte: startDate },
      },
      _avg: {
        confidence: true,
      },
    });

    // Obtener top flags
    const auditLogs = await prisma.visitAuditLog.findMany({
      where: {
        timestamp: { gte: startDate },
      },
      select: {
        flags: true,
      },
    });

    const topFlags: Record<string, number> = {};
    auditLogs.forEach((log) => {
      log.flags.forEach((flag) => {
        topFlags[flag] = (topFlags[flag] || 0) + 1;
      });
    });

    // 2. Métricas de Sesiones
    const activeSessions = await prisma.session.count();

    const suspiciousSessions = await prisma.sessionLog.count({
      where: {
        timestamp: { gte: startDate },
        suspicious: true,
      },
    });

    const revokedToday = await prisma.sessionLog.count({
      where: {
        action: 'REVOKE',
        timestamp: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    // Calcular score sospechoso promedio (simplificado)
    const avgSuspiciousScore = 0; // TODO: Implementar si sessionLog tiene campo suspiciousScore

    // 3. Métricas de Gamification
    const xpAwarded = await prisma.gamificationLog.aggregate({
      where: {
        createdAt: { gte: startDate },
      },
      _sum: {
        xpAwarded: true,
      },
    });

    const cheatingAttempts = await prisma.gamificationLog.count({
      where: {
        createdAt: { gte: startDate },
        suspiciousScore: { gte: 50 },
      },
    });

    const blockedActions = await prisma.gamificationLog.count({
      where: {
        createdAt: { gte: startDate },
        suspiciousScore: { gte: 70 },
      },
    });

    return NextResponse.json({
      // Anti-spoofing
      totalVisits,
      spoofingAttempts,
      avgConfidenceScore: avgConfidenceScore._avg?.confidence || 0,
      topFlags,

      // Sessions
      activeSessions,
      suspiciousSessions,
      revokedToday,
      avgSuspiciousScore,

      // Gamification
      xpAwarded: xpAwarded._sum.xpAwarded || 0,
      cheatingAttempts,
      blockedActions,
    });
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
});

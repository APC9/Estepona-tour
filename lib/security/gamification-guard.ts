/**
 * ANTI-CHEAT GAMIFICATION SYSTEM
 * 
 * ARQUITECTURA:
 * - Todas las reglas de gamificación validadas en servidor
 * - Transacciones atómicas para evitar race conditions
 * - Idempotency keys para evitar duplicados
 * - Detección de patrones anómalos
 * - Rate limiting por tipo de acción
 * - Audit trail completo
 * 
 * PROTECCIONES:
 * - Replay attacks (idempotency)
 * - Time manipulation (server timestamps)
 * - Race conditions (transacciones atómicas)
 * - Impossible journeys (velocidad física)
 * - Bot detection (patrones de comportamiento)
 * - XP/Badge farming (rate limiting)
 * 
 * @module security/gamification-guard
 */

import { prisma } from '@/lib/prisma';
import { calculateDistance } from '@/lib/security/gps-validator';

/**
 * Configuración de XP por acción
 */
const XP_REWARDS: Record<string, number> = {
  VISIT_POI: 10,
  FIRST_VISIT_POI: 25,
  COMPLETE_ROUTE: 50,
  DAILY_STREAK: 15,
  SHARE_CONTENT: 5,
  RATE_POI: 3,
};

/**
 * Cooldowns por acción (milisegundos)
 */
const ACTION_COOLDOWNS: Record<string, number> = {
  VISIT_POI: 5 * 60 * 1000,        // 5 min entre visitas al mismo POI
  RATE_POI: 24 * 60 * 60 * 1000,   // 1 día entre ratings al mismo POI
  SHARE_CONTENT: 60 * 1000,        // 1 min entre shares
};

/**
 * Límites globales por hora
 */
const HOURLY_LIMITS: Record<string, number> = {
  VISIT_POI: 20,
  RATE_POI: 10,
  SHARE_CONTENT: 30,
};

/**
 * Velocidad máxima permitida entre visitas (km/h)
 */
const MAX_TRAVEL_SPEED = 100;

/**
 * Resultado de validación de acción de gamificación
 */
export interface GamificationValidationResult {
  allowed: boolean;
  reason?: string;
  cooldownRemaining?: number;
  suspiciousScore: number;
  flags: string[];
}

/**
 * Información de acción de gamificación
 */
export interface GamificationAction {
  userId: string;
  actionType: string;
  poiId?: string;
  idempotencyKey: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Tipo para coordenadas almacenadas en JSON
 */
interface StoredCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Valida una acción de gamificación antes de ejecutarla
 */
export async function validateGamificationAction(
  action: GamificationAction
): Promise<GamificationValidationResult> {
  const flags: string[] = [];
  let suspiciousScore = 0;

  // 1. Verificar idempotency (evitar duplicados)
  const existing = await prisma.gamificationLog.findUnique({
    where: { idempotencyKey: action.idempotencyKey },
  });

  if (existing) {
    return {
      allowed: false,
      reason: 'Acción ya procesada (idempotency)',
      suspiciousScore: 0,
      flags: ['DUPLICATE_ACTION'],
    };
  }

  // 2. Verificar cooldown individual
  if (action.poiId) {
    const cooldown = ACTION_COOLDOWNS[action.actionType];
    if (cooldown) {
      const lastAction = await prisma.gamificationLog.findFirst({
        where: {
          userId: action.userId,
          actionType: action.actionType,
          poiId: action.poiId,
          createdAt: {
            gte: new Date(Date.now() - cooldown),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastAction) {
        const remaining = cooldown - (Date.now() - lastAction.createdAt.getTime());
        return {
          allowed: false,
          reason: 'Cooldown activo',
          cooldownRemaining: remaining,
          suspiciousScore: 30,
          flags: ['COOLDOWN_VIOLATION'],
        };
      }
    }
  }

  // 3. Verificar límite por hora
  const hourlyLimit = HOURLY_LIMITS[action.actionType];
  if (hourlyLimit) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActions = await prisma.gamificationLog.count({
      where: {
        userId: action.userId,
        actionType: action.actionType,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentActions >= hourlyLimit) {
      flags.push('HOURLY_LIMIT_REACHED');
      suspiciousScore += 40;

      return {
        allowed: false,
        reason: 'Límite por hora alcanzado',
        suspiciousScore,
        flags,
      };
    }

    // Warn si está cerca del límite
    if (recentActions >= hourlyLimit * 0.8) {
      flags.push('APPROACHING_HOURLY_LIMIT');
      suspiciousScore += 20;
    }
  }

  // 4. Detectar impossible journeys (teleporting)
  if (action.coordinates && action.poiId) {
    const lastVisit = await prisma.gamificationLog.findFirst({
      where: {
        userId: action.userId,
        actionType: 'VISIT_POI',
        coordinates: { not: null as never },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        coordinates: true,
        createdAt: true,
      },
    });

    if (lastVisit && lastVisit.coordinates) {
      // Type guard para coordenadas
      const isValidCoordinates = (coords: unknown): coords is StoredCoordinates => {
        return (
          typeof coords === 'object' &&
          coords !== null &&
          'latitude' in coords &&
          'longitude' in coords &&
          typeof (coords as StoredCoordinates).latitude === 'number' &&
          typeof (coords as StoredCoordinates).longitude === 'number'
        );
      };

      if (isValidCoordinates(lastVisit.coordinates)) {
        const timeDiff = Date.now() - lastVisit.createdAt.getTime();
        const timeDiffHours = timeDiff / (1000 * 60 * 60);

        const distance = calculateDistance(
          lastVisit.coordinates.latitude,
          lastVisit.coordinates.longitude,
          action.coordinates.latitude,
          action.coordinates.longitude
        );

        const speed = distance / timeDiffHours;

        if (speed > MAX_TRAVEL_SPEED) {
          flags.push('IMPOSSIBLE_JOURNEY');
          suspiciousScore += 60;

          return {
            allowed: false,
            reason: 'Viaje imposible detectado',
            suspiciousScore,
            flags,
          };
        }

        // Warn si velocidad es alta pero posible
        if (speed > MAX_TRAVEL_SPEED * 0.7) {
          flags.push('HIGH_TRAVEL_SPEED');
          suspiciousScore += 30;
        }
      }
    }
  }

  // 5. Detectar patrones de bot (timing muy regular)
  const last10Actions = await prisma.gamificationLog.findMany({
    where: {
      userId: action.userId,
      actionType: action.actionType,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { createdAt: true },
  });

  if (last10Actions.length >= 5) {
    const intervals = [];
    for (let i = 0; i < last10Actions.length - 1; i++) {
      const interval = last10Actions[i].createdAt.getTime() - last10Actions[i + 1].createdAt.getTime();
      intervals.push(interval);
    }

    // Calcular desviación estándar
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Si CoV < 0.1, timing muy regular (posible bot)
    if (coefficientOfVariation < 0.1) {
      flags.push('REGULAR_TIMING_PATTERN');
      suspiciousScore += 50;
    }
  }

  // 6. Detectar burst de acciones (muchas en poco tiempo)
  const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
  const recentBurst = await prisma.gamificationLog.count({
    where: {
      userId: action.userId,
      createdAt: { gte: last5Minutes },
    },
  });

  if (recentBurst > 10) {
    flags.push('ACTION_BURST');
    suspiciousScore += 40;
  }

  return {
    allowed: suspiciousScore < 70,
    reason: suspiciousScore >= 70 ? 'Actividad sospechosa detectada' : undefined,
    suspiciousScore,
    flags,
  };
}

/**
 * Otorga XP de forma segura con validaciones
 */
export async function awardXP(
  action: GamificationAction
): Promise<{ success: boolean; xpAwarded: number; newTotal: number }> {
  // Validar acción
  const validation = await validateGamificationAction(action);

  if (!validation.allowed) {
    throw new Error(`Acción no permitida: ${validation.reason}`);
  }

  // Calcular XP a otorgar
  let xpAmount = XP_REWARDS[action.actionType] || 0;

  // Bonus por primera visita
  if (action.actionType === 'VISIT_POI' && action.poiId) {
    const previousVisits = await prisma.visit.count({
      where: {
        userId: action.userId,
        poiId: action.poiId,
      },
    });

    if (previousVisits === 0) {
      xpAmount = XP_REWARDS.FIRST_VISIT_POI;
    }
  }

  // Transacción atómica
  const result = await prisma.$transaction(async (tx) => {
    // 1. Registrar acción en log
    await tx.gamificationLog.create({
      data: {
        userId: action.userId,
        actionType: action.actionType,
        poiId: action.poiId,
        idempotencyKey: action.idempotencyKey,
        xpAwarded: xpAmount,
        coordinates: action.coordinates as never,
        metadata: action.metadata as never,
        suspiciousScore: validation.suspiciousScore,
        flags: validation.flags,
      },
    });

    // 2. Actualizar XP del usuario
    const user = await tx.user.update({
      where: { id: action.userId },
      data: {
        experiencePoints: { increment: xpAmount },
      },
      select: { experiencePoints: true, level: true },
    });

    // 3. Verificar level up
    const newLevel = calculateLevel(user.experiencePoints);
    if (newLevel > user.level) {
      await tx.user.update({
        where: { id: action.userId },
        data: { level: newLevel },
      });

      // Crear notificación de level up
      await tx.notification.create({
        data: {
          userId: action.userId,
          type: 'LEVEL_UP',
          title: '🎉 ¡Subiste de nivel!',
          message: `Ahora eres nivel ${newLevel}`,
          metadata: { oldLevel: user.level, newLevel },
        },
      });
    }

    return { xpAwarded: xpAmount, newTotal: user.experiencePoints };
  });

  return {
    success: true,
    xpAwarded: result.xpAwarded,
    newTotal: result.newTotal,
  };
}

/**
 * Calcula el nivel basado en XP total
 */
export function calculateLevel(xp: number): number {
  // Fórmula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100));
}

/**
 * Calcula XP requerido para siguiente nivel
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return Math.pow(nextLevel, 2) * 100;
}

/**
 * Limpia logs antiguos (más de 90 días)
 */
export async function cleanupOldLogs(): Promise<number> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await prisma.gamificationLog.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
      suspiciousScore: { lt: 50 }, // Mantener logs sospechosos más tiempo
    },
  });

  return result.count;
}

/**
 * Obtiene estadísticas de anti-cheat de un usuario
 */
export async function getUserCheatStats(userId: string) {
  const logs = await prisma.gamificationLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalActions = logs.length;
  const suspiciousActions = logs.filter((l) => l.suspiciousScore >= 50).length;
  const avgSuspiciousScore = logs.reduce((sum, l) => sum + l.suspiciousScore, 0) / totalActions || 0;

  const flagCounts: Record<string, number> = {};
  logs.forEach((log) => {
    log.flags.forEach((flag) => {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    });
  });

  return {
    totalActions,
    suspiciousActions,
    avgSuspiciousScore,
    flagCounts,
    riskLevel: avgSuspiciousScore > 50 ? 'HIGH' : avgSuspiciousScore > 30 ? 'MEDIUM' : 'LOW',
  };
}

/**
 * Session Security Manager
 * 
 * Gestiona la seguridad de sesiones con:
 * - Session fingerprinting
 * - Detección de anomalías
 * - Validación de cambios de IP/dispositivo
 * - Auto-revocación de sesiones sospechosas
 */

import { prisma } from '@/lib/prisma';
import { createDeviceFingerprint, DeviceInfo } from './device-fingerprint';

export interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  flags: string[];
  shouldRevoke: boolean;
  suspiciousScore: number; // 0-100
}

const MAX_SESSION_AGE_HOURS = 720; // 30 días
const MAX_IP_CHANGES_PER_DAY = 5;
const SUSPICIOUS_SCORE_THRESHOLD = 70;

/**
 * Crea un log de sesión al hacer login/logout/refresh
 */
export async function logSessionActivity(
  userId: string,
  sessionToken: string,
  action: 'LOGIN' | 'LOGOUT' | 'REFRESH' | 'REVOKE',
  deviceInfo: DeviceInfo,
  ip: string
) {
  const fingerprint = createDeviceFingerprint(deviceInfo);

  await prisma.sessionLog.create({
    data: {
      userId,
      sessionToken,
      action,
      ip,
      userAgent: deviceInfo.userAgent,
      deviceFingerprint: fingerprint.id,
      timestamp: new Date(),
      suspicious: false,
      flags: [],
    },
  });
}

/**
 * Valida una sesión existente verificando:
 * - Fingerprint consistency
 * - IP changes
 * - Session age
 * - Concurrent sessions
 */
export async function validateSession(
  userId: string,
  sessionToken: string,
  currentDeviceInfo: DeviceInfo,
  currentIp: string
): Promise<SessionValidationResult> {
  const flags: string[] = [];
  let suspiciousScore = 0;

  // 1. Obtener sesión actual
  const session = await prisma.session.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    return {
      isValid: false,
      reason: 'Sesión no encontrada',
      flags: ['SESSION_NOT_FOUND'],
      shouldRevoke: true,
      suspiciousScore: 100,
    };
  }

  // 2. Verificar expiración
  if (new Date() > session.expires) {
    return {
      isValid: false,
      reason: 'Sesión expirada',
      flags: ['SESSION_EXPIRED'],
      shouldRevoke: true,
      suspiciousScore: 0,
    };
  }

  // 3. Obtener logs recientes de esta sesión
  const recentLogs = await prisma.sessionLog.findMany({
    where: {
      userId,
      sessionToken,
    },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });

  if (recentLogs.length === 0) {
    flags.push('NO_PREVIOUS_LOGS');
    suspiciousScore += 20;
  }

  // 4. Validar fingerprint consistency
  const currentFingerprint = createDeviceFingerprint(currentDeviceInfo);
  const previousFingerprints = recentLogs
    .map((log) => log.deviceFingerprint)
    .filter((fp): fp is string => fp !== null);

  if (previousFingerprints.length > 0) {
    const knownFingerprint = previousFingerprints[0];
    if (currentFingerprint.id !== knownFingerprint) {
      flags.push('FINGERPRINT_CHANGED');
      suspiciousScore += 40;
    }
  }

  // 5. Detectar cambios de IP sospechosos
  const previousIps = recentLogs.map((log) => log.ip).filter((ip): ip is string => ip !== null);
  const lastIp = previousIps[0];

  if (lastIp && lastIp !== currentIp) {
    flags.push('IP_CHANGED');
    suspiciousScore += 25;

    // Contar cambios de IP en las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIpChanges = await prisma.sessionLog.count({
      where: {
        userId,
        timestamp: { gte: oneDayAgo },
        action: { in: ['LOGIN', 'REFRESH'] },
      },
      distinct: ['ip'] as never,
    });

    if (recentIpChanges > MAX_IP_CHANGES_PER_DAY) {
      flags.push('EXCESSIVE_IP_CHANGES');
      suspiciousScore += 30;
    }
  }

  // 6. Detectar sesiones concurrentes desde ubicaciones imposibles
  const recentLogins = await prisma.sessionLog.findMany({
    where: {
      userId,
      action: 'LOGIN',
      timestamp: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // última hora
      },
    },
    orderBy: { timestamp: 'desc' },
    take: 5,
  });

  // Si hay logins desde IPs muy diferentes en poco tiempo
  const uniqueIps = [...new Set(recentLogins.map((log) => log.ip))];
  if (uniqueIps.length >= 3) {
    flags.push('MULTIPLE_LOCATIONS');
    suspiciousScore += 35;
  }

  // 7. Verificar edad de la sesión
  const sessionAge = Date.now() - session.expires.getTime() + MAX_SESSION_AGE_HOURS * 3600000;
  const sessionAgeHours = sessionAge / (1000 * 60 * 60);

  if (sessionAgeHours > MAX_SESSION_AGE_HOURS) {
    flags.push('SESSION_TOO_OLD');
    suspiciousScore += 15;
  }

  // 8. Decisión final
  const shouldRevoke = suspiciousScore >= SUSPICIOUS_SCORE_THRESHOLD;
  const isValid = !shouldRevoke;

  // 9. Si es sospechosa, marcar en el log
  if (suspiciousScore >= 50) {
    await prisma.sessionLog.create({
      data: {
        userId,
        sessionToken,
        action: 'REFRESH',
        ip: currentIp,
        userAgent: currentDeviceInfo.userAgent,
        deviceFingerprint: currentFingerprint.id,
        suspicious: true,
        flags,
        timestamp: new Date(),
      },
    });
  }

  return {
    isValid,
    reason: shouldRevoke ? 'Sesión marcada como sospechosa' : undefined,
    flags,
    shouldRevoke,
    suspiciousScore,
  };
}

/**
 * Revoca una sesión específica
 */
export async function revokeSession(
  userId: string,
  sessionToken: string,
  reason: string = 'User requested'
) {
  // 1. Eliminar sesión de NextAuth
  await prisma.session.deleteMany({
    where: {
      userId,
      sessionToken,
    },
  });

  // 2. Revocar refresh tokens asociados
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // 3. Log de revocación
  await prisma.sessionLog.create({
    data: {
      userId,
      sessionToken,
      action: 'REVOKE',
      timestamp: new Date(),
      suspicious: false,
      flags: [reason],
    },
  });
}

/**
 * Revoca TODAS las sesiones de un usuario
 */
export async function revokeAllUserSessions(userId: string, reason: string = 'User requested') {
  // 1. Obtener todas las sesiones
  const sessions = await prisma.session.findMany({
    where: { userId },
  });

  // 2. Revocar cada una
  for (const session of sessions) {
    await revokeSession(userId, session.sessionToken, reason);
  }

  return sessions.length;
}

/**
 * Obtiene todas las sesiones activas de un usuario
 */
export async function getUserActiveSessions(userId: string) {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expires: { gt: new Date() },
    },
    orderBy: { expires: 'desc' },
  });

  // Enriquecer con información de los logs más recientes
  const enrichedSessions = await Promise.all(
    sessions.map(async (session) => {
      const lastLog = await prisma.sessionLog.findFirst({
        where: { sessionToken: session.sessionToken },
        orderBy: { timestamp: 'desc' },
      });

      return {
        sessionToken: session.sessionToken,
        expires: session.expires,
        lastActivity: lastLog?.timestamp || session.expires,
        lastIp: lastLog?.ip || 'unknown',
        lastUserAgent: lastLog?.userAgent || 'unknown',
        deviceFingerprint: lastLog?.deviceFingerprint || 'unknown',
        suspicious: lastLog?.suspicious || false,
      };
    })
  );

  return enrichedSessions;
}

/**
 * Detecta sesiones anómalas automáticamente
 */
export async function detectAnomalousSessions(userId: string) {
  const suspiciousSessions = [];

  const sessions = await getUserActiveSessions(userId);

  for (const session of sessions) {
    // Obtener logs de esta sesión
    const logs = await prisma.sessionLog.findMany({
      where: { sessionToken: session.sessionToken },
      orderBy: { timestamp: 'desc' },
      take: 5,
    });

    // Detectar múltiples IPs
    const uniqueIps = [...new Set(logs.map((log) => log.ip))];
    if (uniqueIps.length >= 3) {
      suspiciousSessions.push({
        ...session,
        reason: 'Multiple IPs detected',
        ips: uniqueIps,
      });
    }

    // Detectar cambios de dispositivo
    const uniqueFingerprints = [
      ...new Set(logs.map((log) => log.deviceFingerprint).filter(Boolean)),
    ];
    if (uniqueFingerprints.length >= 2) {
      suspiciousSessions.push({
        ...session,
        reason: 'Multiple devices detected',
        fingerprints: uniqueFingerprints,
      });
    }
  }

  return suspiciousSessions;
}

/**
 * Limpia sesiones y logs antiguos (cronjob)
 */
export async function cleanupExpiredSessions() {
  const now = new Date();

  // 1. Eliminar sesiones expiradas
  const deletedSessions = await prisma.session.deleteMany({
    where: {
      expires: { lt: now },
    },
  });

  // 2. Eliminar logs de más de 90 días
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const deletedLogs = await prisma.sessionLog.deleteMany({
    where: {
      timestamp: { lt: ninetyDaysAgo },
    },
  });

  // 3. Eliminar refresh tokens expirados
  const deletedTokens = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  return {
    sessionsDeleted: deletedSessions.count,
    logsDeleted: deletedLogs.count,
    tokensDeleted: deletedTokens.count,
  };
}

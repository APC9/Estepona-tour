/**
 * POI Visit Validation - Sistema completo de validación anti-spoofing
 * 
 * Combina:
 * - GPS multi-sample validation
 * - Device fingerprinting
 * - Challenge-response mechanism
 * - Rate limiting
 * - Pattern analysis
 */

import { prisma } from '@/lib/prisma';
import {
  GPSCoordinates,
  performCompleteGPSValidation,
  calculateDistance,
} from './gps-validator';
import {
  DeviceFingerprint,
  createDeviceFingerprint,
  areFingerprintsSimilar,
  DeviceInfo,
} from './device-fingerprint';
import crypto from 'crypto';

export interface VisitChallenge {
  challengeId: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
}

export interface VisitValidationRequest {
  userId: string;
  poiId: string;
  nfcUid: string;
  challenge: VisitChallenge;
  gpsSamples: GPSCoordinates[];
  deviceInfo: DeviceInfo;
  clientFingerprint: string;
}

export interface VisitValidationResult {
  isValid: boolean;
  reason?: string;
  confidence: number;
  flags: string[];
  auditLogId?: string;
}

const CHALLENGE_EXPIRY_MS = 60000; // 1 minuto
const MIN_TIME_BETWEEN_VISITS_MS = 300000; // 5 minutos cooldown por POI
const MAX_VISITS_PER_HOUR = 20; // Rate limit global
const MAX_IMPOSSIBLE_JUMPS_PER_DAY = 3; // Máximo de "teleports" permitidos

/**
 * Genera un challenge único para iniciar el proceso de escaneo
 */
export async function generateVisitChallenge(userId: string): Promise<VisitChallenge> {
  const challengeId = crypto.randomUUID();
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const expiresAt = timestamp + CHALLENGE_EXPIRY_MS;

  // Guardar challenge en DB para validación posterior
  await prisma.visitChallenge.create({
    data: {
      id: challengeId,
      userId,
      nonce,
      timestamp: new Date(timestamp),
      expiresAt: new Date(expiresAt),
      used: false,
    },
  });

  return {
    challengeId,
    nonce,
    timestamp,
    expiresAt,
  };
}

/**
 * Valida que el challenge no haya expirado ni sido usado
 */
async function validateChallenge(
  challengeId: string,
  nonce: string
): Promise<{ isValid: boolean; reason?: string }> {
  const challenge = await prisma.visitChallenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    return { isValid: false, reason: 'Challenge no encontrado' };
  }

  if (challenge.used) {
    return { isValid: false, reason: 'Challenge ya usado (replay attack)' };
  }

  if (challenge.nonce !== nonce) {
    return { isValid: false, reason: 'Nonce inválido' };
  }

  if (new Date() > challenge.expiresAt) {
    return { isValid: false, reason: 'Challenge expirado' };
  }

  // Marcar como usado
  await prisma.visitChallenge.update({
    where: { id: challengeId },
    data: { used: true },
  });

  return { isValid: true };
}

/**
 * Valida cooldown entre visitas al mismo POI
 */
async function validateVisitCooldown(
  userId: string,
  poiId: string
): Promise<{ isValid: boolean; reason?: string }> {
  const lastVisit = await prisma.visit.findFirst({
    where: {
      userId,
      poiId,
    },
    orderBy: {
      scannedAt: 'desc',
    },
  });

  if (lastVisit) {
    const timeSinceLastVisit = Date.now() - lastVisit.scannedAt.getTime();
    if (timeSinceLastVisit < MIN_TIME_BETWEEN_VISITS_MS) {
      const minutesRemaining = Math.ceil(
        (MIN_TIME_BETWEEN_VISITS_MS - timeSinceLastVisit) / 60000
      );
      return {
        isValid: false,
        reason: `Cooldown activo. Intenta en ${minutesRemaining} minutos.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Valida rate limit global (máximo de visitas por hora)
 */
async function validateRateLimit(
  userId: string
): Promise<{ isValid: boolean; reason?: string }> {
  const oneHourAgo = new Date(Date.now() - 3600000);

  const recentVisits = await prisma.visit.count({
    where: {
      userId,
      scannedAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (recentVisits >= MAX_VISITS_PER_HOUR) {
    return {
      isValid: false,
      reason: `Rate limit excedido. Máximo ${MAX_VISITS_PER_HOUR} visitas por hora.`,
    };
  }

  return { isValid: true };
}

/**
 * Detecta "teleports" imposibles (usuario en dos lugares lejanos en poco tiempo)
 */
async function detectImpossibleJumps(
  userId: string,
  currentLat: number,
  currentLon: number
): Promise<{ flags: string[]; confidence: number }> {
  const flags: string[] = [];
  let confidence = 100;

  // Obtener última visita
  const lastVisit = await prisma.visit.findFirst({
    where: {
      userId,
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: {
      scannedAt: 'desc',
    },
    include: {
      poi: {
        select: {
          lat: true,
          lng: true,
        },
      },
    },
  });

  if (lastVisit && lastVisit.latitude && lastVisit.longitude) {
    const timeDiff = (Date.now() - lastVisit.scannedAt.getTime()) / 1000; // segundos
    const distance = calculateDistance(
      lastVisit.latitude,
      lastVisit.longitude,
      currentLat,
      currentLon
    );

    // Si se movió más de 500m en menos de 1 minuto
    if (distance > 500 && timeDiff < 60) {
      flags.push('IMPOSSIBLE_JUMP');
      confidence -= 50;

      // Contar cuántos jumps ha tenido hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const jumpsToday = await prisma.visitAuditLog.count({
        where: {
          userId,
          timestamp: { gte: today },
          flags: {
            has: 'IMPOSSIBLE_JUMP',
          },
        },
      });

      if (jumpsToday >= MAX_IMPOSSIBLE_JUMPS_PER_DAY) {
        flags.push('EXCESSIVE_JUMPS');
        confidence = 0; // Bloquear
      }
    }
  }

  return { flags, confidence };
}

/**
 * Valida consistencia del device fingerprint
 */
async function validateDeviceFingerprint(
  userId: string,
  currentFingerprint: DeviceFingerprint
): Promise<{ flags: string[]; confidence: number }> {
  const flags: string[] = [];
  let confidence = 100;

  // Obtener fingerprints anteriores del usuario
  const recentLogs = await prisma.visitAuditLog.findMany({
    where: {
      userId,
      success: true,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 5,
    select: {
      deviceFingerprintId: true,
      deviceInfo: true,
    },
  });

  if (recentLogs.length > 0) {
    // Verificar si el fingerprint es completamente nuevo
    const knownFingerprints = recentLogs.map((log) => log.deviceFingerprintId);
    if (!knownFingerprints.includes(currentFingerprint.id)) {
      flags.push('NEW_DEVICE');
      confidence -= 20;

      // Si cambió en menos de 1 hora, es sospechoso
      const lastLog = recentLogs[0];
      if (lastLog.deviceInfo) {
        const lastFp = createDeviceFingerprint(
          JSON.parse(lastLog.deviceInfo as string)
        );
        if (!areFingerprintsSimilar(lastFp, currentFingerprint)) {
          flags.push('DEVICE_MISMATCH');
          confidence -= 30;
        }
      }
    }
  }

  return { flags, confidence };
}

/**
 * Validación completa de visita a POI
 * Este es el punto de entrada principal
 */
export async function validatePOIVisit(
  request: VisitValidationRequest
): Promise<VisitValidationResult> {
  const flags: string[] = [];
  let confidence = 100;

  // 1. Validar challenge (anti-replay)
  const challengeResult = await validateChallenge(
    request.challenge.challengeId,
    request.challenge.nonce
  );
  if (!challengeResult.isValid) {
    return {
      isValid: false,
      reason: challengeResult.reason,
      confidence: 0,
      flags: ['INVALID_CHALLENGE'],
    };
  }

  // 2. Obtener datos del POI
  const poi = await prisma.pOI.findUnique({
    where: { id: request.poiId },
    select: {
      id: true,
      nfcUid: true,
      lat: true,
      lng: true,
      isActive: true,
    },
  });

  if (!poi || !poi.isActive) {
    return {
      isValid: false,
      reason: 'POI no encontrado o inactivo',
      confidence: 0,
      flags: ['POI_NOT_FOUND'],
    };
  }

  // Validar que el NFC UID coincide
  if (poi.nfcUid !== request.nfcUid) {
    flags.push('NFC_MISMATCH');
    confidence = 0;
  }

  // 3. Validar cooldown
  const cooldownResult = await validateVisitCooldown(request.userId, request.poiId);
  if (!cooldownResult.isValid) {
    return {
      isValid: false,
      reason: cooldownResult.reason,
      confidence: 0,
      flags: ['COOLDOWN_ACTIVE'],
    };
  }

  // 4. Validar rate limit
  const rateLimitResult = await validateRateLimit(request.userId);
  if (!rateLimitResult.isValid) {
    return {
      isValid: false,
      reason: rateLimitResult.reason,
      confidence: 0,
      flags: ['RATE_LIMIT_EXCEEDED'],
    };
  }

  // 5. Validar GPS (múltiples samples)
  const gpsValidation = performCompleteGPSValidation(
    request.gpsSamples,
    poi.lat,
    poi.lng,
    50 // 50 metros de radio
  );

  if (!gpsValidation.isValid) {
    return {
      isValid: false,
      reason: gpsValidation.reason,
      confidence: gpsValidation.confidence,
      flags: [...flags, ...gpsValidation.flags],
    };
  }

  flags.push(...gpsValidation.flags);
  confidence = Math.min(confidence, gpsValidation.confidence);

  // 6. Detectar teleports imposibles
  const lastSample = request.gpsSamples[request.gpsSamples.length - 1];
  const jumpDetection = await detectImpossibleJumps(
    request.userId,
    lastSample.latitude,
    lastSample.longitude
  );
  flags.push(...jumpDetection.flags);
  confidence = Math.min(confidence, jumpDetection.confidence);

  // 7. Validar device fingerprint
  const deviceFingerprint = createDeviceFingerprint(request.deviceInfo);
  const fingerprintValidation = await validateDeviceFingerprint(
    request.userId,
    deviceFingerprint
  );
  flags.push(...fingerprintValidation.flags);
  confidence = Math.min(confidence, fingerprintValidation.confidence);

  // 8. Decisión final
  const isValid = confidence >= 50;

  // 9. Guardar audit log
  const auditLog = await prisma.visitAuditLog.create({
    data: {
      userId: request.userId,
      poiId: request.poiId,
      nfcUid: request.nfcUid,
      timestamp: new Date(),
      success: isValid,
      confidence,
      flags,
      gpsSamples: JSON.stringify(request.gpsSamples),
      deviceFingerprintId: deviceFingerprint.id,
      deviceInfo: JSON.stringify(request.deviceInfo),
      challengeId: request.challenge.challengeId,
      latitude: lastSample.latitude,
      longitude: lastSample.longitude,
      accuracy: lastSample.accuracy,
    },
  });

  return {
    isValid,
    reason: isValid ? undefined : 'Validación falló: confidence demasiado baja',
    confidence,
    flags: [...new Set(flags)],
    auditLogId: auditLog.id,
  };
}

/**
 * Registra la visita exitosa en la base de datos
 */
export async function recordSuccessfulVisit(
  userId: string,
  poiId: string,
  auditLogId: string,
  gpsSample: GPSCoordinates
) {
  const poi = await prisma.pOI.findUnique({
    where: { id: poiId },
    select: { points: true, xpReward: true },
  });

  if (!poi) {
    throw new Error('POI not found');
  }

  // Usar transacción para garantizar atomicidad
  return await prisma.$transaction(async (tx) => {
    // 1. Crear registro de visita
    const visit = await tx.visit.create({
      data: {
        userId,
        poiId,
        scannedAt: new Date(),
        pointsEarned: poi.points,
        xpEarned: poi.xpReward,
        latitude: gpsSample.latitude,
        longitude: gpsSample.longitude,
      },
    });

    // 2. Actualizar puntos y XP del usuario
    await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: poi.points },
        experiencePoints: { increment: poi.xpReward },
      },
    });

    // 3. Vincular audit log con la visita
    await tx.visitAuditLog.update({
      where: { id: auditLogId },
      data: { visitId: visit.id },
    });

    return visit;
  });
}

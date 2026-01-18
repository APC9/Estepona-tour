/**
 * 🔒 SECURITY - Geolocation Validation & GPS Spoofing Detection
 * 
 * Valida que los usuarios están físicamente presentes en los POIs
 * Detecta GPS spoofing, teleportación y movimientos imposibles
 */

import { prisma } from '@/lib/prisma';

export interface ValidationResult {
  isValid: boolean;
  distance: number;
  suspicious: boolean;
  reason?: string;
  metadata?: {
    speed?: number;
    timeSinceLastScan?: number;
    accuracy?: number;
  };
}

/**
 * Calcula distancia entre dos puntos GPS usando fórmula de Haversine
 * @returns Distancia en metros
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

/**
 * Valida que el usuario está realmente cerca del POI
 * Implementa múltiples capas de validación:
 * 1. Coordenadas válidas
 * 2. Proximidad al POI
 * 3. Detección de teleportación
 * 4. Validación de NFC UID
 */
export async function validateProximity(
  userId: string,
  poiLocation: { lat: number; lng: number },
  userLocation: { latitude: number; longitude: number; accuracy?: number },
  nfcUid: string,
  prismaClient: typeof prisma
): Promise<ValidationResult> {
  // Configuración de seguridad
  const MAX_DISTANCE = 100; // 100 metros de tolerancia para escaneo
  const SUSPICIOUS_SPEED = 50; // m/s (180 km/h) - velocidad humanamente imposible
  const MIN_TIME_BETWEEN_SCANS = 10; // segundos mínimos entre escaneos
  const MAX_ACCURACY = 50; // GPS accuracy máxima aceptable (metros)

  // ========================================
  // 1. VALIDAR COORDENADAS BÁSICAS
  // ========================================
  if (
    !userLocation.latitude ||
    !userLocation.longitude ||
    Math.abs(userLocation.latitude) > 90 ||
    Math.abs(userLocation.longitude) > 180
  ) {
    return {
      isValid: false,
      distance: 0,
      suspicious: true,
      reason: 'Invalid coordinates provided',
    };
  }

  // Validar precisión del GPS si está disponible
  if (userLocation.accuracy && userLocation.accuracy > MAX_ACCURACY) {
    return {
      isValid: false,
      distance: 0,
      suspicious: true,
      reason: `GPS accuracy too low (${Math.round(userLocation.accuracy)}m). Please wait for better signal.`,
      metadata: { accuracy: userLocation.accuracy },
    };
  }

  // ========================================
  // 2. CALCULAR DISTANCIA AL POI
  // ========================================
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    poiLocation.lat,
    poiLocation.lng
  );

  if (distance > MAX_DISTANCE) {
    return {
      isValid: false,
      distance,
      suspicious: true,
      reason: `Too far from POI (${Math.round(distance)}m away). You must be within ${MAX_DISTANCE}m.`,
    };
  }

  // ========================================
  // 3. DETECTAR TELEPORTACIÓN (GPS SPOOFING)
  // ========================================
  const lastVisit = await prismaClient.visit.findFirst({
    where: { userId },
    orderBy: { scannedAt: 'desc' },
    select: {
      latitude: true,
      longitude: true,
      scannedAt: true,
      poi: {
        select: { lat: true, lng: true, nameEs: true },
      },
    },
  });

  if (lastVisit && lastVisit.latitude && lastVisit.longitude) {
    const timeDiff = (Date.now() - lastVisit.scannedAt.getTime()) / 1000; // segundos

    // No permitir escaneos muy rápidos (anti-bot)
    if (timeDiff < MIN_TIME_BETWEEN_SCANS) {
      return {
        isValid: false,
        distance,
        suspicious: true,
        reason: `Please wait ${Math.ceil(MIN_TIME_BETWEEN_SCANS - timeDiff)} seconds before scanning again.`,
        metadata: { timeSinceLastScan: timeDiff },
      };
    }

    const lastDistance = calculateDistance(
      lastVisit.latitude,
      lastVisit.longitude,
      userLocation.latitude,
      userLocation.longitude
    );

    const speed = lastDistance / timeDiff; // metros por segundo

    // Detectar movimiento imposible (teleportación)
    if (speed > SUSPICIOUS_SPEED && timeDiff < 300) {
      // Solo si es menos de 5 minutos
      const kmh = Math.round(speed * 3.6);

      // Log detección de GPS spoofing
      await prismaClient.securityLog.create({
        data: {
          userId,
          action: 'GPS_SPOOFING_DETECTED',
          severity: 'HIGH',
          details: {
            suspectedSpeed: kmh,
            distance: Math.round(lastDistance),
            timeDiff,
            previousLocation: {
              lat: lastVisit.latitude,
              lng: lastVisit.longitude,
              poi: lastVisit.poi?.nameEs,
            },
            currentLocation: {
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            },
          },
        },
      });

      return {
        isValid: false,
        distance,
        suspicious: true,
        reason: `Suspicious movement detected (${kmh} km/h). This speed is not humanly possible.`,
        metadata: {
          speed,
          timeSinceLastScan: timeDiff,
        },
      };
    }
  }

  // ========================================
  // 4. VERIFICAR QUE NFC UID COINCIDE CON POI CERCANO
  // ========================================
  const poiByNfc = await prismaClient.pOI.findUnique({
    where: { nfcUid },
    select: { id: true, lat: true, lng: true, nameEs: true },
  });

  if (!poiByNfc) {
    return {
      isValid: false,
      distance,
      suspicious: true,
      reason: 'Invalid NFC tag. This tag is not registered in the system.',
    };
  }

  // Verificar que el POI del NFC está cerca de la ubicación reportada
  const nfcPoiDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    poiByNfc.lat,
    poiByNfc.lng
  );

  if (nfcPoiDistance > MAX_DISTANCE) {
    // Posible clonación de NFC tag
    await prismaClient.securityLog.create({
      data: {
        userId,
        action: 'NFC_CLONING_SUSPECTED',
        severity: 'HIGH',
        details: {
          nfcUid,
          poiName: poiByNfc.nameEs,
          reportedLocation: userLocation,
          actualPoiLocation: { lat: poiByNfc.lat, lng: poiByNfc.lng },
          distance: Math.round(nfcPoiDistance),
        },
      },
    });

    return {
      isValid: false,
      distance: nfcPoiDistance,
      suspicious: true,
      reason: `NFC tag location mismatch. This tag should be at "${poiByNfc.nameEs}" but you are ${Math.round(nfcPoiDistance)}m away.`,
    };
  }

  // ========================================
  // ✅ TODAS LAS VALIDACIONES PASADAS
  // ========================================
  return {
    isValid: true,
    distance,
    suspicious: false,
    metadata: {
      speed: lastVisit ? calculateDistance(
        lastVisit.latitude || 0,
        lastVisit.longitude || 0,
        userLocation.latitude,
        userLocation.longitude
      ) / ((Date.now() - lastVisit.scannedAt.getTime()) / 1000) : undefined,
      timeSinceLastScan: lastVisit ? (Date.now() - lastVisit.scannedAt.getTime()) / 1000 : undefined,
      accuracy: userLocation.accuracy,
    },
  };
}

/**
 * Validación adicional: Detectar patrones de escaneo sospechosos
 */
export async function detectSuspiciousPatterns(
  userId: string,
  prismaClient: typeof prisma
): Promise<{
  isSuspicious: boolean;
  reason?: string;
  pattern?: string;
}> {
  const recentVisits = await prismaClient.visit.findMany({
    where: {
      userId,
      scannedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24 horas
      },
    },
    orderBy: { scannedAt: 'desc' },
    take: 20,
  });

  // Patrón 1: Demasiados escaneos en poco tiempo
  if (recentVisits.length > 15) {
    return {
      isSuspicious: true,
      reason: 'Excessive scanning activity detected',
      pattern: 'HIGH_FREQUENCY',
    };
  }

  // Patrón 2: Todos los escaneos exactamente a la misma distancia del POI
  // (indica uso de coordenadas hardcodeadas)
  if (recentVisits.length >= 5) {
    const distances = recentVisits
      .filter((v) => v.latitude && v.longitude)
      .map((v) => Math.round(v.latitude! * 1000) + Math.round(v.longitude! * 1000));

    const uniqueDistances = new Set(distances);
    if (uniqueDistances.size === 1 && distances.length >= 5) {
      return {
        isSuspicious: true,
        reason: 'Identical GPS coordinates across multiple scans',
        pattern: 'SAME_COORDINATES',
      };
    }
  }

  return { isSuspicious: false };
}

/**
 * GPS Validator - Detecta GPS spoofing y valida ubicaciones reales
 * 
 * Implementa múltiples capas de validación:
 * - Accuracy threshold
 * - Velocidad máxima humanamente posible
 * - Múltiples samples para confirmar ubicación
 * - Detección de saltos imposibles
 */

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export interface GPSValidationResult {
  isValid: boolean;
  reason?: string;
  confidence: number; // 0-100
  flags: string[];
}

const MAX_ACCURACY_METERS = 50; // Máxima imprecisión aceptable
const MAX_HUMAN_SPEED_MPS = 8.33; // ~30 km/h (corriendo rápido)
const MIN_SAMPLES_REQUIRED = 3;
const MAX_DISTANCE_PER_SECOND = 10; // Metros por segundo máximo entre samples

/**
 * Calcula distancia entre dos coordenadas usando fórmula Haversine
 */
export function calculateDistance(
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

  return R * c; // Distancia en metros
}

/**
 * Valida una coordenada GPS individual
 */
export function validateGPSCoordinate(coord: GPSCoordinates): GPSValidationResult {
  const flags: string[] = [];
  let confidence = 100;

  // 1. Validar accuracy
  if (coord.accuracy > MAX_ACCURACY_METERS) {
    flags.push('LOW_ACCURACY');
    confidence -= 30;
  }

  // 2. Validar coordenadas dentro de rango válido
  if (
    coord.latitude < -90 ||
    coord.latitude > 90 ||
    coord.longitude < -180 ||
    coord.longitude > 180
  ) {
    return {
      isValid: false,
      reason: 'Coordenadas fuera de rango válido',
      confidence: 0,
      flags: ['INVALID_COORDINATES'],
    };
  }

  // 3. Validar timestamp reciente (no más de 30 segundos viejo)
  const now = Date.now();
  const age = now - coord.timestamp;
  if (age > 30000) {
    flags.push('STALE_COORDINATES');
    confidence -= 20;
  }
  if (age < 0) {
    return {
      isValid: false,
      reason: 'Timestamp en el futuro (reloj manipulado)',
      confidence: 0,
      flags: ['FUTURE_TIMESTAMP'],
    };
  }

  // 4. Validar velocidad si está disponible
  if (coord.speed !== null && coord.speed !== undefined) {
    if (coord.speed > MAX_HUMAN_SPEED_MPS) {
      flags.push('EXCESSIVE_SPEED');
      confidence -= 40;
    }
    if (coord.speed < 0) {
      return {
        isValid: false,
        reason: 'Velocidad negativa (GPS spoofed)',
        confidence: 0,
        flags: ['NEGATIVE_SPEED'],
      };
    }
  }

  // 5. Validar altitude si está disponible (debe ser razonable para Estepona)
  if (coord.altitude !== null && coord.altitude !== undefined) {
    // Estepona está a nivel del mar, altitude no debería ser > 500m
    if (coord.altitude > 500 || coord.altitude < -50) {
      flags.push('SUSPICIOUS_ALTITUDE');
      confidence -= 15;
    }
  }

  const isValid = confidence >= 50;

  return {
    isValid,
    reason: isValid ? undefined : 'Confidence demasiado baja: múltiples flags',
    confidence,
    flags,
  };
}

/**
 * Valida múltiples samples de GPS en secuencia
 * Detecta saltos imposibles y patrones de spoofing
 */
export function validateGPSSamples(samples: GPSCoordinates[]): GPSValidationResult {
  const flags: string[] = [];
  let confidence = 100;

  // 1. Verificar cantidad mínima de samples
  if (samples.length < MIN_SAMPLES_REQUIRED) {
    return {
      isValid: false,
      reason: `Se requieren al menos ${MIN_SAMPLES_REQUIRED} samples`,
      confidence: 0,
      flags: ['INSUFFICIENT_SAMPLES'],
    };
  }

  // 2. Validar cada sample individualmente
  for (const sample of samples) {
    const validation = validateGPSCoordinate(sample);
    if (!validation.isValid) {
      return {
        isValid: false,
        reason: `Sample inválido: ${validation.reason}`,
        confidence: 0,
        flags: [...flags, ...validation.flags],
      };
    }
    flags.push(...validation.flags);
    confidence = Math.min(confidence, validation.confidence);
  }

  // 3. Validar intervalos entre samples
  for (let i = 1; i < samples.length; i++) {
    const timeDiff = samples[i].timestamp - samples[i - 1].timestamp;

    // Samples demasiado rápidos (< 1 segundo)
    if (timeDiff < 1000) {
      flags.push('SAMPLES_TOO_FAST');
      confidence -= 20;
    }

    // Samples demasiado lentos (> 15 segundos)
    if (timeDiff > 15000) {
      flags.push('SAMPLES_TOO_SLOW');
      confidence -= 10;
    }
  }

  // 4. Detectar saltos imposibles de ubicación
  for (let i = 1; i < samples.length; i++) {
    const distance = calculateDistance(
      samples[i - 1].latitude,
      samples[i - 1].longitude,
      samples[i].latitude,
      samples[i].longitude
    );

    const timeDiff = (samples[i].timestamp - samples[i - 1].timestamp) / 1000; // en segundos
    const speed = distance / timeDiff; // metros por segundo

    if (speed > MAX_DISTANCE_PER_SECOND) {
      flags.push('IMPOSSIBLE_MOVEMENT');
      confidence -= 40;
    }
  }

  // 5. Verificar consistencia de ubicación (no debería variar mucho)
  const avgLat = samples.reduce((sum, s) => sum + s.latitude, 0) / samples.length;
  const avgLon = samples.reduce((sum, s) => sum + s.longitude, 0) / samples.length;

  for (const sample of samples) {
    const deviation = calculateDistance(avgLat, avgLon, sample.latitude, sample.longitude);
    if (deviation > 100) {
      // > 100m de desviación del promedio
      flags.push('HIGH_LOCATION_VARIANCE');
      confidence -= 25;
    }
  }

  const isValid = confidence >= 50;

  return {
    isValid,
    reason: isValid ? undefined : 'Múltiples indicadores de GPS spoofing detectados',
    confidence,
    flags: [...new Set(flags)], // Eliminar duplicados
  };
}

/**
 * Valida que el usuario está dentro del radio permitido del POI
 */
export function validateProximityToPOI(
  userCoords: GPSCoordinates,
  poiLat: number,
  poiLng: number,
  maxDistanceMeters: number = 50
): GPSValidationResult {
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    poiLat,
    poiLng
  );

  const flags: string[] = [];
  let confidence = 100;

  if (distance > maxDistanceMeters) {
    return {
      isValid: false,
      reason: `Usuario a ${Math.round(distance)}m del POI (máximo ${maxDistanceMeters}m)`,
      confidence: 0,
      flags: ['TOO_FAR_FROM_POI'],
    };
  }

  // Ajustar confidence basado en distancia
  if (distance > maxDistanceMeters * 0.8) {
    flags.push('NEAR_BOUNDARY');
    confidence -= 20;
  }

  return {
    isValid: true,
    confidence,
    flags,
  };
}

/**
 * Análisis completo de GPS con todos los checks
 */
export function performCompleteGPSValidation(
  samples: GPSCoordinates[],
  poiLat: number,
  poiLng: number,
  maxDistanceMeters: number = 50
): GPSValidationResult {
  // 1. Validar samples en secuencia
  const samplesValidation = validateGPSSamples(samples);
  if (!samplesValidation.isValid) {
    return samplesValidation;
  }

  // 2. Validar proximidad al POI usando el último sample
  const lastSample = samples[samples.length - 1];
  const proximityValidation = validateProximityToPOI(
    lastSample,
    poiLat,
    poiLng,
    maxDistanceMeters
  );

  // Combinar resultados
  const combinedFlags = [
    ...new Set([...samplesValidation.flags, ...proximityValidation.flags]),
  ];
  const combinedConfidence = Math.min(
    samplesValidation.confidence,
    proximityValidation.confidence
  );

  return {
    isValid: proximityValidation.isValid && samplesValidation.isValid,
    reason: proximityValidation.reason || samplesValidation.reason,
    confidence: combinedConfidence,
    flags: combinedFlags,
  };
}

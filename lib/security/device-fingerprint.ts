/**
 * Device Fingerprinting - Genera un fingerprint único del dispositivo
 * 
 * Combina múltiples características del dispositivo para crear
 * un identificador semi-permanente que ayuda a detectar:
 * - Múltiples cuentas desde el mismo dispositivo
 * - Cambios sospechosos de dispositivo
 * - Patrones de uso anómalos
 */

import crypto from 'crypto';

export interface DeviceInfo {
  userAgent: string;
  screenResolution?: string;
  timezone: string;
  language: string;
  platform?: string;
  vendor?: string;
  cookiesEnabled: boolean;
  doNotTrack?: string;
  ip?: string; // Desde headers del request
  acceptLanguage?: string;
  acceptEncoding?: string;
}

export interface DeviceFingerprint {
  id: string; // Hash del fingerprint
  components: DeviceInfo;
  timestamp: number;
  confidence: number;
}

/**
 * Genera un hash SHA-256 de los componentes del dispositivo
 */
export function generateFingerprintHash(components: DeviceInfo): string {
  const data = JSON.stringify({
    ua: components.userAgent,
    screen: components.screenResolution || 'unknown',
    tz: components.timezone,
    lang: components.language,
    platform: components.platform || 'unknown',
    vendor: components.vendor || 'unknown',
    cookies: components.cookiesEnabled,
    dnt: components.doNotTrack || 'unknown',
  });

  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calcula el nivel de confidence del fingerprint
 * Más componentes disponibles = mayor confidence
 */
export function calculateFingerprintConfidence(components: DeviceInfo): number {
  let confidence = 0;
  const weights = {
    userAgent: 20,
    screenResolution: 15,
    timezone: 10,
    language: 10,
    platform: 10,
    vendor: 10,
    cookiesEnabled: 5,
    doNotTrack: 5,
    ip: 15,
  };

  if (components.userAgent) confidence += weights.userAgent;
  if (components.screenResolution) confidence += weights.screenResolution;
  if (components.timezone) confidence += weights.timezone;
  if (components.language) confidence += weights.language;
  if (components.platform) confidence += weights.platform;
  if (components.vendor) confidence += weights.vendor;
  if (components.cookiesEnabled !== undefined) confidence += weights.cookiesEnabled;
  if (components.doNotTrack) confidence += weights.doNotTrack;
  if (components.ip) confidence += weights.ip;

  return confidence;
}

/**
 * Crea un device fingerprint completo
 */
export function createDeviceFingerprint(components: DeviceInfo): DeviceFingerprint {
  return {
    id: generateFingerprintHash(components),
    components,
    timestamp: Date.now(),
    confidence: calculateFingerprintConfidence(components),
  };
}

/**
 * Extrae información del dispositivo desde los headers del request (server-side)
 */
export function extractDeviceInfoFromHeaders(headers: Headers): Partial<DeviceInfo> {
  return {
    userAgent: headers.get('user-agent') || 'unknown',
    acceptLanguage: headers.get('accept-language') || undefined,
    acceptEncoding: headers.get('accept-encoding') || undefined,
    // IP se extrae en el API route
  };
}

/**
 * Valida que dos fingerprints sean "similares"
 * Útil para detectar cambios sospechosos de dispositivo
 */
export function areFingerprintsSimilar(
  fp1: DeviceFingerprint,
  fp2: DeviceFingerprint,
  threshold: number = 0.7
): boolean {
  // Si los hashes son idénticos, son el mismo dispositivo
  if (fp1.id === fp2.id) return true;

  // Calcular similitud basada en componentes individuales
  let matches = 0;
  let total = 0;

  const compare = (a: unknown, b: unknown): boolean => {
    total++;
    if (a === b) {
      matches++;
      return true;
    }
    return false;
  };

  compare(fp1.components.platform, fp2.components.platform);
  compare(fp1.components.timezone, fp2.components.timezone);
  compare(fp1.components.language, fp2.components.language);
  compare(fp1.components.vendor, fp2.components.vendor);

  // User agent parcial (familia de navegador)
  if (
    fp1.components.userAgent &&
    fp2.components.userAgent &&
    extractBrowserFamily(fp1.components.userAgent) ===
    extractBrowserFamily(fp2.components.userAgent)
  ) {
    matches++;
  }
  total++;

  const similarity = matches / total;
  return similarity >= threshold;
}

/**
 * Extrae la familia del navegador del user agent
 */
function extractBrowserFamily(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'unknown';
}

/**
 * Detecta si el fingerprint ha cambiado sospechosamente
 * Retorna lista de componentes que cambiaron
 */
export function detectFingerprintChanges(
  oldFp: DeviceFingerprint,
  newFp: DeviceFingerprint
): string[] {
  const changes: string[] = [];

  if (oldFp.components.platform !== newFp.components.platform) {
    changes.push('platform');
  }
  if (oldFp.components.timezone !== newFp.components.timezone) {
    changes.push('timezone');
  }
  if (oldFp.components.screenResolution !== newFp.components.screenResolution) {
    changes.push('screenResolution');
  }
  if (
    extractBrowserFamily(oldFp.components.userAgent) !==
    extractBrowserFamily(newFp.components.userAgent)
  ) {
    changes.push('browser');
  }

  return changes;
}

/**
 * Genera un fingerprint "anónimo" para validación client-side
 * No incluye IP ni datos sensibles
 */
export function generateClientFingerprint(): string {
  if (typeof window === 'undefined') {
    throw new Error('generateClientFingerprint solo puede ejecutarse en el cliente');
  }

  const components = {
    ua: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lang: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookies: navigator.cookieEnabled,
    dnt: (navigator as Navigator & { doNotTrack?: string }).doNotTrack || '0',
  };

  const data = JSON.stringify(components);
  // En el cliente, usamos una versión simple de hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

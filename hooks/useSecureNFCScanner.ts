'use client';

import { useState, useCallback, useEffect } from 'react';
import { generateClientFingerprint } from '@/lib/security/device-fingerprint';

interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

interface Challenge {
  challengeId: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
}

interface ValidationResult {
  success: boolean;
  error?: string;
  visit?: {
    id: string;
    pointsEarned: number;
    xpEarned: number;
    scannedAt: string;
  };
  validation?: {
    confidence: number;
    flags: string[];
    auditLogId: string;
  };
}

export function useSecureNFCScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [gpsSamples, setGpsSamples] = useState<GPSCoordinates[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  /**
   * Genera un challenge para iniciar el escaneo
   */
  const generateChallenge = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/poi/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('No se pudo generar challenge');
      }

      const data = await response.json();
      setChallenge(data.challenge);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  }, []);

  /**
   * Inicia la recolección de samples de GPS
   */
  const startGPSCollection = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no disponible'));
        return;
      }

      setGpsSamples([]);
      let sampleCount = 0;
      const targetSamples = 3;

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const sample: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };

          setGpsSamples((prev) => {
            const updated = [...prev, sample];
            sampleCount = updated.length;

            // Una vez que tenemos suficientes samples, resolver
            if (sampleCount >= targetSamples) {
              navigator.geolocation.clearWatch(id);
              setWatchId(null);
              resolve();
            }

            return updated;
          });
        },
        (err) => {
          navigator.geolocation.clearWatch(id);
          setWatchId(null);
          reject(new Error(`Error GPS: ${err.message}`));
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      setWatchId(id);
    });
  }, []);

  /**
   * Detiene la recolección de GPS
   */
  const stopGPSCollection = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  /**
   * Ejecuta el escaneo completo: challenge + GPS + validación
   */
  const scanPOI = useCallback(
    async (nfcUid: string, poiId: string): Promise<ValidationResult> => {
      setIsScanning(true);
      setError(null);

      try {
        // 1. Generar challenge si no existe o expiró
        if (!challenge || Date.now() > challenge.expiresAt) {
          const success = await generateChallenge();
          if (!success) {
            throw new Error('No se pudo generar challenge');
          }
          // Esperar un poco para que el challenge se guarde
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 2. Recolectar samples de GPS
        await startGPSCollection();

        // Esperar a tener al menos 3 samples
        let attempts = 0;
        while (gpsSamples.length < 3 && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        if (gpsSamples.length < 3) {
          throw new Error('No se pudieron recolectar suficientes samples de GPS');
        }

        // 3. Generar device fingerprint
        const clientFingerprint = generateClientFingerprint();

        // 4. Recolectar device info
        const deviceInfo = {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          vendor: navigator.vendor,
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: (navigator as Navigator & { doNotTrack?: string }).doNotTrack || '0',
        };

        // 5. Enviar validación al servidor
        const response = await fetch('/api/poi/validate-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poiId,
            nfcUid,
            challenge,
            gpsSamples,
            clientFingerprint,
            deviceInfo,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al validar visita');
        }

        // 6. Limpiar estado
        setChallenge(null);
        setGpsSamples([]);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsScanning(false);
        stopGPSCollection();
      }
    },
    [challenge, gpsSamples, generateChallenge, startGPSCollection, stopGPSCollection]
  );

  /**
   * Limpia recursos al desmontar
   */
  useEffect(() => {
    return () => {
      stopGPSCollection();
    };
  }, [stopGPSCollection]);

  return {
    isScanning,
    error,
    challenge,
    gpsSampleCount: gpsSamples.length,
    scanPOI,
    generateChallenge,
  };
}

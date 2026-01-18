'use client';

import { useState, useCallback } from 'react';
import { generateClientFingerprint } from '@/lib/security/device-fingerprint';

/**
 * Hook para gestionar acciones de gamificación de forma segura
 * 
 * Implementa:
 * - Idempotency keys automáticos
 * - Detección de errores de rate limiting
 * - Feedback al usuario
 * - Retry logic
 */
export function useGamification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registra una visita segura a un POI
   */
  const recordSecureVisit = useCallback(async (data: {
    poiId: string;
    nfcUid: string;
    challengeNonce: string;
    challengeResponse: string;
    gpsSamples: Array<{
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude: number | null;
      timestamp: number;
    }>;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Generar device fingerprint
      const deviceFingerprint = await generateClientFingerprint();

      // Enviar request
      const response = await fetch('/api/secure/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          deviceFingerprint,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar visita');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calificar un POI
   */
  const ratePOI = useCallback(async (poiId: string, rating: number) => {
    setLoading(true);
    setError(null);

    try {
      const deviceFingerprint = await generateClientFingerprint();
      const idempotencyKey = `rate:${poiId}:${Date.now()}`;

      const response = await fetch('/api/gamification/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poiId,
          rating,
          deviceFingerprint,
          idempotencyKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Mostrar mensaje amigable para rate limiting
        if (result.error?.includes('Cooldown')) {
          throw new Error('Ya calificaste este POI recientemente');
        }
        throw new Error(result.error || 'Error al calificar');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Compartir contenido
   */
  const shareContent = useCallback(async (contentType: string, contentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const deviceFingerprint = await generateClientFingerprint();
      const idempotencyKey = `share:${contentType}:${contentId}:${Date.now()}`;

      const response = await fetch('/api/gamification/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          deviceFingerprint,
          idempotencyKey,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.includes('Cooldown') || result.error?.includes('límite')) {
          throw new Error('Espera un momento antes de compartir de nuevo');
        }
        throw new Error(result.error || 'Error al compartir');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas del usuario
   */
  const getUserStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gamification/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener estadísticas');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recordSecureVisit,
    ratePOI,
    shareContent,
    getUserStats,
    loading,
    error,
  };
}

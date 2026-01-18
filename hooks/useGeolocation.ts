'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

/**
 * Hook personalizado para tracking de geolocalización
 * Solicita permisos, inicia tracking y actualiza posición en tiempo real
 */
export function useGeolocation() {
  const { location, setLocation, startTracking, stopTracking, setPermission } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalización no disponible en este navegador');
      return false;
    }

    setIsLoading(true);

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });

      if (result.state === 'granted') {
        setPermission(true);
        return true;
      } else if (result.state === 'prompt') {
        // El navegador pedirá permiso al usuario
        return new Promise<boolean>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermission(true);
              resolve(true);
            },
            () => {
              setPermission(false);
              setError('Permiso de ubicación denegado');
              resolve(false);
            }
          );
        });
      } else {
        setPermission(false);
        setError('Permiso de ubicación denegado previamente');
        return false;
      }
    } catch (err) {
      console.error('Error checking geolocation permission:', err);
      setError('Error al verificar permisos');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPermission]);

  useEffect(() => {
    let watchId: number | null = null;

    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          setError(null);
        },
        (err) => {
          console.error('Geolocation error:', err);
          let errorMessage = 'Error desconocido al obtener ubicación';

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado';
              break;
            default:
              errorMessage = err.message || errorMessage;
          }

          setError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

      startTracking();
    };

    startWatching();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        stopTracking();
      }
    };
  }, [requestPermission, setLocation, startTracking, stopTracking]);

  return {
    location,
    error,
    isLoading,
    requestPermission,
  };
}

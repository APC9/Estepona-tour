'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { usePOIStore, POI } from '@/lib/stores/poiStore';
import { useEffect } from 'react';

/**
 * Hook para cargar POIs desde la API
 */
export function usePOIs(category?: string) {
  const { data: session } = useSession();
  const { setPOIs, pois } = usePOIStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pois', category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await fetch(`/api/pois?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar POIs');
      }
      const data = await response.json();
      return data.pois as POI[];
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Actualizar store cuando cambian los datos
  useEffect(() => {
    if (data) {
      setPOIs(data);
    }
  }, [data, setPOIs]);

  return {
    pois: data || pois,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook para registrar una visita a un POI
 */
export function useVisitPOI() {
  const { markAsVisited } = usePOIStore();

  const visitPOI = async (poiId: string, data: {
    nfcUid?: string;
    latitude?: number;
    longitude?: number;
    deviceInfo?: string;
  }) => {
    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poiId,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar visita');
      }

      const result = await response.json();

      // Marcar como visitado en el store local
      markAsVisited(poiId);

      return result;
    } catch (error) {
      console.error('Error visiting POI:', error);
      throw error;
    }
  };

  return { visitPOI };
}

/**
 * Hook para calcular POIs cercanos
 */
export function useNearbyPOIs(userLat?: number, userLng?: number, radiusKm = 1) {
  const { pois } = usePOIStore();

  if (!userLat || !userLng) {
    return { nearbyPOIs: [], count: 0 };
  }

  const nearbyPOIs = pois.filter((poi) => {
    const distance = calculateDistance(userLat, userLng, poi.lat, poi.lng);
    return distance <= radiusKm;
  }).sort((a, b) => {
    const distA = calculateDistance(userLat, userLng, a.lat, a.lng);
    const distB = calculateDistance(userLat, userLng, b.lat, b.lng);
    return distA - distB;
  });

  return {
    nearbyPOIs,
    count: nearbyPOIs.length,
  };
}

// Helper: Calcular distancia entre coordenadas (en km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface POI {
  id: string;
  nfcUid: string;
  slug: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  name: {
    es: string;
    en: string;
    fr: string;
    de: string;
  };
  description: {
    es: string;
    en: string;
    fr: string;
    de: string;
  };
  images: string[];
  audioGuide?: {
    es?: string;
    en?: string;
    fr?: string;
    de?: string;
  };
  videoUrl?: string;
  externalLink?: string;
  points: number;
  xpReward: number;
  premiumOnly: boolean;
  difficulty: string;
  duration: number;
  isVisited?: boolean;
  visitedAt?: string;
}

interface POIStore {
  pois: POI[];
  selectedPOI: POI | null;
  visitedPOIs: Set<string>;
  nearbyPOIs: POI[];

  // Actions
  setPOIs: (pois: POI[]) => void;
  selectPOI: (poi: POI | null) => void;
  markAsVisited: (poiId: string) => void;
  setVisitedPOIs: (poiIds: string[]) => void;
  clearVisited: () => void;
  setNearbyPOIs: (pois: POI[]) => void;
  getPOIById: (id: string) => POI | undefined;
}

export const usePOIStore = create<POIStore>()(
  persist(
    (set, get) => ({
      pois: [],
      selectedPOI: null,
      visitedPOIs: new Set<string>(),
      nearbyPOIs: [],

      setPOIs: (pois) => set({ pois }),

      selectPOI: (poi) => set({ selectedPOI: poi }),

      markAsVisited: (poiId) =>
        set((state) => {
          const newVisited = new Set(state.visitedPOIs).add(poiId);
          console.log('📍 POI marcado como visitado:', { poiId, totalVisited: newVisited.size });
          return { visitedPOIs: newVisited };
        }),

      setVisitedPOIs: (poiIds) => {
        console.log('🔄 Reemplazando POIs visitados con datos del servidor:', poiIds.length);
        set({ visitedPOIs: new Set(poiIds) });
      },

      clearVisited: () => {
        console.log('🗑️ Limpiando POIs visitados');
        set({ visitedPOIs: new Set() });
      },

      setNearbyPOIs: (pois) => set({ nearbyPOIs: pois }),

      getPOIById: (id) => get().pois.find((poi) => poi.id === id),
    }),
    {
      name: 'poi-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        visitedPOIs: Array.from(state.visitedPOIs), // Convertir Set a Array para serializar
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as object),
        visitedPOIs: new Set(
          (persistedState as { visitedPOIs?: string[] })?.visitedPOIs || []
        ), // Reconvertir Array a Set al cargar
      }),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UserStore {
  location: UserLocation | null;
  isTracking: boolean;
  permissionGranted: boolean;

  // Actions
  setLocation: (location: UserLocation) => void;
  startTracking: () => void;
  stopTracking: () => void;
  setPermission: (granted: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      location: null,
      isTracking: false,
      permissionGranted: false,

      setLocation: (location) => set({ location }),
      startTracking: () => set({ isTracking: true }),
      stopTracking: () => set({ isTracking: false }),
      setPermission: (granted) => set({ permissionGranted: granted }),
    }),
    {
      name: 'user-location-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

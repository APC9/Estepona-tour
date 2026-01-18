import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Badge {
  id: string;
  slug: string;
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
  icon: string;
  rarity: string;
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  completedAt: string;
}

interface PendingVisit {
  poiId: string;
  scannedAt: string;
  latitude?: number;
  longitude?: number;
}

interface GamificationStore {
  level: number;
  experiencePoints: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  achievements: Achievement[];
  pendingSyncVisits: PendingVisit[];

  // Actions
  addExperience: (xp: number) => void;
  addPoints: (points: number) => void;
  unlockBadge: (badge: Badge) => void;
  addAchievement: (achievement: Achievement) => void;
  updateStreak: (days: number) => void;
  addPendingVisit: (visit: PendingVisit) => void;
  clearPendingVisits: () => void;
  calculateLevel: (xp: number) => number;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      level: 1,
      experiencePoints: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
      achievements: [],
      pendingSyncVisits: [],

      addExperience: (xp) =>
        set((state) => {
          const newXP = state.experiencePoints + xp;
          const newLevel = get().calculateLevel(newXP);
          console.log('🎮 XP actualizado:', { oldXP: state.experiencePoints, addedXP: xp, newXP, oldLevel: state.level, newLevel });
          return {
            experiencePoints: newXP,
            level: newLevel,
          };
        }),

      addPoints: (points) =>
        set((state) => {
          console.log('💎 Puntos actualizados:', { oldPoints: state.totalPoints, addedPoints: points, newPoints: state.totalPoints + points });
          return {
            totalPoints: state.totalPoints + points,
          };
        }),

      unlockBadge: (badge) =>
        set((state) => {
          const exists = state.badges.some((b) => b.id === badge.id);
          if (exists) return state;
          return {
            badges: [...state.badges, { ...badge, unlockedAt: new Date().toISOString() }],
          };
        }),

      addAchievement: (achievement) =>
        set((state) => ({
          achievements: [...state.achievements, achievement],
        })),

      updateStreak: (days) =>
        set((state) => ({
          currentStreak: days,
          longestStreak: Math.max(state.longestStreak, days),
        })),

      addPendingVisit: (visit) =>
        set((state) => ({
          pendingSyncVisits: [...state.pendingSyncVisits, visit],
        })),

      clearPendingVisits: () => set({ pendingSyncVisits: [] }),

      // Fórmula de nivel: nivel = floor(sqrt(xp / 100))
      calculateLevel: (xp) => Math.floor(Math.sqrt(xp / 100)) + 1,
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

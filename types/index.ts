/**
 * Tipos globales de la aplicación
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface POILocation extends Coordinates {
  address: string;
}

export interface MultilingualContent {
  es: string;
  en: string;
  fr: string;
  de: string;
}

export interface Reward {
  points: number;
  xp: number;
  badge?: Badge;
}

export interface Badge {
  id: string;
  slug: string;
  name: MultilingualContent;
  description: MultilingualContent;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category?: string;
  pointsReward: number;
  xpReward: number;
  unlockedAt?: string;
}

export interface UserStats {
  level: number;
  experiencePoints: number;
  totalPoints: number;
  visitedPOIs: number;
  totalPOIs: number;
  badgesEarned: number;
  currentStreak: number;
  longestStreak: number;
}

export interface VisitData {
  poiId: string;
  scannedAt: string;
  duration?: number;
  rating?: number;
  comment?: string;
  latitude?: number;
  longitude?: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FilterOptions {
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  premiumOnly?: boolean;
  visited?: boolean;
  nearby?: boolean;
  search?: string;
}

export interface SortOptions {
  field: 'name' | 'distance' | 'points' | 'difficulty' | 'duration';
  order: 'asc' | 'desc';
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface POI {
  id: string;
  name: MultilingualContent;
  category: string;
  latitude: number;
  longitude: number;
  images: string[];
  visited?: boolean;
}

export interface Recommendation {
  poi: POI;
  score: number;
  reason: string;
  distance?: number;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type Tier = 'FREE' | 'PREMIUM' | 'FAMILY';
export type Language = 'ES' | 'EN' | 'FR' | 'DE';
export type Category =
  | 'MONUMENT'
  | 'MUSEUM'
  | 'VIEWPOINT'
  | 'RESTAURANT'
  | 'BEACH'
  | 'PARK'
  | 'HISTORIC'
  | 'CULTURE'
  | 'NATURE'
  | 'SHOPPING';

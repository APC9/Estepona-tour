/**
 * Configuración de constantes de la aplicación
 */

// Configuración del mapa
export const MAP_CONFIG = {
  CENTER: {
    lat: 36.4273,
    lng: -5.1483,
  },
  DEFAULT_ZOOM: 15,
  MAX_ZOOM: 18,
  MIN_ZOOM: 13,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

// Configuración de proximidad
export const PROXIMITY_CONFIG = {
  THRESHOLD_METERS: parseInt(process.env.NEXT_PUBLIC_PROXIMITY_THRESHOLD_METERS || '50'),
  NEARBY_RADIUS_KM: 1,
  GPS_UPDATE_INTERVAL_MS: 5000,
} as const;

// Configuración de gamificación
export const GAMIFICATION_CONFIG = {
  XP_PER_LEVEL: 100, // XP base para nivel 1
  LEVEL_FORMULA: (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1,
  MIN_POINTS_PER_POI: 10,
  MAX_POINTS_PER_POI: 50,
  MIN_XP_PER_POI: 50,
  MAX_XP_PER_POI: 200,
} as const;

// Configuración de premios (postales sublimadas en aluminio)
export const REWARDS_CONFIG = {
  BRONZE: {
    name: 'Bronce',
    emoji: '🥉',
    pointsRequired: 500,
    size: '10x15 cm',
    description: 'Postal sublimada en aluminio acabado mate',
  },
  SILVER: {
    name: 'Plata',
    emoji: '🥈',
    pointsRequired: 1500,
    size: '15x20 cm',
    description: 'Postal sublimada en aluminio premium acabado brillante con marco',
  },
  GOLD: {
    name: 'Oro',
    emoji: '🥇',
    pointsRequired: 3000,
    size: '20x30 cm',
    description: 'Postal sublimada en aluminio de lujo acabado espejo con marco premium y certificado',
  },
} as const;

// Configuración de tiers
export const TIER_CONFIG = {
  FREE: {
    name: 'Free',
    maxPOIs: 5,
    features: ['Mapa básico', '5 POIs', 'Contenido texto + imágenes'],
    price: 0,
  },
  PREMIUM: {
    name: 'Premium',
    maxPOIs: -1, // Ilimitado
    features: [
      'Todos los POIs',
      'Audio-guías',
      'Videos exclusivos',
      'Gamificación completa',
      'Descuentos',
      'Sin anuncios',
    ],
    price: 9.99,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },
  FAMILY: {
    name: 'Family',
    maxPOIs: -1,
    features: [
      'Todas las ventajas Premium',
      'Hasta 5 cuentas',
      'Contenido familiar',
      'Rutas personalizadas',
    ],
    price: 14.99,
    stripePriceId: process.env.STRIPE_FAMILY_PRICE_ID,
  },
} as const;

// Categorías de POIs
export const POI_CATEGORIES = [
  { value: 'MONUMENT', label: 'Monumentos', emoji: '🏛️' },
  { value: 'MUSEUM', label: 'Museos', emoji: '🏛️' },
  { value: 'VIEWPOINT', label: 'Miradores', emoji: '👁️' },
  { value: 'RESTAURANT', label: 'Restaurantes', emoji: '🍽️' },
  { value: 'BEACH', label: 'Playas', emoji: '🏖️' },
  { value: 'PARK', label: 'Parques', emoji: '🌳' },
  { value: 'HISTORIC', label: 'Históricos', emoji: '🏰' },
  { value: 'CULTURE', label: 'Cultura', emoji: '🎭' },
  { value: 'NATURE', label: 'Naturaleza', emoji: '🌿' },
  { value: 'SHOPPING', label: 'Compras', emoji: '🛍️' },
] as const;

// Dificultades
export const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: 'Fácil', color: 'green' },
  { value: 'MEDIUM', label: 'Medio', color: 'yellow' },
  { value: 'HARD', label: 'Difícil', color: 'red' },
] as const;

// Idiomas soportados
export const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const;

// Rareza de badges
export const BADGE_RARITIES = [
  { value: 'COMMON', label: 'Común', color: 'gray' },
  { value: 'RARE', label: 'Raro', color: 'blue' },
  { value: 'EPIC', label: 'Épico', color: 'purple' },
  { value: 'LEGENDARY', label: 'Legendario', color: 'gold' },
] as const;

// Límites de la API
export const API_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGES_PER_POI: 10,
  MAX_AUDIO_DURATION_MINUTES: 15,
  REQUEST_TIMEOUT_MS: 30000,
  RATE_LIMIT_PER_MINUTE: 60,
} as const;

// Configuración de caché
export const CACHE_CONFIG = {
  POI_CACHE_TTL: 5 * 60, // 5 minutos en segundos
  USER_CACHE_TTL: 10 * 60, // 10 minutos
  STATIC_CACHE_TTL: 24 * 60 * 60, // 24 horas
} as const;

// URLs de webhooks
export const WEBHOOK_URLS = {
  POI_VISITED: `${process.env.N8N_WEBHOOK_URL}/poi-visited`,
  USER_REGISTERED: `${process.env.N8N_WEBHOOK_URL}/user-registered`,
  TOUR_COMPLETED: `${process.env.N8N_WEBHOOK_URL}/tour-completed`,
  TIER_UPGRADED: `${process.env.N8N_WEBHOOK_URL}/tier-upgraded`,
} as const;

// Validaciones
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 200,
} as const;

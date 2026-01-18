# 🏗️ Arquitectura del Sistema - Estepona Tours

## 📐 Visión General

Estepona Tours es una aplicación full-stack moderna construida con Next.js 14, siguiendo principios de **Clean Architecture** y **SOLID**. La arquitectura está diseñada para ser escalable, mantenible y preparada para crecer.

---

## 🎯 Principios Arquitectónicos

### 1. **Separation of Concerns**
- **Presentación** (Components): UI y lógica de presentación
- **Lógica de Negocio** (Hooks, Stores): Estado y reglas de negocio
- **Datos** (API Routes, Prisma): Acceso y persistencia de datos

### 2. **SOLID Principles**
- **S**ingle Responsibility: Cada componente/función tiene una responsabilidad
- **O**pen/Closed: Extensible sin modificar código existente
- **L**iskov Substitution: Los componentes son intercambiables
- **I**nterface Segregation: Interfaces específicas en lugar de generales
- **D**ependency Inversion: Dependemos de abstracciones (hooks, stores)

### 3. **DRY (Don't Repeat Yourself)**
- Utilidades compartidas en `/lib/utils.ts`
- Componentes reutilizables en `/components`
- Hooks personalizados en `/hooks`

---

## 🗂️ Estructura de Capas

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │
│  (React Components, Pages)          │
│  - GameMap.tsx                      │
│  - POIDetailModal.tsx               │
│  - NFCScanner.tsx                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│     APPLICATION LAYER               │
│  (Hooks, State Management)          │
│  - useGeolocation()                 │
│  - usePOIs()                        │
│  - Zustand Stores                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│     BUSINESS LOGIC LAYER            │
│  (API Routes, Services)             │
│  - /api/pois                        │
│  - /api/visits                      │
│  - Gamification Logic               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│     DATA ACCESS LAYER               │
│  (Prisma ORM, Database)             │
│  - Prisma Client                    │
│  - PostgreSQL                       │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. **Lectura de Datos (Query Flow)**

```
User Action (Click POI)
    │
    ▼
React Component
    │
    ▼
Custom Hook (usePOIs)
    │
    ▼
React Query (Fetch)
    │
    ▼
API Route (/api/pois)
    │
    ▼
Prisma Client
    │
    ▼
PostgreSQL Database
    │
    ▼
Response ← ← ← ← ← ←
```

### 2. **Escritura de Datos (Mutation Flow)**

```
User Action (Scan NFC)
    │
    ▼
NFCScanner Component
    │
    ▼
useVisitPOI Hook
    │
    ▼
POST /api/visits
    │
    ▼
Validation Layer
    │
    ├─► Check proximity (GPS)
    ├─► Verify NFC UID
    └─► Check user tier
    │
    ▼
Business Logic
    │
    ├─► Calculate rewards
    ├─► Update user stats
    └─► Check badge unlocks
    │
    ▼
Prisma Transaction
    │
    ├─► Create Visit
    ├─► Update User
    └─► Check Badges
    │
    ▼
Side Effects
    │
    ├─► Send Webhook (n8n)
    ├─► Update Local Store
    └─► Show Notification
```

---

## 🎨 Componentes de UI

### Jerarquía de Componentes

```
App
├── RootLayout
│   ├── Providers
│   │   ├── SessionProvider (Auth)
│   │   └── QueryClientProvider (Data)
│   │
│   └── MainLayout
│       ├── UserProgress (Header)
│       │   ├── Level Display
│       │   ├── XP Progress Bar
│       │   └── Stats
│       │
│       ├── GameMap (Main Content)
│       │   ├── Leaflet Map
│       │   ├── POI Markers
│       │   │   └── POICard (Popup)
│       │   ├── Player Avatar
│       │   └── Map Controls
│       │
│       ├── NFCScannerButton (Floating)
│       │
│       └── POIDetailModal (Overlay)
│           ├── Image Gallery
│           ├── POI Info
│           ├── Audio Player
│           └── Actions
│
└── Modals/Overlays
    ├── NFCScanner
    ├── BadgeUnlocked
    └── LevelUp
```

### Patrón de Composición

Los componentes siguen el patrón **Container/Presentational**:

- **Container Components**: Manejan lógica y estado
  - `MapPage` (gestiona estado del mapa)
  - `ProfilePage` (gestiona datos del usuario)

- **Presentational Components**: Solo renderizado
  - `POICard` (muestra info del POI)
  - `BadgeDisplay` (muestra badge)

---

## 📊 State Management

### Estrategia de Estado

1. **Server State** (React Query)
   - POIs desde la API
   - Visits history
   - User profile
   - Cache automático + invalidación

2. **Client State** (Zustand)
   - User location
   - Selected POI
   - UI state (modals, filters)
   - Gamification progress
   - Offline queue

3. **Form State** (React Hook Form)
   - Login/Register forms
   - POI creation form (admin)

### Zustand Stores

```typescript
// userStore: Geolocalización y permisos
- location: UserLocation
- isTracking: boolean
- permissionGranted: boolean

// poiStore: POIs y selección
- pois: POI[]
- selectedPOI: POI | null
- visitedPOIs: Set<string>
- nearbyPOIs: POI[]

// gamificationStore: Progreso del jugador
- level: number
- experiencePoints: number
- totalPoints: number
- badges: Badge[]
- pendingSyncVisits: Visit[]
```

---

## 🔐 Seguridad

### Capas de Seguridad

1. **Autenticación (NextAuth)**
   - OAuth2 con Google/Apple
   - JWT sessions
   - CSRF protection

2. **Autorización**
   - Route protection con middleware
   - API routes verifican sesión
   - Admin routes requieren rol especial

3. **Validación de Datos**
   - Zod schemas en API routes
   - Client-side validation
   - Sanitización de inputs

4. **Geolocalización**
   - Validación de proximidad GPS
   - Prevención de spoofing
   - Rate limiting por usuario

5. **NFC/QR**
   - UIDs únicos por POI
   - Verificación de existencia en DB
   - Anti-replay (no múltiples scans)

---

## 🌐 API Design

### RESTful Endpoints

```
GET    /api/pois              # Listar POIs
POST   /api/pois              # Crear POI (admin)
GET    /api/pois/[id]         # Detalle POI
PUT    /api/pois/[id]         # Actualizar POI (admin)
DELETE /api/pois/[id]         # Eliminar POI (admin)

POST   /api/visits            # Registrar visita
GET    /api/visits            # Historial de visitas

GET    /api/gamification/badges      # Badges disponibles
GET    /api/gamification/leaderboard # Ranking

POST   /api/payments/checkout        # Crear sesión Stripe
POST   /api/webhooks/stripe          # Webhook Stripe
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// O en caso de error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🗄️ Modelo de Datos

### Relaciones Clave

```
User ←──┐
    │   │
    │   │ 1:N
    │   │
    └──→ Visit ←──┐
            │     │
            │ N:1 │
            │     │
            └────→ POI

User ←──┐
    │   │
    │   │ N:M (UserBadge)
    │   │
    └──→ Badge
```

### Normalización

- **3NF (Third Normal Form)**: No redundancia de datos
- **Índices**: En campos frecuentemente consultados
- **Unique constraints**: nfcUid, email, slug

---

## 📱 PWA Architecture

### Service Worker Strategy

```javascript
// Estrategia de caché
- **Cache First**: Assets estáticos (CSS, JS, imágenes)
- **Network First**: API calls (datos dinámicos)
- **Cache Only**: Offline fallback
```

### Offline Queue

1. User escanea POI sin conexión
2. Visita se guarda en `pendingSyncVisits` (Zustand + IndexedDB)
3. Background sync detecta conexión
4. Envía visitas pendientes a `/api/visits`
5. Actualiza estado local

---

## 🔄 Lifecycle Hooks

### Component Lifecycle

```typescript
// Mounting
useEffect(() => {
  // Initialize map
  // Start GPS tracking
  // Load POIs from API
}, []);

// Updating
useEffect(() => {
  // Update player position on map
}, [location]);

// Cleanup
useEffect(() => {
  return () => {
    // Stop GPS tracking
    // Cleanup map instance
  };
}, []);
```

---

## 🚀 Performance Optimizations

### 1. **Code Splitting**
- Dynamic imports para componentes pesados
- Route-based splitting automático (Next.js)

### 2. **Memoization**
```typescript
const memoizedValue = useMemo(() => calculateValue(), [deps]);
const memoizedCallback = useCallback(() => {}, [deps]);
```

### 3. **Virtual Scrolling**
- Para listas largas de POIs
- Renderizar solo elementos visibles

### 4. **Image Optimization**
- Next.js Image component
- Lazy loading
- Responsive images

### 5. **Database**
- Índices en columnas frecuentes
- Connection pooling (Prisma)
- Query optimization

---

## 🧪 Testing Strategy

### Pirámide de Testing

```
      /\
     /  \    E2E Tests (Playwright)
    /────\   - User flows
   /  UI  \  - Critical paths
  /────────\
 / Integration \ 
/    Tests     \  - API routes
───────────────── - Hooks
   Unit Tests     - Utilities
                  - Components
```

### Test Coverage Goals
- Unit: 80%+
- Integration: 60%+
- E2E: Critical paths

---

## 📦 Deployment Pipeline

```
Developer Push
    │
    ▼
GitHub Repository
    │
    ▼
Vercel Build
    │
    ├─► Install dependencies
    ├─► Run linter
    ├─► Build Next.js
    ├─► Generate Prisma Client
    └─► Run tests
    │
    ▼
Deploy to Vercel
    │
    ├─► Edge Functions
    ├─► Static Assets (CDN)
    └─► Environment Variables
    │
    ▼
Production Live ✅
```

---

## 🔮 Escalabilidad Futura

### Horizontal Scaling
- Serverless functions (auto-scale)
- CDN para assets estáticos
- Database read replicas

### Vertical Scaling
- Upgrade Vercel plan (más recursos)
- Upgrade Supabase plan (más conexiones)
- Redis para heavy caching

### Microservices Potential
- Servicio dedicado para analytics
- Servicio de recomendaciones con IA
- Servicio de notificaciones push

---

## 📚 Patrones de Diseño Utilizados

1. **Repository Pattern**: Prisma como abstracción de DB
2. **Factory Pattern**: Creación de stores de Zustand
3. **Observer Pattern**: React Query subscriptions
4. **Strategy Pattern**: Diferentes métodos de pago (Stripe)
5. **Singleton Pattern**: Prisma Client instance
6. **Decorator Pattern**: HOCs para protección de rutas

---

## 🛠️ Herramientas de Desarrollo

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Prisma Studio**: Database GUI
- **React Query Devtools**: State inspection
- **Vercel Analytics**: Performance monitoring

---

## 📖 Documentación Adicional

- [API Documentation](./docs/API.md) (futuro)
- [Component Library](./docs/COMPONENTS.md) (futuro)
- [Database Schema](./prisma/schema.prisma)
- [Setup Guide](./SETUP.md)

---

**Desarrollado con principios de software engineering de calidad** ✨

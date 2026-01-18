# 🗺️ Estepona Tours - Aplicación de Turismo Gamificado

Una plataforma innovadora de experiencias turísticas autoguiadas para Estepona, Málaga, España. Los turistas escanean etiquetas NFC/QR en puntos de interés para desbloquear contenido multimedia, ganar puntos y obtener recomendaciones personalizadas.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)

---

## 🚀 Inicio Rápido con Docker

### Opción 1: Script Automático (Recomendado)

```powershell
# Windows PowerShell
.\start-dev.ps1
```

Este script automáticamente:
- ✅ Verifica Docker
- ✅ Levanta PostgreSQL, Redis y pgAdmin
- ✅ Instala dependencias con pnpm
- ✅ Configura variables de entorno
- ✅ Inicia el servidor de desarrollo

### Opción 2: Manual

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Instalar dependencias
pnpm install

# 3. Aplicar schema y seed
pnpm prisma db push
pnpm run seed

# 4. Iniciar desarrollo
pnpm dev
```

📖 **Documentación completa**: Ver [README.Docker.md](README.Docker.md)

---

## ✨ Características Principales

### 🎮 Sistema de Gamificación
- **Niveles y Experiencia (XP)**: Sistema de progresión con niveles desbloqueables
- **Badges y Logros**: Colecciona badges temáticos y desbloquea logros especiales
- **Sistema de Puntos**: Acumula puntos canjeables por descuentos en comercios locales
- **Streaks**: Mantén rachas de días consecutivos explorando
- **Leaderboard**: Compite con otros turistas (opcional)

### 🗺️ Mapa Interactivo 2D Gamificado
- Mapa base con OpenStreetMap centrado en Estepona
- Marcadores animados estilo pixel art para cada POI
- Avatar del jugador que se mueve en tiempo real con GPS
- Fog of war: áreas que se revelan al visitarlas
- Animaciones de desbloqueo al completar POIs

### 📱 Escaneo NFC/QR Híbrido
- Lectura de etiquetas NFC mediante Web NFC API
- Fallback automático a escaneo QR
- Validación de proximidad GPS (usuario debe estar <50m del POI)
- Registro automático de visitas y otorgamiento de recompensas

### 🌍 Multiidioma
Soporte completo para:
- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇫🇷 Francés
- 🇩🇪 Alemán

### 💎 Tiers de Subscripción
**Free Tier:**
- 5 POIs básicos
- Contenido texto + imágenes
- Mapa básico

**Premium Tier (€9.99):**
- Acceso ilimitado a todos los POIs
- Audio-guías completas en 4 idiomas
- Videos exclusivos
- Gamificación completa
- Descuentos en restaurantes
- Sin anuncios

### 📊 Dashboard Analytics (Admin)
- Visitas por POI con gráficas interactivas
- Mapa de calor de actividad
- Rutas más populares
- Demografía de usuarios
- Tasa de conversión free → premium

### 📚 Documentación Completa

- 📖 **[CHECKLIST.md](CHECKLIST.md)** - Verificación paso a paso del setup
- 🔐 **[OAUTH-SETUP.md](OAUTH-SETUP.md)** - Guía completa de Google OAuth
- 🐳 **[README.Docker.md](README.Docker.md)** - Docker y base de datos
- ⚡ **[SETUP.md](SETUP.md)** - Setup rápido
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del proyecto
- 🔗 **[WEBHOOKS.md](WEBHOOKS.md)** - Integración con n8n
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy a producción
- 💻 **[COMMANDS.md](COMMANDS.md)** - Comandos útiles

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ con App Router
- **UI**: React + TypeScript + Tailwind CSS
- **Mapas**: Leaflet.js + PixiJS para overlay 2D
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Auth**: NextAuth.js (Google, Apple)
- **PWA**: next-pwa para soporte offline

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL con Prisma ORM
- **Storage**: Cloudinary (multimedia)
- **Payments**: Stripe
- **Cache**: Redis (Upstash)

### Infraestructura
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis

## 🚀 Instalación y Setup

### Prerequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/tu-usuario/estepona-tours.git
cd estepona-tours
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Copia \`.env.example\` a \`.env\` y configura las variables:

\`\`\`bash
cp .env.example .env
\`\`\`

**Variables críticas a configurar:**
\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/estepona_tours"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-seguro-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
\`\`\`

### 4. Configurar base de datos
\`\`\`bash
# Generar Prisma Client
npx prisma generate

# Sincronizar schema con la base de datos
npx prisma db push

# Poblar con datos de ejemplo
npm run seed
\`\`\`

### 5. Iniciar servidor de desarrollo
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

\`\`\`
estepona-tours/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # Rutas principales
│   │   ├── map/            # Vista del mapa
│   │   ├── profile/        # Perfil de usuario
│   │   └── achievements/   # Logros y badges
│   ├── (admin)/            # Panel de administración
│   │   ├── dashboard/
│   │   ├── pois/
│   │   └── analytics/
│   ├── api/                # API Routes
│   │   ├── auth/
│   │   ├── pois/
│   │   ├── visits/
│   │   └── webhooks/
│   ├── globals.css
│   └── layout.tsx
├── components/             # Componentes React
│   ├── map/
│   │   ├── GameMap.tsx
│   │   ├── POIMarker.tsx
│   │   └── PlayerAvatar.tsx
│   ├── nfc/
│   │   ├── NFCScanner.tsx
│   │   └── QRScanner.tsx
│   ├── poi/
│   │   ├── POICard.tsx
│   │   └── POIDetailModal.tsx
│   └── gamification/
│       ├── ProgressBar.tsx
│       └── BadgeDisplay.tsx
├── lib/                    # Utilidades y configuración
│   ├── stores/            # Zustand stores
│   │   ├── userStore.ts
│   │   ├── poiStore.ts
│   │   └── gamificationStore.ts
│   ├── auth.ts
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma      # Schema de base de datos
│   └── seed.ts           # Datos de ejemplo
├── public/               # Assets estáticos
│   ├── sprites/
│   ├── markers/
│   └── manifest.json
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── README.md
\`\`\`

## 🎯 Uso de la Aplicación

### Para Turistas

1. **Registro/Login**: Inicia sesión con Google o Apple
2. **Explorar Mapa**: Navega por el mapa de Estepona y descubre POIs
3. **Escanear POI**: Al llegar a un punto de interés, escanea la etiqueta NFC o código QR
4. **Desbloquear Contenido**: Accede a información, fotos, audio-guías y videos
5. **Ganar Recompensas**: Acumula puntos, XP y desbloquea badges
6. **Completar Tour**: Visita todos los POIs para obtener certificado digital

### Para Administradores

1. **Panel Admin**: Accede a `/admin/dashboard`
2. **Gestión POIs**: Crear, editar y eliminar puntos de interés
3. **Subir Multimedia**: Integración con Cloudinary para gestionar assets
4. **Analytics**: Visualiza estadísticas de uso y comportamiento de usuarios
5. **CMS**: Gestiona traducciones y contenido multiidioma

## 🔌 API Endpoints

### POIs
- `GET /api/pois` - Obtener todos los POIs
- `POST /api/pois` - Crear nuevo POI (admin)
- `GET /api/pois/[id]` - Obtener POI específico
- `PUT /api/pois/[id]` - Actualizar POI (admin)
- `DELETE /api/pois/[id]` - Eliminar POI (admin)

### Visitas
- `POST /api/visits` - Registrar visita (escaneo)
- `GET /api/visits` - Historial de visitas del usuario

### Gamificación
- `GET /api/gamification/badges` - Obtener badges disponibles
- `GET /api/gamification/leaderboard` - Obtener ranking

### Webhooks (n8n)
- `POST /api/webhooks/poi-visited` - Evento: POI visitado
- `POST /api/webhooks/user-registered` - Evento: Usuario registrado
- `POST /api/webhooks/tour-completed` - Evento: Tour completado
- `POST /api/webhooks/tier-upgraded` - Evento: Upgrade a premium

## 🧪 Testing

\`\`\`bash
# Ejecutar tests unitarios
npm test

# Tests con coverage
npm test -- --coverage

# Tests E2E (Playwright)
npm run test:e2e
\`\`\`

## 📦 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**: Importa tu repo en Vercel
2. **Configurar variables de entorno**: Añade todas las env vars en Vercel Dashboard
3. **Deploy**: Vercel hará deploy automático en cada push

\`\`\`bash
# O deployment manual
vercel --prod
\`\`\`

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables en Vercel:
- Database URL (Supabase)
- NextAuth secrets
- OAuth credentials (producción)
- Cloudinary credentials
- Stripe keys (producción)
- Redis URL

## 🔐 Seguridad

- ✅ Autenticación OAuth2 con NextAuth (Google)
- ✅ **Autenticación por Email con código de verificación** (NEW!)
- ✅ JWT (JSON Web Tokens) para sesiones seguras
- ✅ Validación de proximidad GPS para escaneos
- ✅ Protección CSRF
- ✅ Rate limiting en API routes
- ✅ Sanitización de inputs
- ✅ Headers de seguridad (Helmet)

📧 **Ver [EMAIL-AUTH-SETUP.md](EMAIL-AUTH-SETUP.md)** para configurar autenticación por email
🔒 **Ver [EMAIL-AUTH-SECURITY.md](EMAIL-AUTH-SECURITY.md)** para mejores prácticas de seguridad JWT

## 🌐 Internacionalización (i18n)

La app soporta 4 idiomas usando `next-intl`:
- Archivos de traducción en `/messages/`
- Detección automática de idioma del navegador
- Selector de idioma en perfil de usuario

## 📱 PWA (Progressive Web App)

- ✅ Instalable en dispositivos móviles
- ✅ Funciona offline (caché de POIs visitados)
- ✅ Notificaciones push (próximamente)
- ✅ Background sync para visitas offline

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Arquitecto de Software**: Diseño y desarrollo full-stack
- **UX/UI Designer**: Diseño de experiencia de usuario
- **Content Manager**: Creación de contenido para POIs

## 📞 Soporte

- Email: support@esteponatours.com
- Web: https://esteponatours.com
- GitHub Issues: https://github.com/tu-usuario/estepona-tours/issues

## 🗺️ Roadmap

### Fase 1 (Completado) ✅
- [x] Setup proyecto + base de datos
- [x] Sistema de autenticación
- [x] Mapa con Leaflet + overlay
- [x] Sistema NFC/QR
- [x] Gamificación básica

### Fase 2 (En Progreso) 🚧
- [ ] Audio-guías
- [ ] Tier premium + Stripe
- [ ] PWA completo + offline mode
- [ ] Dashboard analytics

### Fase 3 (Planeado) 📋
- [ ] Mejoras visuales del mapa 2D (sprites avanzados)
- [ ] Recomendaciones con IA
- [ ] AR (Realidad Aumentada)
- [ ] Integración n8n webhooks
- [ ] App móvil nativa (React Native)

---

**¡Desarrollado con ❤️ en Estepona, España!** 🇪🇸

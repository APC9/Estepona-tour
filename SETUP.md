# 📋 Guía de Setup Rápido - Estepona Tours

## 🚀 Instalación en 5 minutos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos local (opcional)
Si tienes PostgreSQL instalado localmente:

```bash
# Crear base de datos
createdb estepona_tours

# Actualizar .env con tu URL local
echo "DATABASE_URL=postgresql://usuario:password@localhost:5432/estepona_tours" > .env
```

### 3. O usar Supabase (recomendado para desarrollo)
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar Database URL desde Settings > Database
4. Pegarla en `.env` como `DATABASE_URL`

### 4. Configurar Google OAuth (para login)

#### Obtener credenciales:
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear nuevo proyecto o seleccionar uno existente
3. Ir a "APIs & Services" > "Credentials"
4. Crear "OAuth 2.0 Client ID"
5. Agregar URL autorizada: `http://localhost:3000/api/auth/callback/google`
6. Copiar Client ID y Client Secret a `.env`

```env
GOOGLE_CLIENT_ID="tu-client-id-aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-secret-aqui"
```

### 5. Generar NEXTAUTH_SECRET
```bash
# En terminal (Linux/Mac)
openssl rand -base64 32

# O en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copiar resultado a `.env`:
```env
NEXTAUTH_SECRET="el-secret-generado-aqui"
```

### 6. Inicializar base de datos
```bash
# Generar Prisma Client
npx prisma generate

# Sincronizar schema
npx prisma db push

# Poblar con datos de ejemplo
npm run seed
```

### 7. Iniciar servidor de desarrollo
```bash
npm run dev
```

¡Listo! Abre [http://localhost:3000](http://localhost:3000)

---

## 🔧 Configuración Opcional (para producción)

### Cloudinary (para imágenes)
1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Obtener Cloud Name, API Key y API Secret del Dashboard
3. Agregar a `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### Stripe (para pagos)
1. Crear cuenta en [stripe.com](https://stripe.com)
2. Obtener API keys (usar test keys para desarrollo)
3. Agregar a `.env`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### Upstash Redis (para caché)
1. Crear cuenta en [upstash.com](https://upstash.com)
2. Crear Redis database
3. Copiar REST URL y Token
4. Agregar a `.env`:
```env
REDIS_URL="https://xxx.upstash.io"
REDIS_TOKEN="tu-token"
```

---

## 📱 Testing en dispositivo móvil

Para probar NFC en tu móvil:

1. **Exponer servidor local:**
```bash
# Usar ngrok o similar
npx ngrok http 3000
```

2. **Actualizar NEXTAUTH_URL:**
```env
NEXTAUTH_URL="https://tu-url-ngrok.ngrok.io"
```

3. **Abrir en móvil:**
   - Visitar la URL de ngrok
   - Permitir permisos de ubicación
   - Probar funcionalidad NFC

---

## 🎮 Usar la aplicación

### Login
1. Clic en "Iniciar Sesión"
2. Seleccionar "Continuar con Google"
3. Autorizar la app

### Explorar mapa
1. Permitir acceso a ubicación
2. Ver POIs en el mapa
3. Hacer clic en un marcador para ver detalles

### Escanear POI (simulado)
1. Clic en botón flotante de escaneo
2. Si estás cerca del POI, se registrará visita
3. Ganarás puntos y XP

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar que PostgreSQL esté corriendo
- Verificar DATABASE_URL en .env
- Probar conexión: `npx prisma db pull`

### Error: "Module not found"
- Borrar node_modules y reinstalar: `rm -rf node_modules && npm install`
- Limpiar caché de Next.js: `rm -rf .next`

### NFC no funciona
- Verificar que el dispositivo tenga NFC
- Activar NFC en configuración del dispositivo
- Usar navegador compatible (Chrome en Android)

### Mapa no se muestra
- Verificar que Leaflet CSS se cargue correctamente
- Abrir consola del navegador para ver errores
- Verificar que el componente sea client-side: `'use client'`

---

## 📚 Comandos útiles

```bash
# Ver base de datos en navegador
npm run prisma:studio

# Resetear base de datos
npx prisma db push --force-reset

# Ver logs de desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar en producción
npm start

# Ejecutar linter
npm run lint

# Ver estado de migraciones Prisma
npx prisma migrate status
```

---

## 💡 Tips de desarrollo

1. **Hot Reload:** Los cambios se reflejan automáticamente
2. **TypeScript:** El editor mostrará errores en tiempo real
3. **Prisma Studio:** Interfaz visual para ver/editar datos
4. **React Query Devtools:** Activar en desarrollo para debugging
5. **Zustand Devtools:** Usar extensión de navegador para ver state

---

## 🌍 Cambiar idioma

Editar perfil de usuario o modificar directamente en zustand store:
```typescript
useUserStore.setState({ language: 'EN' }); // EN, ES, FR, DE
```

---

## ✅ Checklist de desarrollo

- [ ] Base de datos configurada y sincronizada
- [ ] Google OAuth funcionando
- [ ] Mapa se muestra correctamente
- [ ] Geolocalización activada
- [ ] Datos seed cargados (10 POIs)
- [ ] Sistema de puntos/XP funciona
- [ ] Badges se desbloquean correctamente
- [ ] NFC/QR funciona (o fallback implementado)

---

¿Problemas? Abre un issue en GitHub o contacta al equipo de desarrollo.

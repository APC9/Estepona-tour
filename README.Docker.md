# 🐳 Docker Setup - Estepona Tours

Guía completa para ejecutar la aplicación con Docker y pnpm.

---

## 📋 Requisitos Previos

- **Docker Desktop** instalado y ejecutándose
- **pnpm** v10+ instalado (`npm install -g pnpm`)
- **Node.js** v18+ instalado

---

## 🚀 Setup Rápido

### 1. Levantar Base de Datos

```bash
# Iniciar PostgreSQL, Redis y pgAdmin
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

**Servicios disponibles:**
- 🐘 **PostgreSQL**: `localhost:5433` (usuario: `estepona_user`, password: `estepona_password_dev`)
- 🔴 **Redis**: `localhost:6379`
- 🎨 **pgAdmin**: [http://localhost:5050](http://localhost:5050) (admin@esteponatours.com / admin)

### 2. Configurar Variables de Entorno

```bash
# El archivo .env ya está creado con la configuración de Docker
# Edita los valores de OAuth y servicios externos:
notepad .env
```

Variables críticas a configurar:
```env
# OAuth (obtener en https://console.cloud.google.com)
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Cloudinary (obtener en https://cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### 3. Instalar Dependencias

```bash
# Instalar con pnpm
pnpm install
```

### 4. Configurar Base de Datos

```bash
# Aplicar schema de Prisma
pnpm prisma db push

# Poblar con datos de prueba (10 POIs de Estepona)
pnpm run seed
```

### 5. Iniciar Aplicación

```bash
# Modo desarrollo
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Comandos Disponibles

### Desarrollo

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build para producción
pnpm start            # Servidor de producción
pnpm lint             # Ejecutar ESLint
```

### Base de Datos

```bash
pnpm prisma:studio    # Abrir Prisma Studio (GUI)
pnpm prisma:push      # Aplicar cambios del schema
pnpm run seed         # Poblar datos de prueba
```

### Docker

```bash
docker-compose up -d           # Levantar servicios
docker-compose down            # Detener servicios
docker-compose ps              # Ver estado
docker-compose logs postgres   # Ver logs de PostgreSQL
docker-compose logs -f         # Ver logs en tiempo real
docker-compose restart         # Reiniciar servicios
```

### Limpiar y Resetear

```bash
# Limpiar caché de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Resetear base de datos
pnpm prisma migrate reset
```

---

## 🎨 Acceso a pgAdmin

1. Abrir [http://localhost:5050](http://localhost:5050)
2. Login: `admin@esteponatours.com` / `admin`
3. Agregar servidor:
   - **Name**: Estepona Tours
   - **Host**: `estepona-tours-db` (nombre del contenedor)
   - **Port**: `5432` (puerto interno)
   - **Username**: `estepona_user`
   - **Password**: `estepona_password_dev`
   - **Database**: `estepona_tours`

---

## 🔍 Prisma Studio

Interfaz visual para explorar y editar datos:

```bash
pnpm prisma:studio
```

Abre automáticamente en [http://localhost:5555](http://localhost:5555)

---

## 🛠️ Troubleshooting

### Puerto 5432 ocupado

Si ya tienes PostgreSQL instalado localmente:

```bash
# El docker-compose usa puerto 5433 por defecto
# DATABASE_URL ya está configurado con :5433
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres

# Reiniciar contenedor
docker-compose restart postgres
```

### Prisma Client desactualizado

```bash
pnpm prisma generate
```

### Limpiar volúmenes de Docker

```bash
# ⚠️ ESTO ELIMINARÁ TODOS LOS DATOS
docker-compose down -v
docker-compose up -d
pnpm prisma db push
pnpm run seed
```

### Error en seed

```bash
# Verificar conexión
pnpm prisma studio

# Ejecutar seed con más info
npx tsx prisma/seed.ts
```

---

## 📊 Estructura de la Base de Datos

Después del seed, tendrás:

- **10 POIs** reales de Estepona (Torre del Reloj, Murales, Orquidario, etc.)
- **5 Badges** (First Steps, Explorer, Heritage Hunter, Culture Vulture, Street Art Fan)
- **Categorías**: Monument, Nature, Art, Beach, Shopping, Culture
- **Dificultades**: Easy, Medium, Hard, Expert

---

## 🔐 Credenciales de Desarrollo

### PostgreSQL (Docker)
- **Host**: localhost:5433
- **Database**: estepona_tours
- **User**: estepona_user
- **Password**: estepona_password_dev

### pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@esteponatours.com
- **Password**: admin

### Redis
- **URL**: redis://localhost:6379
- **Password**: (sin password en desarrollo)

---

## 🚀 Workflow de Desarrollo

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Instalar dependencias (solo primera vez)
pnpm install

# 3. Aplicar schema (solo primera vez o después de cambios)
pnpm prisma db push

# 4. Seed (solo primera vez o para resetear datos)
pnpm run seed

# 5. Iniciar desarrollo
pnpm dev

# 6. Al terminar (opcional)
docker-compose down
```

---

## 📦 Comandos con Makefile (Windows)

Si tienes `make` instalado (Git Bash, WSL, Chocolatey):

```bash
make setup      # Setup completo (db + install + seed)
make dev        # Iniciar desarrollo
make db-up      # Levantar PostgreSQL
make db-down    # Detener servicios
make seed       # Seed database
make studio     # Abrir Prisma Studio
make clean      # Limpiar archivos generados
```

---

## 🌐 URLs Útiles

- 🏠 **Aplicación**: http://localhost:3000
- 🎨 **pgAdmin**: http://localhost:5050
- 🔍 **Prisma Studio**: http://localhost:5555
- 📊 **Next.js API**: http://localhost:3000/api/pois

---

## 🔄 Actualizar Dependencias

```bash
# Ver paquetes desactualizados
pnpm outdated

# Actualizar todos
pnpm update --latest

# Actualizar específico
pnpm update next --latest

# Regenerar Prisma Client
pnpm prisma generate
```

---

## 📝 Notas Importantes

1. **Puerto cambiado**: PostgreSQL usa `5433` en lugar de `5432` para evitar conflictos
2. **NEXTAUTH_SECRET**: Ya generado automáticamente en `.env`
3. **OAuth**: Necesitas configurar Google OAuth antes de poder autenticarte
4. **Prisma Studio**: Herramienta más útil para ver/editar datos
5. **pgAdmin**: Para queries SQL avanzadas y administración
6. **Redis**: Opcional, para caché y sesiones en producción

---

## 🎯 Siguiente Paso

Configura Google OAuth:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0:
   - **Authorized JavaScript origins**: http://localhost:3000
   - **Authorized redirect URIs**: http://localhost:3000/api/auth/callback/google
5. Copia Client ID y Secret a tu `.env`
6. Reinicia el servidor: `pnpm dev`

¡Listo para desarrollar! 🚀

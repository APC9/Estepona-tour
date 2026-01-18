# ✅ Checklist de Configuración - Estepona Tours

Usa este checklist para verificar que todo está configurado correctamente.

---

## 🐳 Docker y Base de Datos

- [ ] Docker Desktop está instalado y corriendo
- [ ] Contenedores levantados: `docker-compose ps`
  - [ ] PostgreSQL (puerto 5433) - Estado: healthy
  - [ ] Redis (puerto 6379) - Estado: healthy
  - [ ] pgAdmin (puerto 5050) - Estado: running
- [ ] Base de datos creada: `estepona_tours`
- [ ] Schema aplicado: `pnpm prisma db push`
- [ ] Datos de prueba cargados: `pnpm run seed`
- [ ] 10 POIs de Estepona creados
- [ ] 5 badges configurados

**Verificar:**
```bash
docker-compose ps
pnpm prisma studio  # Debería abrir en localhost:5555
```

---

## 📦 Dependencias

- [ ] Node.js v18+ instalado
- [ ] pnpm v10+ instalado
- [ ] 797 paquetes instalados correctamente
- [ ] Next.js 14.2.18
- [ ] Prisma 5.22.0
- [ ] @next-auth/prisma-adapter instalado
- [ ] Sin errores de TypeScript
- [ ] ESLint sin warnings

**Verificar:**
```bash
node -v  # >= v18
pnpm -v  # >= v10
pnpm list --depth=0
pnpm run lint  # Debe decir "No ESLint warnings or errors"
```

---

## 🔐 Variables de Entorno (.env)

- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] `DATABASE_URL` configurado (puerto 5433)
- [ ] `NEXTAUTH_URL` = `http://localhost:3000`
- [ ] `NEXTAUTH_SECRET` generado (32+ caracteres)
- [ ] `GOOGLE_CLIENT_ID` configurado ⚠️
- [ ] `GOOGLE_CLIENT_SECRET` configurado ⚠️
- [ ] `REDIS_URL` = `redis://localhost:6379`

**Variables para Email Authentication (NEW!):**
- [ ] `SMTP_HOST` configurado (ej: smtp.gmail.com)
- [ ] `SMTP_PORT` configurado (ej: 587)
- [ ] `SMTP_SECURE` = "false"
- [ ] `SMTP_USER` configurado (tu email)
- [ ] `SMTP_PASSWORD` configurado (App Password de Gmail)
- [ ] `SMTP_FROM_EMAIL` configurado
- [ ] `SMTP_FROM_NAME` = "Estepona Tours"

**Variables opcionales (para más adelante):**
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `N8N_WEBHOOK_URL`

**Verificar:**
```bash
cat .env | Select-String "DATABASE_URL"
cat .env | Select-String "NEXTAUTH_SECRET"
cat .env | Select-String "GOOGLE_CLIENT_ID"
cat .env | Select-String "SMTP_HOST"
```

---

## 📧 Email Authentication Setup (Opcional)

Para habilitar login por email:

- [ ] Variables SMTP configuradas en `.env` (ver arriba)
- [ ] **Gmail**: App Password generada
  - [ ] Verificación en 2 pasos activada
  - [ ] App Password creada en https://myaccount.google.com/apppasswords
  - [ ] Contraseña de 16 caracteres guardada en `SMTP_PASSWORD`
- [ ] **SendGrid** (alternativa para producción):
  - [ ] Cuenta creada en sendgrid.com
  - [ ] API Key generada
  - [ ] Variables SMTP configuradas
- [ ] Plantilla de email personalizada (opcional)
- [ ] Rate limiting configurado (default: 3 intentos/hora)

**Verificar email:**
```bash
# Iniciar app
pnpm dev

# Navegar a http://localhost:3001
# Click en "Continuar con Email"
# Ingresar tu email
# Revisar inbox para código de verificación
```

📖 **Guías detalladas:**
- [EMAIL-AUTH-SETUP.md](EMAIL-AUTH-SETUP.md) - Configuración paso a paso
- [EMAIL-AUTH-SECURITY.md](EMAIL-AUTH-SECURITY.md) - Mejores prácticas y seguridad

---

## 🔑 Google OAuth Configuration

⚠️ **PASO CRÍTICO PARA QUE FUNCIONE EL LOGIN**

- [ ] Cuenta de Google creada
- [ ] Proyecto creado en Google Cloud Console
- [ ] Nombre del proyecto: `Estepona Tours` (o similar)
- [ ] OAuth consent screen configurado
  - [ ] Tipo: External
  - [ ] App name: `Estepona Tours`
  - [ ] User support email: configurado
  - [ ] Developer contact: configurado
  - [ ] Scopes agregados:
    - [ ] `openid`
    - [ ] `userinfo.email`
    - [ ] `userinfo.profile`
  - [ ] Test users: tu email agregado
- [ ] OAuth Client ID creado
  - [ ] Type: Web application
  - [ ] Authorized JavaScript origins:
    - [ ] `http://localhost:3000`
  - [ ] Authorized redirect URIs:
    - [ ] `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID copiado a `.env`
- [ ] Client Secret copiado a `.env`

**Verificar:**
```bash
# Debe mostrar el Client ID (no "your-google-client-id")
cat .env | Select-String "GOOGLE_CLIENT_ID"
```

📖 **Guía detallada:** Ver [OAUTH-SETUP.md](OAUTH-SETUP.md)

---

## 🚀 Servidor de Desarrollo

- [ ] Servidor iniciado: `pnpm dev`
- [ ] Aplicación accesible en `http://localhost:3000`
- [ ] Sin errores en la terminal
- [ ] Sin errores en consola del navegador (F12)
- [ ] Página de login se muestra correctamente
- [ ] Redirección a Google funciona
- [ ] Login con Google exitoso
- [ ] Usuario autenticado visible en la app
- [ ] Mapa se carga correctamente
- [ ] Marcadores de POIs visibles

**Verificar:**
```bash
# Abrir en navegador
http://localhost:3000

# Debería redirigir a /map después del login
# Tu foto de perfil debería aparecer arriba
```

---

## 🗺️ Funcionalidad del Mapa

- [ ] Mapa centrado en Estepona (36.4273, -5.1483)
- [ ] 10 POIs visibles en el mapa
- [ ] Marcadores con iconos personalizados
- [ ] Click en marcador abre modal de POI
- [ ] Modal muestra:
  - [ ] Nombre del POI
  - [ ] Descripción
  - [ ] Imágenes (si existen)
  - [ ] Categoría
  - [ ] Puntos XP a ganar
  - [ ] Botón "Escanear"
- [ ] Barra de progreso superior visible
  - [ ] Foto de perfil
  - [ ] Nombre de usuario
  - [ ] Nivel actual
  - [ ] Barra de XP
  - [ ] POIs visitados
- [ ] Botón flotante de escaneo NFC/QR

**Verificar:**
1. Click en cualquier marcador azul del mapa
2. Debería abrir un modal con información del POI
3. La barra superior debe mostrar tu foto de Google

---

## 🎨 Herramientas Auxiliares

- [ ] pgAdmin accesible en `http://localhost:5050`
  - [ ] Login: `admin@esteponatours.com` / `admin`
  - [ ] Servidor PostgreSQL conectado
  - [ ] Base de datos `estepona_tours` visible
  - [ ] Tablas creadas (User, POI, Visit, Badge, etc.)

- [ ] Prisma Studio accesible: `pnpm prisma:studio`
  - [ ] Abre en `http://localhost:5555`
  - [ ] Tabla `POI` muestra 10 registros
  - [ ] Tabla `Badge` muestra 5 registros
  - [ ] Tabla `User` muestra tu usuario (después del login)

**Verificar:**
```bash
# Abrir Prisma Studio
pnpm prisma:studio

# En pgAdmin
http://localhost:5050
```

---

## 📝 Documentación

- [ ] README.md leído
- [ ] README.Docker.md revisado
- [ ] OAUTH-SETUP.md seguido paso a paso
- [ ] SETUP.md consultado
- [ ] ARCHITECTURE.md entendido (opcional)
- [ ] COMMANDS.md como referencia
- [ ] DEPLOYMENT.md para producción (opcional)

---

## 🧪 Testing Básico

### Test 1: Autenticación
- [ ] Ir a `http://localhost:3000`
- [ ] Click en "Iniciar Sesión"
- [ ] Seleccionar cuenta de Google
- [ ] Autorizar permisos
- [ ] Redirección exitosa a `/map`
- [ ] Usuario autenticado visible

### Test 2: Visualización del Mapa
- [ ] Mapa de Estepona cargado
- [ ] 10 marcadores azules visibles
- [ ] Zoom in/out funciona
- [ ] Pan (mover el mapa) funciona

### Test 3: Interacción con POI
- [ ] Click en "Torre del Reloj" (centro de Estepona)
- [ ] Modal se abre con información
- [ ] Imagen del POI se muestra
- [ ] Botón "Cerrar" funciona
- [ ] Modal se cierra correctamente

### Test 4: Base de Datos
- [ ] Abrir Prisma Studio: `pnpm prisma:studio`
- [ ] Navegar a tabla `User`
- [ ] Tu usuario de Google debe estar registrado
- [ ] Email, nombre e imagen deben estar guardados

### Test 5: Sesión Persistente
- [ ] Login con Google
- [ ] Refrescar página (F5)
- [ ] Sesión debe mantenerse
- [ ] No debería pedir login nuevamente

---

## ⚠️ Problemas Comunes

### ❌ Error: "Cannot connect to database"
**Solución:**
```bash
docker-compose ps  # Verificar que PostgreSQL está corriendo
docker-compose restart postgres
```

### ❌ Error: "redirect_uri_mismatch" en Google OAuth
**Solución:**
1. Ve a Google Cloud Console
2. Verifica que la redirect URI sea EXACTAMENTE:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
3. Sin espacios, sin mayúsculas diferentes

### ❌ Error: "Invalid session"
**Solución:**
```bash
# Regenerar NEXTAUTH_SECRET
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "NEXTAUTH_SECRET=$secret"
# Copiar a .env y reiniciar servidor
```

### ❌ Mapa no se carga / Pantalla blanca
**Solución:**
1. Abrir DevTools (F12)
2. Ver errores en Console
3. Verificar que Leaflet CSS se cargó
4. Limpiar caché: `rm -rf .next && pnpm dev`

### ❌ ESLint errors
**Solución:**
```bash
pnpm run lint  # Ver errores específicos
# Si hay errores de tipos, ejecutar:
pnpm prisma generate
```

---

## 🎯 Siguiente Nivel

Una vez que todo funcione:

- [ ] Leer [ARCHITECTURE.md](ARCHITECTURE.md) para entender la estructura
- [ ] Implementar escaneo QR (componente ya existe)
- [ ] Configurar Cloudinary para imágenes
- [ ] Configurar Stripe para pagos
- [ ] Implementar admin dashboard
- [ ] Agregar más POIs de Estepona
- [ ] Configurar n8n para webhooks
- [ ] Deploy a Vercel (ver [DEPLOYMENT.md](DEPLOYMENT.md))

---

## ✅ Verificación Final

Si puedes responder "SÍ" a todas estas preguntas, ¡estás listo!

1. ¿Docker está corriendo con PostgreSQL y Redis? **SÍ/NO**
2. ¿El archivo .env tiene GOOGLE_CLIENT_ID configurado? **SÍ/NO**
3. ¿Puedes hacer login con tu cuenta de Google? **SÍ/NO**
4. ¿El mapa muestra 10 POIs de Estepona? **SÍ/NO**
5. ¿Tu foto de perfil aparece en la barra superior? **SÍ/NO**
6. ¿Prisma Studio muestra datos en las tablas? **SÍ/NO**
7. ¿La sesión persiste al refrescar la página? **SÍ/NO**

Si respondiste **NO** a alguna, revisa la sección correspondiente arriba.

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Revisa los logs:**
   ```bash
   # Terminal donde corre pnpm dev
   # Busca mensajes de error en rojo
   ```

2. **Verifica la consola del navegador:**
   ```
   F12 > Console
   # Busca errores en rojo
   ```

3. **Logs de Docker:**
   ```bash
   docker-compose logs postgres
   docker-compose logs redis
   ```

4. **Reinicio completo:**
   ```bash
   docker-compose down
   rm -rf .next
   docker-compose up -d
   pnpm dev
   ```

---

**¡Buena suerte con tu aplicación de turismo gamificado!** 🎮🗺️

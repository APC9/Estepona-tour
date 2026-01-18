# 🔐 Guía de Configuración OAuth - Google

Esta guía te ayudará a configurar la autenticación con Google OAuth para Estepona Tours.

---

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com)
- Aplicación corriendo en `http://localhost:3000`

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud

### 1.1 Acceder a Google Cloud Console

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Inicia sesión con tu cuenta de Google

### 1.2 Crear un Nuevo Proyecto

1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Haz clic en **"NEW PROJECT"** (Nuevo Proyecto)
3. Configura:
   - **Project name**: `Estepona Tours` (o el nombre que prefieras)
   - **Organization**: Déjalo vacío si es proyecto personal
   - **Location**: No organización (o selecciona tu organización)
4. Haz clic en **"CREATE"**
5. Espera unos segundos a que se cree el proyecto
6. Selecciona el proyecto recién creado desde el selector de proyectos

---

## 🔧 Paso 2: Configurar OAuth Consent Screen

### 2.1 Acceder a OAuth Consent Screen

1. En el menú lateral, ve a **"APIs & Services"** > **"OAuth consent screen"**
2. O busca "OAuth consent screen" en la barra de búsqueda

### 2.2 Configurar la Pantalla de Consentimiento

1. Selecciona **"External"** (para permitir cualquier cuenta de Google)
2. Haz clic en **"CREATE"**

### 2.3 Completar Información de la App

**Página 1: App information**

- **App name**: `Estepona Tours`
- **User support email**: Tu email
- **App logo** (opcional): Puedes subir un logo de 120x120px
- **Application home page**: `http://localhost:3000`
- **Application privacy policy link**: `http://localhost:3000/privacy` (puedes usar esto temporalmente)
- **Application terms of service link**: `http://localhost:3000/terms` (puedes usar esto temporalmente)
- **Authorized domains**: Déjalo vacío por ahora (solo para localhost)
- **Developer contact information**: Tu email

Haz clic en **"SAVE AND CONTINUE"**

**Página 2: Scopes**

1. Haz clic en **"ADD OR REMOVE SCOPES"**
2. Selecciona los siguientes scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. Haz clic en **"UPDATE"**
4. Haz clic en **"SAVE AND CONTINUE"**

**Página 3: Test users (solo para desarrollo)**

1. Haz clic en **"ADD USERS"**
2. Agrega tu email y cualquier otro email que necesite acceso durante desarrollo
3. Haz clic en **"ADD"**
4. Haz clic en **"SAVE AND CONTINUE"**

**Página 4: Summary**

1. Revisa la información
2. Haz clic en **"BACK TO DASHBOARD"**

---

## 🔑 Paso 3: Crear Credenciales OAuth

### 3.1 Ir a Credentials

1. En el menú lateral, ve a **"APIs & Services"** > **"Credentials"**
2. Haz clic en **"CREATE CREDENTIALS"** > **"OAuth client ID"**

### 3.2 Configurar OAuth Client ID

**Tipo de aplicación:**
- Selecciona: **"Web application"**

**Configuración:**

1. **Name**: `Estepona Tours - Web Client` (o el nombre que prefieras)

2. **Authorized JavaScript origins** (URIs de origen autorizados):
   ```
   http://localhost:3000
   ```
   
3. **Authorized redirect URIs** (URIs de redirección autorizados):
   ```
   http://localhost:3000/api/auth/callback/google
   ```

4. Haz clic en **"CREATE"**

### 3.3 Obtener Credenciales

1. Aparecerá un modal con tus credenciales:
   - **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

2. **¡IMPORTANTE!** Copia estas credenciales ahora, las necesitarás en el siguiente paso

3. También puedes descargar el JSON para respaldo (opcional)

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Editar el archivo .env

Abre el archivo `.env` en la raíz del proyecto y actualiza las siguientes líneas:

```env
# OAuth Providers
GOOGLE_CLIENT_ID="PEGA-AQUI-TU-CLIENT-ID"
GOOGLE_CLIENT_SECRET="PEGA-AQUI-TU-CLIENT-SECRET"
```

**Ejemplo:**
```env
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxx"
```

### 4.2 Verificar otras variables

Asegúrate de que estas variables también estén configuradas:

```env
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="RqkUggv0TGY6uZ64YYZf4BJhRJ0KIvMCTaKZPjwqiv0="  # Ya generado

# Database (ya configurado con Docker)
DATABASE_URL="postgresql://estepona_user:estepona_password_dev@localhost:5433/estepona_tours?schema=public"
```

---

## 🧪 Paso 5: Probar la Autenticación

### 5.1 Reiniciar el Servidor

```powershell
# Detener el servidor si está corriendo (Ctrl+C)
# Luego iniciar de nuevo:
pnpm dev
```

### 5.2 Probar Login

1. Abre tu navegador en: [http://localhost:3000](http://localhost:3000)
2. Deberías ver un mensaje para iniciar sesión
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido a la página de Google
5. Selecciona tu cuenta de Google
6. Acepta los permisos solicitados
7. Serás redirigido de vuelta a la aplicación
8. ¡Deberías ver el mapa con tu usuario autenticado! 🎉

### 5.3 Verificar Sesión

Si todo funciona correctamente:
- Verás tu foto de perfil y nombre en la barra superior
- Podrás navegar por el mapa
- El botón de escaneo NFC/QR estará disponible

---

## 🔍 Troubleshooting (Solución de Problemas)

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección no coincide con la configurada en Google Cloud.

**Solución**:
1. Ve a Google Cloud Console > Credentials
2. Edita tu OAuth Client ID
3. Verifica que en **"Authorized redirect URIs"** esté exactamente:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Guarda y espera unos segundos
5. Intenta de nuevo

### Error: "Access blocked: This app's request is invalid"

**Causa**: Los scopes no están configurados correctamente.

**Solución**:
1. Ve a OAuth consent screen
2. Edita la configuración
3. En "Scopes", asegúrate de tener:
   - `openid`
   - `userinfo.email`
   - `userinfo.profile`
4. Guarda y vuelve a probar

### Error: "This app is blocked"

**Causa**: Tu email no está en la lista de test users.

**Solución**:
1. Ve a OAuth consent screen
2. En la sección "Test users"
3. Agrega tu email
4. Guarda y vuelve a probar

### Error de conexión a base de datos

**Causa**: PostgreSQL no está corriendo o .env mal configurado.

**Solución**:
```powershell
# Verificar contenedores
docker-compose ps

# Si no están corriendo, levantarlos
docker-compose up -d

# Verificar .env
cat .env | Select-String "DATABASE_URL"
```

### La sesión no persiste / Se cierra al refrescar

**Causa**: NEXTAUTH_SECRET no está configurado o es inválido.

**Solución**:
```powershell
# Generar un nuevo secret
$secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "NEXTAUTH_SECRET=$secret"

# Copiar el valor y actualizarlo en .env
```

---

## 🌐 Paso 6: Configuración para Producción (Opcional)

Cuando quieras desplegar a producción:

### 6.1 Actualizar OAuth Consent Screen

1. Ve a OAuth consent screen
2. Haz clic en **"PUBLISH APP"**
3. Confirma la publicación

### 6.2 Agregar Dominio de Producción

1. Ve a Credentials > Tu OAuth Client ID
2. En **"Authorized JavaScript origins"** agrega:
   ```
   https://tu-dominio.com
   https://www.tu-dominio.com
   ```
3. En **"Authorized redirect URIs"** agrega:
   ```
   https://tu-dominio.com/api/auth/callback/google
   https://www.tu-dominio.com/api/auth/callback/google
   ```

### 6.3 Actualizar Variables en Vercel

Si despliegas en Vercel:

```bash
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

---

## 📱 Bonus: Agregar Apple OAuth (Opcional)

Para agregar autenticación con Apple:

### 1. Apple Developer Account

1. Ve a [https://developer.apple.com](https://developer.apple.com)
2. Crea un App ID
3. Habilita "Sign In with Apple"
4. Crea un Service ID
5. Configura Return URLs:
   ```
   http://localhost:3000/api/auth/callback/apple
   ```

### 2. Obtener Credenciales

1. Client ID: Tu Service ID
2. Team ID: Desde tu cuenta de Apple Developer
3. Private Key: Genera y descarga (.p8 file)
4. Key ID: El ID de tu private key

### 3. Configurar en .env

```env
APPLE_CLIENT_ID="com.esteponatours.service"
APPLE_TEAM_ID="ABC123XYZ"
APPLE_KEY_ID="DEF456GHI"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 4. Descomentar en lib/auth.ts

```typescript
// Descomentar estas líneas en authOptions.providers:
{
  id: 'apple',
  name: 'Apple',
  type: 'oauth',
  clientId: process.env.APPLE_CLIENT_ID!,
  clientSecret: {
    appleId: process.env.APPLE_CLIENT_ID!,
    teamId: process.env.APPLE_TEAM_ID!,
    keyId: process.env.APPLE_KEY_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY!,
  },
  authorization: {
    params: {
      scope: 'name email',
      response_mode: 'form_post',
    },
  },
  profile(profile) {
    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name?.firstName + ' ' + profile.name?.lastName,
      image: null,
    };
  },
},
```

---

## ✅ Checklist Final

Antes de continuar desarrollando, verifica:

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] OAuth Client ID creado
- [ ] Authorized JavaScript origins: `http://localhost:3000`
- [ ] Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
- [ ] GOOGLE_CLIENT_ID en .env
- [ ] GOOGLE_CLIENT_SECRET en .env
- [ ] NEXTAUTH_URL configurado
- [ ] NEXTAUTH_SECRET generado
- [ ] PostgreSQL corriendo en Docker
- [ ] Servidor Next.js corriendo (`pnpm dev`)
- [ ] Login funciona correctamente
- [ ] Sesión persiste al refrescar

---

## 🎓 Recursos Adicionales

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter for NextAuth](https://authjs.dev/reference/adapter/prisma)

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa los logs en la terminal
2. Verifica la consola del navegador (F12)
3. Comprueba que todas las URLs coincidan exactamente
4. Asegúrate de que PostgreSQL esté corriendo
5. Reinicia el servidor después de cambiar .env

---

**¡Listo! Ahora tienes autenticación OAuth funcionando.** 🚀

Puedes comenzar a explorar el mapa, escanear POIs y ganar puntos. 🎮

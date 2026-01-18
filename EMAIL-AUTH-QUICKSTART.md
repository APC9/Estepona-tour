# 🚀 Autenticación por Email - Inicio Rápido

## ✅ ¿Qué se implementó?

✔️ Autenticación por email con código de verificación de 6 dígitos  
✔️ JWT (JSON Web Tokens) para mantener sesiones  
✔️ Email con diseño HTML profesional y responsive  
✔️ Rate limiting (3 intentos por hora)  
✔️ Endpoint para reenviar código  
✔️ Componente de UI integrado en la página principal  
✔️ Validaciones de seguridad  

## 🎯 Archivos Creados/Modificados

### Nuevos Archivos:
- ✅ `lib/email.ts` - Servicio de envío de emails con nodemailer
- ✅ `components/auth/EmailAuthForm.tsx` - Componente del formulario
- ✅ `app/api/auth/resend-verification/route.ts` - API de reenvío
- ✅ `EMAIL-AUTH-SETUP.md` - Guía completa de setup
- ✅ `EMAIL-AUTH-SECURITY.md` - Mejores prácticas y seguridad

### Archivos Modificados:
- ✅ `lib/auth.ts` - Agregado EmailProvider a NextAuth
- ✅ `app/page.tsx` - Integrado formulario de email
- ✅ `.env` - Agregadas variables SMTP
- ✅ `.env.example` - Documentadas variables nuevas
- ✅ `README.md` - Actualizado con nuevas características
- ✅ `CHECKLIST.md` - Agregada sección de email auth
- ✅ `package.json` - Instalados nodemailer y @types/nodemailer

## ⚙️ Configuración Mínima (5 minutos)

### 1. Instalar Dependencias
```bash
# Ya instaladas:
pnpm install
```

### 2. Configurar Gmail (Desarrollo)

1. Ve a https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos"
3. Ve a https://myaccount.google.com/apppasswords
4. Genera una contraseña de aplicación para "Mail"
5. Copia la contraseña de 16 caracteres

### 3. Actualizar .env

Agrega estas líneas a tu archivo `.env`:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # App Password de 16 chars
SMTP_FROM_EMAIL="noreply@estepona-tours.com"
SMTP_FROM_NAME="Estepona Tours"
```

### 4. Iniciar Aplicación

```bash
pnpm dev
```

### 5. Probar

1. Abre http://localhost:3001
2. Selecciona un plan
3. Click en **"Continuar con Email"**
4. Ingresa tu email
5. Revisa tu inbox
6. Copia el código de 6 dígitos O haz click en el botón del email

¡Listo! 🎉

## 🧪 Características del Sistema

### Email con Código de 6 Dígitos
- Código único generado para cada login
- Expira en 24 horas
- También incluye botón para verificación con un click

### Rate Limiting
- Máximo 3 códigos por hora por email
- Protege contra spam y ataques
- Configurable en `app/api/auth/resend-verification/route.ts`

### JWT Automático
NextAuth maneja JWT automáticamente:
- Tokens firmados con HMAC
- Expiración de 30 días
- No requiere estado en servidor
- Información del usuario encriptada

## 🎨 UI Integrada

El formulario está integrado en la página principal:
- Toggle entre Google OAuth y Email
- Diseño responsive y atractivo
- Feedback visual claro
- Manejo de errores amigable

## 📧 Plantilla de Email

Email profesional incluye:
- 🎨 Diseño gradiente morado/azul
- 📱 Responsive (móvil y desktop)
- 🔢 Código destacado visualmente
- 🔗 Botón de verificación directa
- ⏰ Información de expiración
- 🔒 Advertencias de seguridad
- ✉️ Versión texto plano (fallback)

## 🔄 Flujo de Usuario

```
1. Usuario ingresa email
   ↓
2. Sistema genera token único
   ↓
3. Se envía email con código de 6 dígitos
   ↓
4. Usuario recibe email
   ↓
5. Usuario puede:
   a) Hacer click en botón (verificación automática) → ✅ Login
   b) Copiar código de 6 dígitos → ✅ Login
   ↓
6. NextAuth valida token
   ↓
7. Crea sesión con JWT
   ↓
8. Redirige al mapa
```

## 🛠️ Personalización Rápida

### Cambiar Duración del Token
`lib/auth.ts`:
```typescript
EmailProvider({
  maxAge: 24 * 60 * 60, // 24 horas → cambia aquí
})
```

### Cambiar Rate Limit
`app/api/auth/resend-verification/route.ts`:
```typescript
if (recentTokens >= 3) { // 3 intentos → cambia aquí
```

### Personalizar Email
Edita `lib/email.ts`:
```typescript
function getVerificationEmailTemplate(code: string, url: string): string {
  // Modifica el HTML aquí
}
```

## 🚀 Para Producción

### 1. Cambiar a SendGrid (Recomendado)

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.tu-api-key"
```

### 2. Configurar Dominio Propio
- SPF record
- DKIM record
- DMARC policy

### 3. Generar Secret Seguro
```bash
openssl rand -base64 32
```

### 4. Activar HTTPS
Actualizar `.env`:
```bash
NEXTAUTH_URL="https://tu-dominio.com"
```

## 🐛 Troubleshooting Rápido

### Email no llega
- ✅ Verifica spam/correo no deseado
- ✅ Confirma variables SMTP en `.env`
- ✅ Revisa logs de consola
- ✅ Verifica App Password de Gmail

### "Invalid login credentials"
- ✅ Regenera App Password en Gmail
- ✅ Verifica que 2FA esté activo

### "Too many requests"
- ✅ Espera 1 hora (rate limit)
- ✅ O ajusta límite en código

## 📚 Documentación Completa

- 📖 **[EMAIL-AUTH-SETUP.md](EMAIL-AUTH-SETUP.md)** - Setup detallado y configuración
- 🔒 **[EMAIL-AUTH-SECURITY.md](EMAIL-AUTH-SECURITY.md)** - Seguridad y mejores prácticas
- ✅ **[CHECKLIST.md](CHECKLIST.md)** - Checklist de verificación

## 💡 Tips

1. **Desarrollo**: Usa Gmail con App Password
2. **Producción**: Migra a SendGrid o AWS SES
3. **Testing**: Usa [Ethereal Email](https://ethereal.email/) para pruebas sin enviar emails reales
4. **Monitoring**: Revisa logs para errores de SMTP
5. **Seguridad**: Nunca commits el `.env` con credenciales reales

## ✨ Ventajas

✅ Sin dependencia de OAuth providers externos  
✅ Control total de la experiencia  
✅ Privacidad (no se comparten datos con Google)  
✅ Funciona sin JavaScript (fallback)  
✅ JWT = sin estado en servidor = escalable  
✅ Rate limiting integrado  
✅ Diseño profesional listo para producción  

## 🎉 ¡Todo Listo!

Tu aplicación ahora soporta:
- 🔑 Login con Google (OAuth)
- 📧 Login con Email (código de verificación)
- 🔒 JWT para sesiones seguras

¡Empieza a probar! 🚀

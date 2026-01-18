# 🔐 Guía de Seguridad JWT y Email Auth

## 🎯 Configuración de JWT en NextAuth

NextAuth ya está configurado con JWT como estrategia de sesión:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 días
}
```

### ¿Qué incluye el JWT?

El token JWT contiene:
- `sub`: ID del usuario
- `email`: Email del usuario
- `iat`: Timestamp de creación
- `exp`: Timestamp de expiración
- Otros datos de sesión cifrados

### Seguridad del JWT

1. **Secret seguro**: El `NEXTAUTH_SECRET` debe ser aleatorio y seguro
2. **HTTPS obligatorio**: En producción, siempre usa HTTPS
3. **Expiración**: Los tokens expiran automáticamente en 30 días
4. **Firma HMAC**: NextAuth usa HS256 para firmar tokens
5. **No almacenar datos sensibles**: JWT no debe contener contraseñas o información crítica

## 🔒 Mejores Prácticas de Seguridad

### 1. Variables de Entorno

```bash
# NUNCA commitees este archivo con valores reales
# Usa diferentes secrets para dev/staging/prod

# Desarrollo
NEXTAUTH_SECRET="dev-secret-at-least-32-chars-long"

# Producción (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET="XYZ123...random-string-very-secure"
```

### 2. SMTP en Producción

**❌ NO uses Gmail para producción**
Gmail tiene límites de envío (500 emails/día) y puede bloquear tu cuenta.

**✅ Usa servicios dedicados:**

#### SendGrid (Recomendado)
- ✅ 100 emails/día gratis
- ✅ Alta deliverability
- ✅ Analytics y reportes
- ✅ API y SMTP

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxx"
```

#### Amazon SES
- ✅ 62,000 emails/mes gratis (si usas EC2)
- ✅ Muy económico ($0.10 por 1,000 emails)
- ✅ Alta reputación

```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="AWS_SES_USER"
SMTP_PASSWORD="AWS_SES_PASSWORD"
```

#### Mailgun
- ✅ 5,000 emails/mes gratis primeros 3 meses
- ✅ Fácil de configurar
- ✅ Buen soporte

```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@tu-dominio.mailgun.org"
SMTP_PASSWORD="mailgun-password"
```

### 3. Rate Limiting

Ya implementado:
- ✅ Máximo 3 códigos por hora por email
- ✅ Protección contra spam
- ✅ Prevención de enumeración de usuarios

Puedes ajustar en [resend-verification/route.ts](app/api/auth/resend-verification/route.ts):

```typescript
const recentTokens = await prisma.verificationToken.count({
  where: {
    identifier: user.email,
    expires: {
      gte: oneHourAgo, // Cambia aquí el tiempo
    },
  },
});

if (recentTokens >= 3) { // Cambia aquí el límite
  return NextResponse.json(/* ... */);
}
```

### 4. Validación de Email

```typescript
// Emails siempre en minúsculas
const email = userEmail.toLowerCase();

// Validación básica (NextAuth hace más validaciones)
if (!email || !email.includes('@')) {
  throw new Error('Email inválido');
}
```

### 5. Headers de Seguridad

Agrega a `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 🚀 Checklist de Producción

Antes de lanzar a producción:

- [ ] Cambiar `NEXTAUTH_SECRET` a un valor aleatorio fuerte
- [ ] Usar servicio SMTP profesional (no Gmail)
- [ ] Configurar dominio propio para emails (SPF, DKIM, DMARC)
- [ ] Activar HTTPS obligatorio
- [ ] Configurar `NEXTAUTH_URL` a tu dominio real
- [ ] Revisar límites de rate limiting
- [ ] Probar flujo completo en staging
- [ ] Configurar logging y monitoreo de emails
- [ ] Preparar plantilla de email en otros idiomas
- [ ] Configurar bounce handling (emails rebotados)
- [ ] Revisar políticas de privacidad y GDPR

## 📊 Monitoreo

### Logs importantes

```bash
✅ Servidor SMTP listo para enviar emails
✅ Email de verificación enviado a: user@example.com
✅ Email de verificación enviado: <message-id>

❌ Error en configuración SMTP: [error]
❌ Error al enviar email de verificación: [error]
```

### Métricas a monitorear

- Tasa de entrega de emails
- Tasa de apertura
- Tiempo promedio de verificación
- Intentos fallidos de envío
- Rate limit alcanzado

## 🔧 Troubleshooting

### "Email no llega"

1. Verifica spam/correo no deseado
2. Revisa configuración SMTP
3. Verifica logs del servidor
4. Confirma que SMTP_USER y SMTP_PASSWORD sean correctos
5. Revisa límites del proveedor SMTP

### "Invalid login credentials" (Gmail)

- Genera nueva App Password
- Verifica que 2FA esté activo
- Usa la contraseña de app, no tu contraseña normal

### "Too many requests"

- Rate limit alcanzado (3 intentos/hora)
- Espera 1 hora o ajusta límites

### "Token expired"

- El token dura 24 horas
- Usuario debe solicitar nuevo código

## 🌍 Internacionalización

Para soportar múltiples idiomas en emails:

```typescript
// lib/email.ts
export async function sendVerificationEmail({
  email,
  token,
  url,
  language = 'es', // Agregar parámetro
}: SendVerificationEmailParams & { language?: string }) {
  const templates = {
    es: getVerificationEmailTemplateES(code, url),
    en: getVerificationEmailTemplateEN(code, url),
    fr: getVerificationEmailTemplateFR(code, url),
    // ...
  };

  const html = templates[language] || templates.es;
  // ...
}
```

## 📚 Referencias

- [NextAuth JWT Session](https://next-auth.js.org/configuration/options#session)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Email Security Best Practices](https://www.cloudflare.com/learning/email-security/dmarc-dkim-spf/)

## 🎉 Conclusión

La autenticación por email con JWT proporciona:

✅ **Seguridad**: Tokens firmados, expiración automática  
✅ **Escalabilidad**: JWT no requiere estado en servidor  
✅ **Flexibilidad**: Funciona sin OAuth providers  
✅ **Control**: Experiencia de usuario personalizada  
✅ **Privacidad**: No se comparten datos con terceros  

¡Tu aplicación está lista para autenticar usuarios de forma segura! 🚀

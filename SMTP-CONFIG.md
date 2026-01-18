# =======================================================
# 📧 GUÍA DE CONFIGURACIÓN SMTP 
# =======================================================

## Para Gmail:

1. **Habilita autenticación de 2 factores** en tu cuenta de Gmail
2. **Genera una App Password**:
   - Ve a tu cuenta de Google: https://myaccount.google.com/
   - Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Mail"
   
3. **Configura las variables en .env**:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # App Password generada (sin espacios)
SMTP_FROM_EMAIL="noreply@tu-dominio.com"
SMTP_FROM_NAME="Tu App Name"
```

## Para SendGrid (Recomendado para producción):

1. **Crea una cuenta en SendGrid**: https://sendgrid.com/
2. **Genera un API Key**
3. **Configura**:
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.tu-sendgrid-api-key"
SMTP_FROM_EMAIL="noreply@tu-dominio.com"
```

## Para deshabilitar email temporalmente:

Comenta la sección EmailProvider en `/lib/auth.ts` (ya hecho en el código)

## Notas importantes:

- **Nunca subas** tu .env con credenciales reales al repositorio
- **Usa App Passwords** para Gmail, no tu contraseña personal
- **Para producción** usa servicios como SendGrid, AWS SES, o Resend
- **El puerto 587** es el estándar para SMTP con STARTTLS

## Verificación:

Para probar que funciona, puedes hacer login con email desde la app.
Si hay errores, aparecerán en la consola del servidor.
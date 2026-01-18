# 🚀 DEPLOYMENT GUIDE - Estepona Tours

## 📋 Pre-deployment Checklist

- [ ] Todas las variables de entorno están configuradas en Vercel
- [ ] Base de datos de producción está lista (Supabase)
- [ ] OAuth credentials de producción configuradas
- [ ] Stripe keys de producción configuradas
- [ ] Cloudinary configurado
- [ ] Redis (Upstash) configurado
- [ ] Tests pasando
- [ ] Build exitoso localmente
- [ ] Sin errores de TypeScript
- [ ] Sin warnings críticos de ESLint

---

## 🌐 Deployment a Vercel (Recomendado)

### Opción 1: Deploy con GitHub Integration

**Paso 1: Conectar Repositorio**
1. Push tu código a GitHub
2. Ir a [vercel.com](https://vercel.com)
3. Click "New Project"
4. Seleccionar repositorio de GitHub
5. Vercel detectará automáticamente Next.js

**Paso 2: Configurar Proyecto**
- **Framework Preset**: Next.js (auto-detectado)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Paso 3: Variables de Entorno**

En Vercel Dashboard > Settings > Environment Variables, agregar:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-secret-produccion

# OAuth
GOOGLE_CLIENT_ID=tu-google-client-id-prod
GOOGLE_CLIENT_SECRET=tu-google-secret-prod

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Stripe (PRODUCCIÓN)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_URL=https://...upstash.io
REDIS_TOKEN=tu-token

# App Config
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_MAP_CENTER_LAT=36.4273
NEXT_PUBLIC_MAP_CENTER_LNG=-5.1483
NEXT_PUBLIC_PROXIMITY_THRESHOLD_METERS=50

# n8n (opcional)
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook
```

**Paso 4: Deploy**
- Click "Deploy"
- Vercel hará build y deploy automáticamente
- Dominio: `tu-proyecto.vercel.app`

---

### Opción 2: Deploy Manual con CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🗄️ Configurar Base de Datos en Supabase

### Paso 1: Crear Proyecto

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Elegir región (Europa para mejor latencia desde España)
4. Anotar password de la base de datos

### Paso 2: Obtener Connection String

1. Settings > Database
2. Copiar "Connection string" (URI mode)
3. Reemplazar `[YOUR-PASSWORD]` con tu password
4. Pegar en Vercel como `DATABASE_URL`

### Paso 3: Aplicar Schema

```bash
# Localmente, con DATABASE_URL de producción
DATABASE_URL="postgresql://..." npx prisma db push

# O generar y aplicar migration
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### Paso 4: Seed Data (Opcional)

```bash
# Poblar con datos de ejemplo
DATABASE_URL="postgresql://..." npm run seed
```

---

## 🔐 Configurar OAuth para Producción

### Google OAuth

1. **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. Ir a "Credentials"
3. Editar OAuth 2.0 Client ID
4. **Authorized redirect URIs**:
   - Agregar: `https://tu-dominio.vercel.app/api/auth/callback/google`
5. Guardar
6. Usar Client ID y Secret en Vercel env vars

### Apple OAuth (Opcional)

1. [Apple Developer](https://developer.apple.com)
2. Certificates, IDs & Profiles > Keys
3. Crear nuevo key con "Sign in with Apple"
4. Configurar service ID
5. Agregar redirect URI: `https://tu-dominio.vercel.app/api/auth/callback/apple`

---

## 💳 Configurar Stripe en Producción

### Paso 1: Activar Account

1. Ir a [stripe.com](https://stripe.com)
2. Completar verificación de cuenta
3. Activar pagos en vivo

### Paso 2: Obtener Live Keys

1. Dashboard > Developers > API Keys
2. Toggle a "Live mode"
3. Copiar:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### Paso 3: Configurar Webhooks

1. Dashboard > Developers > Webhooks
2. Add endpoint: `https://tu-dominio.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copiar Signing secret → `STRIPE_WEBHOOK_SECRET`

### Paso 4: Crear Products & Prices

```bash
# Usando Stripe CLI o Dashboard
stripe products create --name "Premium Tier" --description "Acceso ilimitado"
stripe prices create --product prod_XXX --currency eur --unit-amount 999
```

Anotar Price ID para `TIER_CONFIG` en código.

---

## 📸 Configurar Cloudinary

### Paso 1: Crear Cuenta

1. [cloudinary.com](https://cloudinary.com)
2. Crear cuenta gratuita (25 GB, 25k transformations/mes)

### Paso 2: Obtener Credenciales

1. Dashboard > Settings
2. Copiar:
   - Cloud Name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### Paso 3: Crear Upload Preset

1. Settings > Upload
2. Add upload preset
3. Signing Mode: Unsigned (para client-side uploads)
4. Folder: `estepona-tours`
5. Anotar preset name

---

## 🚀 Dominio Personalizado

### Agregar Dominio Custom

1. Vercel Dashboard > Settings > Domains
2. Add domain: `esteponatours.com`
3. Configurar DNS records (Vercel te da instrucciones)

**DNS Configuration:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Esperar propagación DNS (5-60 min)
5. Vercel emitirá certificado SSL automáticamente

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Dashboard > Analytics (activar)
2. Métricas incluidas:
   - Page views
   - Unique visitors
   - Performance (Core Web Vitals)

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs

# Configurar en sentry.io
npx @sentry/wizard@latest -i nextjs
```

### Logs

```bash
# Ver logs en tiempo real
vercel logs tu-proyecto --follow

# Ver logs de deployment específico
vercel logs <deployment-url>
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Opcional)

Crear `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 🧪 Testing en Producción

### Health Check

Crear endpoint `/api/health`:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

Test: `curl https://tu-dominio.vercel.app/api/health`

### Smoke Tests

```bash
# Test autenticación
curl https://tu-dominio.vercel.app/api/auth/session

# Test POIs
curl https://tu-dominio.vercel.app/api/pois

# Test que OAuth funciona
# Abrir en navegador: https://tu-dominio.vercel.app/api/auth/signin
```

---

## 🔐 Seguridad Post-Deployment

### Checklist de Seguridad

- [ ] HTTPS habilitado (automático en Vercel)
- [ ] CORS configurado correctamente
- [ ] Rate limiting en API routes
- [ ] Secrets no expuestos en client-side
- [ ] CSP (Content Security Policy) configurado
- [ ] OAuth redirects restringidos a dominios válidos
- [ ] Database firewall configurado (Supabase)
- [ ] API keys rotadas desde desarrollo

### Headers de Seguridad

Agregar a `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📱 PWA en Producción

### Verificar PWA

1. Abrir Chrome DevTools
2. Lighthouse > Progressive Web App
3. Verificar puntaje 90+

### Probar Instalación

1. Chrome en móvil
2. Abrir app
3. "Add to Home Screen"
4. Verificar que funciona offline

---

## 🚨 Rollback Plan

Si algo sale mal:

### Rollback en Vercel

```bash
# Listar deployments
vercel ls

# Promover deployment anterior
vercel promote <previous-deployment-url>
```

O en Dashboard:
1. Deployments
2. Click en deployment anterior
3. "Promote to Production"

---

## 📈 Post-Launch

### Día 1-7
- [ ] Monitor error rate (< 1%)
- [ ] Check performance (Core Web Vitals)
- [ ] Verificar que webhooks funcionan
- [ ] Test flujo de pago end-to-end
- [ ] Monitorear uso de API limits

### Semana 1-4
- [ ] Analizar user behavior
- [ ] Optimizar queries lentas
- [ ] Ajustar caché strategies
- [ ] Recolectar feedback de usuarios

### Mes 1+
- [ ] Scale según demanda
- [ ] Implementar features de Fase 2
- [ ] A/B testing
- [ ] Performance tuning

---

## 🆘 Troubleshooting Común

### Error: "Database connection failed"
- Verificar DATABASE_URL
- Check Supabase connection limits
- Verificar IP allowlist

### OAuth no funciona
- Verificar redirect URIs
- Check que dominios coinciden
- Verificar NEXTAUTH_URL

### Build fails
- Ver logs de Vercel
- Verificar TypeScript errors
- Check dependencies versions

---

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Stripe**: [support.stripe.com](https://support.stripe.com)

---

**¡Tu app está lista para producción!** 🎉

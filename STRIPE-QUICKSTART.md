# 🚀 Quick Start - Stripe Integration

## ✅ Implementación Completada

### Archivos Creados:

**API Routes:**
- ✅ `/api/stripe/create-checkout` - Crear sesión de pago
- ✅ `/api/stripe/create-portal` - Portal de gestión de suscripciones
- ✅ `/api/webhooks/stripe` - Webhook handler con HMAC verification

**Configuración:**
- ✅ `lib/stripe/config.ts` - Configuración de Stripe y planes
- ✅ `lib/security/stripe.ts` - Verificación de pagos

**UI:**
- ✅ `app/(main)/upgrade/page.tsx` - Página de planes mejorada con Stripe
- ✅ `components/subscription/SubscriptionBanner.tsx` - Banner de suscripción

**Testing:**
- ✅ `scripts/test-stripe.js` - Script de testing
- ✅ `STRIPE-SETUP.md` - Guía completa de configuración

---

## 🎯 Testing Rápido (5 minutos)

### 1. Configurar Stripe (Test Mode)

```bash
# Ir a https://dashboard.stripe.com/test/apikeys
# Copiar claves y agregar a .env:

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxx"
```

### 2. Crear Productos en Stripe

```bash
# Ir a https://dashboard.stripe.com/test/products
# Crear dos productos:

1. Premium Monthly - €4.99/mes
2. Family Monthly - €9.99/mes

# Copiar Price IDs y agregar a .env:
STRIPE_PREMIUM_PRICE_ID="price_xxxxx"
STRIPE_BUSINESS_PRICE_ID="price_xxxxx"
```

### 3. Configurar Webhook

```bash
# Opción A: Stripe CLI (recomendado para testing local)
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copiar el webhook secret (whsec_xxx) a .env:
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# Opción B: Usar tu túnel actual
# URL: https://tu-tunnel.tunnelmole.net/api/webhooks/stripe
```

### 4. Probar la Integración

```bash
# 1. Verificar configuración
pnpm stripe:test

# 2. Iniciar servidor
pnpm dev

# 3. Ir a http://localhost:3001/upgrade
# 4. Seleccionar plan Premium
# 5. Usar tarjeta de prueba: 4242 4242 4242 4242
# 6. ✅ Verificar que se activa la suscripción
```

---

## 🔍 Verificar que Funciona

### En la App:
1. Ir a `/upgrade`
2. Ver "PLAN ACTUAL" si tienes suscripción
3. Click "Gestionar suscripción" abre Stripe Portal

### En Prisma Studio:
```bash
pnpm prisma:studio
```
- Ver `User` → Tu usuario tiene `tier: PREMIUM`
- Ver `User` → Campo `stripeCustomerId` poblado
- Ver `SecurityLog` → Evento `SUBSCRIPTION_ACTIVATED`

### En Stripe Dashboard:
- https://dashboard.stripe.com/test/payments
- https://dashboard.stripe.com/test/customers
- https://dashboard.stripe.com/test/subscriptions

---

## 💳 Tarjetas de Prueba

```
✅ Pago exitoso:
   4242 4242 4242 4242

❌ Pago fallido:
   4000 0000 0000 0002

🔐 3D Secure (requiere autenticación):
   4000 0027 6000 3184
```

---

## 🎯 Flujo Completo

```
Usuario → Selecciona Plan → Stripe Checkout 
  → Paga → Webhook recibido → BD actualizada 
  → Usuario redirigido con éxito
```

---

## 🐛 Troubleshooting

### Webhook no llega:
```bash
# Ver logs de Stripe CLI
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# O ver en Dashboard → Webhooks → Event logs
```

### Error "No such price":
- Verificar `STRIPE_PREMIUM_PRICE_ID` en `.env`
- Verificar que estás en Test Mode en Stripe

### Pago no actualiza BD:
- Ver logs del webhook en terminal del servidor
- Verificar que metadata incluye `userId` y `tier`
- Ver tabla `SecurityLog` para errores

---

## 📚 Documentación Completa

Ver [STRIPE-SETUP.md](STRIPE-SETUP.md) para guía paso a paso completa.

---

## ✅ Checklist de Producción

Antes de deployment:

- [ ] Cambiar a Live Mode en Stripe
- [ ] Obtener claves LIVE (pk_live_, sk_live_)
- [ ] Configurar webhook en URL de producción
- [ ] Obtener webhook secret de producción
- [ ] Activar Radar (detección de fraude)
- [ ] Configurar Customer Portal
- [ ] Probar flujo completo en producción
- [ ] Configurar emails de recibo (opcional)

---

## 🎉 ¡Todo listo!

Tu integración de Stripe está completa y funcional. Los usuarios pueden:

✅ Ver planes y precios
✅ Pagar con Stripe Checkout (seguro, PCI compliant)
✅ Gestionar su suscripción (cambiar método de pago, cancelar)
✅ Sistema 100% automatizado con webhooks
✅ Verificación de pagos server-side
✅ Audit logging de todos los eventos

**Pruébalo ahora:** http://localhost:3001/upgrade

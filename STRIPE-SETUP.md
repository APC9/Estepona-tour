# 💳 Guía de Configuración de Stripe

## 🚀 Setup Inicial de Stripe

### 1. Crear Cuenta de Stripe

1. Ir a https://stripe.com
2. Click en "Sign up"
3. Completar registro
4. Activar modo TEST (switch arriba a la derecha)

---

## 🔑 Obtener Claves API

### Paso 1: Claves Públicas y Secretas

1. Ir a: https://dashboard.stripe.com/test/apikeys
2. Copiar las claves:
   - **Publishable key**: `pk_test_xxxxx...`
   - **Secret key**: `sk_test_xxxxx...` (click en "Reveal")

3. Agregar a `.env`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51xxxxxxxxxxxxx"
STRIPE_SECRET_KEY="sk_test_51xxxxxxxxxxxxx"
```

---

## 💰 Crear Productos y Precios

### Paso 2: Crear Producto Premium

1. Ir a: https://dashboard.stripe.com/test/products
2. Click en "+ Add product"
3. Configurar:
   - **Name**: `Premium Monthly`
   - **Description**: `Plan Premium con acceso a POIs exclusivos`
   - **Pricing model**: `Standard pricing`
   - **Price**: `4.99 EUR`
   - **Billing period**: `Monthly`
   - **Payment type**: `Recurring`

4. Click en "Save product"
5. **Copiar el Price ID** (ej: `price_1abc123xyz`)
6. Agregar a `.env`:
```bash
STRIPE_PREMIUM_PRICE_ID="price_1abc123xyz"
```

### Paso 3: Crear Producto Family

1. Click en "+ Add product"
2. Configurar:
   - **Name**: `Family Monthly`
   - **Description**: `Plan Familiar para hasta 5 miembros`
   - **Pricing model**: `Standard pricing`
   - **Price**: `9.99 EUR`
   - **Billing period**: `Monthly`
   - **Payment type**: `Recurring`

3. Click en "Save product"
4. **Copiar el Price ID** (ej: `price_1def456uvw`)
5. Agregar a `.env`:
```bash
STRIPE_BUSINESS_PRICE_ID="price_1def456uvw"
```

---

## 🔔 Configurar Webhooks

### Paso 4: Crear Webhook Endpoint

1. Ir a: https://dashboard.stripe.com/test/webhooks
2. Click en "+ Add endpoint"
3. Configurar:
   - **Endpoint URL**: 
     - Local: `https://your-tunnel.tunnelmole.net/api/webhooks/stripe`
     - Producción: `https://tu-dominio.com/api/webhooks/stripe`
   
4. **Seleccionar eventos** (marcar estos):
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click en "Add endpoint"
6. **Copiar el Signing secret** (ej: `whsec_xxxxx`)
7. Agregar a `.env`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

---

## 🌐 Testing Local con Tunneling

### Opción A: Usar Stripe CLI (Recomendado)

```bash
# Instalar Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: ver https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Copiar el webhook secret que aparece (whsec_xxx)
```

### Opción B: Usar Tunneling Service

Ya tienes configurado tunnelmole, así que:

1. Asegúrate de tener el túnel activo
2. Usa la URL del túnel en el webhook endpoint
3. Ejemplo: `https://oqdpb6-ip-87-220-218-170.tunnelmole.net/api/webhooks/stripe`

---

## 🧪 Testing del Flujo de Pago

### Test Cards de Stripe

```
Tarjeta exitosa:
  Número: 4242 4242 4242 4242
  MM/YY: Cualquier fecha futura
  CVC: Cualquier 3 dígitos
  ZIP: Cualquier código

Tarjeta que falla:
  Número: 4000 0000 0000 0002

3D Secure:
  Número: 4000 0027 6000 3184
```

### Flujo de Testing

1. Ir a http://localhost:3001/upgrade
2. Seleccionar plan Premium o Family
3. Click en "Seleccionar Plan"
4. Completar checkout con tarjeta de prueba
5. Verificar redirección a success
6. Verificar en Prisma Studio:
   - User.tier actualizado
   - User.stripeCustomerId agregado
   - SecurityLog con evento SUBSCRIPTION_ACTIVATED

---

## 🎛️ Portal de Cliente (Customer Portal)

### Paso 5: Configurar Customer Portal

1. Ir a: https://dashboard.stripe.com/test/settings/billing/portal
2. Click en "Activate test link"
3. Configurar opciones:
   - ✅ Allow customers to update payment method
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans (opcional)

4. Guardar configuración

Ahora los usuarios podrán:
- Ver su suscripción actual
- Cambiar método de pago
- Cancelar suscripción
- Descargar facturas

---

## 📊 Dashboard y Monitoreo

### Ver Pagos en Stripe Dashboard

1. **Payments**: https://dashboard.stripe.com/test/payments
   - Ver todos los pagos procesados

2. **Customers**: https://dashboard.stripe.com/test/customers
   - Ver clientes y sus suscripciones

3. **Subscriptions**: https://dashboard.stripe.com/test/subscriptions
   - Ver todas las suscripciones activas

4. **Logs**: https://dashboard.stripe.com/test/logs
   - Ver requests de API y webhooks

---

## 🔒 Seguridad en Producción

### Antes de ir a producción:

1. **Cambiar a Live Mode**:
   - Switch a "Live mode" en Stripe Dashboard
   - Obtener nuevas claves LIVE: `pk_live_` y `sk_live_`

2. **Activar Radar para Fraude**:
   - Ir a: https://dashboard.stripe.com/radar/rules
   - Configurar reglas antifraude

3. **Configurar Facturación**:
   - Agregar información fiscal de tu negocio
   - Configurar emails de recibo

4. **Habilitar 3D Secure**:
   - Ya habilitado por defecto para cumplir SCA (UE)

---

## 🐛 Troubleshooting

### Error: "No such price"
- Verificar que STRIPE_PREMIUM_PRICE_ID y STRIPE_BUSINESS_PRICE_ID sean correctos
- Verificar que estés en el modo correcto (test/live)

### Error: "Invalid signature"
- Verificar STRIPE_WEBHOOK_SECRET
- Asegurarse de que el webhook esté en la misma URL que la configurada

### Webhook no llega
- Verificar que el túnel esté activo
- Probar con Stripe CLI: `stripe trigger checkout.session.completed`
- Ver logs en Stripe Dashboard → Webhooks → Eventos

### Pago no se refleja en la app
- Verificar tabla SecurityLog en Prisma Studio
- Verificar que el webhook tenga el userId en metadata
- Ver logs del servidor Next.js

---

## 📝 Checklist Final

Antes de deployment:

- [ ] Claves API configuradas en `.env`
- [ ] Productos creados en Stripe
- [ ] Price IDs configurados
- [ ] Webhook endpoint creado y activo
- [ ] Webhook secret configurado
- [ ] Customer Portal activado
- [ ] Test de pago exitoso realizado
- [ ] Verificado en Prisma Studio que se actualizan datos
- [ ] Probado cancelación de suscripción
- [ ] Probado Customer Portal

---

## 💰 Costos de Stripe

### Comisiones:
- **Europa**: 1.5% + €0.25 por transacción exitosa
- **Tarjetas internacionales**: 2.5% + €0.25
- **Sin costos fijos mensuales** (plan gratuito)

### Ejemplo:
- Venta de €4.99 (Premium):
  - Comisión: €0.32
  - Recibes: €4.67

---

## 📞 Soporte

- **Documentación**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Webhooks Guide**: https://stripe.com/docs/webhooks
- **Testing**: https://stripe.com/docs/testing

---

## 🎉 ¡Listo!

Tu integración de Stripe está completa. Los usuarios ahora pueden:

✅ Ver planes disponibles en `/upgrade`
✅ Pagar con Stripe Checkout
✅ Gestionar su suscripción
✅ Cancelar en cualquier momento
✅ Ver facturas en Customer Portal

**Próximo paso**: Implementar emails de confirmación con Resend o SendGrid.

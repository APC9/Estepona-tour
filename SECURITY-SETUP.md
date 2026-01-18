# 🔒 Configuración de Seguridad - Guía de Setup

## 🚀 Pasos de Configuración

### 1. Upstash Redis (Rate Limiting) - REQUERIDO

#### Opción A: Crear cuenta nueva (GRATIS)
1. Ir a https://upstash.com/
2. Crear cuenta (GitHub OAuth recomendado)
3. Click "Create Database" → Redis
4. Configuración:
   - Name: `estepona-tours-ratelimit`
   - Region: Europe (elige la más cercana)
   - Type: Regional (gratis)
5. Copiar credenciales:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis-xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ==
   ```
6. Pegar en `.env`

#### Plan Gratuito Incluye:
- ✅ 10,000 comandos/día
- ✅ 256 MB almacenamiento
- ✅ Suficiente para MVP y testing

---

### 2. Stripe (Verificación de Pagos) - REQUERIDO para PREMIUM

#### Configurar Price IDs:
1. Ir a https://dashboard.stripe.com/test/products
2. Crear producto "Premium Membership":
   - Name: Premium Monthly
   - Price: €4.99/mes
   - Recurring: Monthly
   - Copiar Price ID (ej: `price_1234abcd`)
3. Crear producto "Business Membership":
   - Name: Business Monthly
   - Price: €9.99/mes
   - Recurring: Monthly
   - Copiar Price ID

#### Actualizar `.env`:
```bash
STRIPE_PREMIUM_PRICE_ID="price_xxxxxxxxxxxxx"
STRIPE_BUSINESS_PRICE_ID="price_yyyyyyyyyyyyy"
```

---

### 3. Configurar Admin Inicial

#### Actualizar `.env`:
```bash
ADMIN_EMAILS="tu-email@gmail.com"
```

#### Promover usuario a admin (en Prisma Studio):
```bash
pnpm prisma studio
```
1. Abrir tabla `User`
2. Buscar tu usuario
3. Editar:
   - `isAdmin` = true
   - `role` = ADMIN

---

### 4. Testing Local de Seguridad

#### Test GPS Validation (requiere coordenadas reales):
```bash
# Obtener coordenadas de un POI real
pnpm prisma studio
# → Ver tabla POI, copiar latitude/longitude

# Test con coordenadas correctas (debe FUNCIONAR)
curl -X POST http://localhost:3001/api/scan/TU_NFC_UID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{"latitude": 36.427, "longitude": -5.148}'

# Test con coordenadas incorrectas (debe FALLAR)
curl -X POST http://localhost:3001/api/scan/TU_NFC_UID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{"latitude": 0, "longitude": 0}'
```

#### Test Rate Limiting:
```bash
# Escanear mismo POI 2 veces en 24h (debe fallar 2da vez)
# Primera vez: OK
curl -X POST http://localhost:3001/api/scan/TU_NFC_UID ...

# Segunda vez: 429 Too Many Requests
curl -X POST http://localhost:3001/api/scan/TU_NFC_UID ...
```

---

### 5. Verificar Logs de Seguridad

#### En Prisma Studio:
```bash
pnpm prisma studio
```
- Abrir tabla `SecurityLog`
- Ver eventos: GPS_VALIDATION_FAILED, RATE_LIMIT_EXCEEDED, etc.

#### Campos importantes:
- `action`: Tipo de evento
- `severity`: LOW, MEDIUM, HIGH, CRITICAL
- `details`: JSON con información del evento
- `ipAddress`: IP del cliente
- `createdAt`: Timestamp

---

## 🧪 Testing de Producción

### Pre-Deployment Checklist:
- [ ] Upstash Redis configurado y funcionando
- [ ] Stripe Price IDs en `.env` de producción
- [ ] Admin emails configurados
- [ ] GPS validation probada con NFC real en campo
- [ ] Rate limiting probado localmente
- [ ] SecurityLog registrando eventos correctamente

### Variables de Entorno en Vercel:
```bash
UPSTASH_REDIS_REST_URL=https://prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=Axxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_live_xxxxxxx
STRIPE_BUSINESS_PRICE_ID=price_live_yyyyyyy
ADMIN_EMAILS=admin@example.com
```

---

## 🚨 Troubleshooting

### Error: "Rate limit service unavailable"
**Causa:** Redis/Upstash no configurado o credenciales incorrectas

**Solución:**
1. Verificar `.env`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=A...==
   ```
2. Probar conexión:
   ```typescript
   import { redis } from '@/lib/security/ratelimit';
   await redis.ping(); // Debe retornar "PONG"
   ```

### Error: "Payment verification failed"
**Causa:** Stripe sessionId inválido o expirado

**Solución:**
1. Verificar que sessionId viene del checkout de Stripe
2. No reutilizar sessionIds ya verificados
3. Verificar STRIPE_SECRET_KEY correcta

### Error: "GPS validation failed - TOO_FAR"
**Causa:** Usuario lejos del POI (>100m)

**Solución Normal:** Usuario debe estar físicamente en el POI

**Debugging:**
1. Verificar coordenadas del POI en BD
2. Verificar GPS del dispositivo funciona
3. Ajustar tolerancia en `geovalidation.ts` si es necesario (línea 19):
   ```typescript
   const PROXIMITY_THRESHOLD = 100; // Cambiar a 200 para testing
   ```

### Error: "Forbidden" en endpoints admin
**Causa:** Usuario no tiene rol ADMIN

**Solución:**
1. Verificar `user.isAdmin === true` en BD
2. Verificar `user.role === 'ADMIN'` o `'SUPER_ADMIN'`
3. Reiniciar sesión después de cambios en BD

---

## 📊 Monitoreo de Seguridad

### Queries útiles para SecurityLog:

#### Ver intentos de GPS spoofing (últimas 24h):
```sql
SELECT * FROM security_logs 
WHERE action = 'GPS_VALIDATION_FAILED' 
  AND "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;
```

#### Top usuarios con rate limits:
```sql
SELECT "userId", COUNT(*) as attempts
FROM security_logs 
WHERE action = 'RATE_LIMIT_EXCEEDED'
  AND "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "userId"
ORDER BY attempts DESC
LIMIT 10;
```

#### Intentos de bypass de pagos:
```sql
SELECT * FROM security_logs 
WHERE action = 'PAYMENT_VERIFICATION_FAILED'
ORDER BY "createdAt" DESC;
```

---

## 📞 Soporte

Para problemas de seguridad críticos:
1. Revisar `SecurityLog` en Prisma Studio
2. Verificar logs de Vercel/servidor
3. Verificar SECURITY-AUDIT.md para vulnerabilidades conocidas
4. Consultar SECURITY-IMPLEMENTATION.md para detalles de implementación

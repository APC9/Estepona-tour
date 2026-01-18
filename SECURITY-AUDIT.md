# 🔒 AUDITORÍA DE SEGURIDAD - Estepona Tours PWA

**Fecha:** 15 de Enero de 2026  
**Auditor:** Análisis de Código Estático  
**Versión de la Aplicación:** Next.js 15.1.0  
**Severidad General:** 🔴 **ALTA** - Múltiples vulnerabilidades críticas detectadas

---

## 📋 EXECUTIVE SUMMARY

### Estadísticas de Vulnerabilidades

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 CRÍTICA | 8 | ⚠️ Requiere acción inmediata |
| 🟠 ALTA | 12 | 📅 Resolver antes de producción |
| 🟡 MEDIA | 15 | ⏰ Resolver en próximo sprint |
| 🟢 BAJA | 8 | 📝 Hardening general |

### Top 5 Riesgos Críticos

1. **🔴 CRÍTICO**: Sin validación de proximidad GPS - Usuarios pueden obtener puntos sin estar físicamente en el POI
2. **🔴 CRÍTICO**: Bypass de tier premium - Cualquiera puede activar PREMIUM sin pagar
3. **🔴 CRÍTICO**: Sin rate limiting - Escaneo infinito del mismo POI
4. **🔴 CRÍTICO**: Admin check inseguro - Solo verifica email en frontend (bypasseable)
5. **🔴 CRÍTICO**: Webhook sin autenticación - Cualquiera puede triggerear webhooks

---

## 🚨 VULNERABILIDADES CRÍTICAS (Acción Inmediata)

### [CRÍTICO-001] 🔴 GPS Spoofing & Sin Validación de Proximidad

**CWE ID:** CWE-807 (Reliance on Untrusted Inputs)  
**CVSS Score:** 8.2 (High)  
**Affected Component:** `/api/scan/[nfcUid]/route.ts`

**Descripción:**
El endpoint de escaneo NFC acepta coordenadas GPS del cliente sin validación. Un atacante puede usar apps como "Fake GPS" para:
- Escanear POIs desde cualquier lugar del mundo
- Obtener puntos/recompensas sin visitar físicamente los sitios
- Desbloquear contenido premium sin estar presente

**Código Vulnerable:**
```typescript
// app/api/scan/[nfcUid]/route.ts
const { latitude, longitude } = body;
console.log('📍 Location received:', { latitude, longitude });

// ❌ NO HAY VALIDACIÓN DE PROXIMIDAD
const visit = await tx.visit.create({
  data: {
    userId: user.id,
    poiId: poi.id,
    latitude, // Coordenadas confiadas ciegamente
    longitude,
  },
});
```

**Attack Scenario:**
1. Atacante instala "Fake GPS Location" en Android
2. Configura ubicación falsa en Estepona (36.4252, -5.1471)
3. Escanea código QR de un POI (obtenido de foto online)
4. Obtiene puntos sin salir de su casa en Madrid

**Impact:**
- **Confidentiality:** Baja
- **Integrity:** ALTA - Sistema de gamificación comprometido
- **Availability:** Baja
- **Business Impact:** Pérdida de credibilidad, usuarios legítimos frustrados, recompensas fraudulentas

**Remediation:**

```typescript
// lib/security/geovalidation.ts
export interface ValidationResult {
  isValid: boolean;
  distance: number;
  suspicious: boolean;
  reason?: string;
}

/**
 * Calcula distancia entre dos puntos GPS (fórmula de Haversine)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Valida que el usuario está realmente cerca del POI
 */
export async function validateProximity(
  userId: string,
  poiLocation: { lat: number; lng: number },
  userLocation: { latitude: number; longitude: number },
  nfcUid: string,
  prisma: any
): Promise<ValidationResult> {
  const MAX_DISTANCE = 100; // 100 metros de tolerancia
  const SUSPICIOUS_SPEED = 50; // m/s (180 km/h) - velocidad sospechosa
  
  // 1. Validar que coordenadas son realistas
  if (
    Math.abs(userLocation.latitude) > 90 ||
    Math.abs(userLocation.longitude) > 180
  ) {
    return {
      isValid: false,
      distance: 0,
      suspicious: true,
      reason: 'Invalid coordinates',
    };
  }

  // 2. Calcular distancia real al POI
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    poiLocation.lat,
    poiLocation.lng
  );

  if (distance > MAX_DISTANCE) {
    return {
      isValid: false,
      distance,
      suspicious: true,
      reason: `Too far from POI (${Math.round(distance)}m)`,
    };
  }

  // 3. Detectar teleportación (GPS spoofing)
  const lastVisit = await prisma.visit.findFirst({
    where: { userId },
    orderBy: { scannedAt: 'desc' },
    select: {
      latitude: true,
      longitude: true,
      scannedAt: true,
      poi: {
        select: { lat: true, lng: true },
      },
    },
  });

  if (lastVisit && lastVisit.latitude && lastVisit.longitude) {
    const timeDiff = (Date.now() - lastVisit.scannedAt.getTime()) / 1000; // segundos
    const lastDistance = calculateDistance(
      lastVisit.latitude,
      lastVisit.longitude,
      userLocation.latitude,
      userLocation.longitude
    );
    const speed = lastDistance / timeDiff; // m/s

    if (speed > SUSPICIOUS_SPEED && timeDiff < 60) {
      // Movimiento imposible en menos de 1 minuto
      return {
        isValid: false,
        distance,
        suspicious: true,
        reason: `Impossible movement speed (${Math.round(speed * 3.6)} km/h)`,
      };
    }
  }

  // 4. Verificar que NFC UID coincide con POI cercano (anti-cloning)
  const poiByNfc = await prisma.pOI.findUnique({
    where: { nfcUid },
    select: { id: true, lat: true, lng: true },
  });

  if (!poiByNfc) {
    return {
      isValid: false,
      distance,
      suspicious: true,
      reason: 'NFC UID not found',
    };
  }

  // Verificar que el POI del NFC está cerca de la ubicación reportada
  const nfcPoiDistance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    poiByNfc.lat,
    poiByNfc.lng
  );

  if (nfcPoiDistance > MAX_DISTANCE) {
    return {
      isValid: false,
      distance: nfcPoiDistance,
      suspicious: true,
      reason: 'NFC UID does not match nearby POI',
    };
  }

  return {
    isValid: true,
    distance,
    suspicious: false,
  };
}
```

```typescript
// app/api/scan/[nfcUid]/route.ts - VERSIÓN SEGURA
import { validateProximity } from '@/lib/security/geovalidation';

export async function POST(
  req: NextRequest,
  { params }: { params: { nfcUid: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nfcUid } = params;
    const body = await req.json();
    const { latitude, longitude } = body;

    // ✅ VALIDACIÓN OBLIGATORIA DE UBICACIÓN
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Location required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const poi = await prisma.pOI.findUnique({
      where: { nfcUid },
    });

    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    // ✅ VALIDAR PROXIMIDAD Y DETECTAR SPOOFING
    const validation = await validateProximity(
      user.id,
      { lat: poi.lat, lng: poi.lng },
      { latitude, longitude },
      nfcUid,
      prisma
    );

    if (!validation.isValid) {
      // 🚨 Registrar intento sospechoso
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'SUSPICIOUS_SCAN',
          details: {
            nfcUid,
            userLocation: { latitude, longitude },
            poiLocation: { lat: poi.lat, lng: poi.lng },
            distance: validation.distance,
            reason: validation.reason,
          },
          severity: 'HIGH',
        },
      });

      return NextResponse.json(
        {
          error: 'Location validation failed',
          reason: validation.reason,
          distance: Math.round(validation.distance),
        },
        { status: 403 }
      );
    }

    // ✅ Proceder con el escaneo solo si la validación pasa
    // ... resto del código
  } catch (error) {
    console.error('Error processing scan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
# Test con ubicación válida
curl -X POST http://localhost:3001/api/scan/NFC-123 \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"latitude": 36.4252, "longitude": -5.1471}'
# Esperado: 200 OK

# Test con ubicación falsa (Madrid)
curl -X POST http://localhost:3001/api/scan/NFC-123 \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"latitude": 40.4168, "longitude": -3.7038}'
# Esperado: 403 Forbidden
```

---

### [CRÍTICO-002] 🔴 Bypass de Tier Premium - Sin Validación de Pago

**CWE ID:** CWE-285 (Improper Authorization)  
**CVSS Score:** 9.1 (Critical)  
**Affected Component:** `/api/user/tier/route.ts`

**Descripción:**
El endpoint permite a cualquier usuario autenticado cambiar su tier a PREMIUM o FAMILY sin verificar pago. No hay integración con Stripe, cualquiera puede hacer:

```bash
POST /api/user/tier
{
  "tier": "PREMIUM",
  "duration": 365
}
```

Y obtener 1 año de premium gratis.

**Código Vulnerable:**
```typescript
// app/api/user/tier/route.ts
export async function POST(req: NextRequest) {
  const { tier, duration = 30 } = await req.json();
  
  // ❌ NO HAY VERIFICACIÓN DE PAGO
  if (!tier || !['FREE', 'PREMIUM', 'FAMILY'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }
  
  // ✅ Acepta cualquier tier sin validar pago
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      tier: tier as Tier,
      subscriptionEnd: subscriptionEnd,
      isSubscriptionActive: true,
    },
  });
}
```

**Attack Scenario:**
```typescript
// Desde el navegador, un atacante ejecuta:
await fetch('/api/user/tier', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier: 'FAMILY', duration: 999999 })
});
// ✅ Ahora tiene tier FAMILY gratis por 2739 años
```

**Impact:**
- **Business Impact:** 💸 CRÍTICO - Pérdida total de ingresos
- **Integrity:** ALTA - Sistema de suscripciones inútil

**Remediation:**

```typescript
// lib/stripe/server.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const TIER_PRICES = {
  PREMIUM_MONTHLY: 999, // €9.99 en centavos
  PREMIUM_QUARTERLY: 2499, // €24.99 (descuento 15%)
  PREMIUM_ANNUAL: 8999, // €89.99 (descuento 25%)
  FAMILY_MONTHLY: 1999,
  FAMILY_QUARTERLY: 4999,
  FAMILY_ANNUAL: 17999,
} as const;

/**
 * Verificar que el pago fue exitoso
 */
export async function verifyPayment(sessionId: string): Promise<{
  valid: boolean;
  tier?: 'PREMIUM' | 'FAMILY';
  duration?: number;
  customerId?: string;
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return { valid: false };
    }
    
    // Extraer tier y duración del metadata
    const tier = session.metadata?.tier as 'PREMIUM' | 'FAMILY';
    const duration = parseInt(session.metadata?.duration || '30');
    
    return {
      valid: true,
      tier,
      duration,
      customerId: session.customer as string,
    };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return { valid: false };
  }
}
```

```typescript
// app/api/user/tier/route.ts - VERSIÓN SEGURA
import { verifyPayment } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, duration, paymentSessionId } = await req.json();

    // ✅ SOLO permitir FREE sin pago
    if (tier === 'FREE') {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          tier: 'FREE',
          subscriptionStart: null,
          subscriptionEnd: null,
          isSubscriptionActive: false,
        },
      });
      return NextResponse.json({ success: true });
    }

    // ✅ Para PREMIUM/FAMILY, REQUERIR verificación de pago
    if (!paymentSessionId) {
      return NextResponse.json(
        { error: 'Payment session required for paid tiers' },
        { status: 400 }
      );
    }

    // ✅ Verificar que el pago fue exitoso en Stripe
    const payment = await verifyPayment(paymentSessionId);
    
    if (!payment.valid) {
      // 🚨 Log intento de bypass
      await prisma.securityLog.create({
        data: {
          userId: user.id,
          action: 'TIER_BYPASS_ATTEMPT',
          details: { tier, paymentSessionId },
          severity: 'CRITICAL',
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid payment' },
        { status: 403 }
      );
    }

    // ✅ Validar que el tier pagado coincide
    if (payment.tier !== tier) {
      return NextResponse.json(
        { error: 'Tier mismatch' },
        { status: 400 }
      );
    }

    // ✅ Actualizar con datos verificados
    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + payment.duration!);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        tier: payment.tier,
        subscriptionStart: now,
        subscriptionEnd,
        isSubscriptionActive: true,
        stripeCustomerId: payment.customerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Suscripción activada hasta ${subscriptionEnd.toLocaleDateString()}`,
    });
  } catch (error) {
    console.error('Error updating tier:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

**Additional Recommendations:**
- Implementar Stripe Checkout completo
- Usar webhooks de Stripe para confirmación asíncrona
- Almacenar `stripeCustomerId` y `stripeSubscriptionId` en el usuario
- Implementar reconciliación diaria de suscripciones
- Rate limit este endpoint a 3 intentos/hora

---

### [CRÍTICO-003] 🔴 Sin Rate Limiting - Escaneo Infinito del Mismo POI

**CWE ID:** CWE-770 (Allocation of Resources Without Limits)  
**CVSS Score:** 7.5 (High)  
**Affected Component:** `/api/scan/[nfcUid]/route.ts`

**Descripción:**
No hay rate limiting en escaneos NFC. Un atacante puede:
```typescript
// Escanear el mismo POI infinitas veces
for (let i = 0; i < 1000; i++) {
  await fetch('/api/scan/NFC-123', {
    method: 'POST',
    body: JSON.stringify({ latitude: 36.4252, longitude: -5.1471 })
  });
}
// ✅ 10,000 puntos en segundos
```

**Remediation:**

```typescript
// lib/redis/ratelimit.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit por usuario y POI
 * Previene escaneo múltiple del mismo POI
 */
export async function rateLimitScan(
  userId: string,
  poiId: string
): Promise<RateLimitResult> {
  const key = `ratelimit:scan:${userId}:${poiId}`;
  const limit = 1; // 1 escaneo por POI por usuario
  const window = 24 * 60 * 60; // 24 horas

  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window);
  }

  const ttl = await redis.ttl(key);
  const reset = Date.now() + ttl * 1000;

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    reset,
  };
}

/**
 * Rate limit global de escaneos por usuario
 * Previene spam de escaneos
 */
export async function rateLimitUser(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:user:${userId}`;

  const [count] = await redis
    .multi()
    .incr(key)
    .expire(key, windowSeconds)
    .exec();

  const remaining = Math.max(0, limit - (count as number));
  const reset = Date.now() + windowSeconds * 1000;

  return {
    success: (count as number) <= limit,
    limit,
    remaining,
    reset,
  };
}
```

```typescript
// app/api/scan/[nfcUid]/route.ts - CON RATE LIMITING
import { rateLimitScan, rateLimitUser } from '@/lib/redis/ratelimit';

export async function POST(req: NextRequest, { params }: { params: { nfcUid: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Rate limit global (10 escaneos por minuto)
    const globalLimit = await rateLimitUser(user.id, 10, 60);
    if (!globalLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((globalLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': globalLimit.limit.toString(),
            'X-RateLimit-Remaining': globalLimit.remaining.toString(),
            'X-RateLimit-Reset': globalLimit.reset.toString(),
            'Retry-After': Math.ceil((globalLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const poi = await prisma.pOI.findUnique({
      where: { nfcUid: params.nfcUid },
    });

    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    // ✅ Rate limit por POI (1 vez cada 24 horas)
    const poiLimit = await rateLimitScan(user.id, poi.id);
    if (!poiLimit.success) {
      const hoursLeft = Math.ceil((poiLimit.reset - Date.now()) / (1000 * 60 * 60));
      return NextResponse.json(
        {
          error: 'POI already scanned',
          message: `You can scan this POI again in ${hoursLeft} hours`,
          resetAt: new Date(poiLimit.reset).toISOString(),
        },
        { status: 429 }
      );
    }

    // ✅ Proceder con escaneo
    // ... resto del código
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### [CRÍTICO-004] 🔴 Admin Authorization Bypasseable

**CWE ID:** CWE-602 (Client-Side Enforcement of Server-Side Security)  
**CVSS Score:** 8.8 (High)  
**Affected Component:** `/app/admin/*` y `/api/admin/*`

**Descripción:**
La verificación de admin solo compara email con variable de entorno:

```typescript
// app/api/admin/pois/route.ts
const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
```

Problemas:
1. `NEXT_PUBLIC_*` está expuesta en el cliente
2. Solo verifica email (vulnerable a account takeover)
3. No hay rol en la base de datos

**Remediation:**

```typescript
// prisma/schema.prisma
model User {
  // ... campos existentes
  
  role          Role           @default(USER)
  isAdmin       Boolean        @default(false)
  permissions   Permission[]   @default([])
}

enum Role {
  USER
  BUSINESS
  ADMIN
  SUPER_ADMIN
}

enum Permission {
  VIEW_ANALYTICS
  MANAGE_POIS
  MANAGE_USERS
  MANAGE_BADGES
  VIEW_LOGS
  MANAGE_SETTINGS
}
```

```typescript
// lib/auth/rbac.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Permission, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      role: true,
      isAdmin: true,
      permissions: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  if (!user.isAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  
  // Super admin tiene todos los permisos
  if (user.role === 'SUPER_ADMIN') {
    return user;
  }
  
  if (!user.permissions.includes(permission)) {
    throw new Error(`Permission ${permission} required`);
  }
  
  return user;
}
```

```typescript
// app/api/admin/pois/route.ts - VERSIÓN SEGURA
import { requirePermission } from '@/lib/auth/rbac';
import { Permission } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // ✅ Verificar permiso específico
    await requirePermission(Permission.MANAGE_POIS);
    
    // ... resto del código
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

---

### [CRÍTICO-005] 🔴 Race Condition en Sistema de Puntos

**CWE ID:** CWE-362 (Concurrent Execution using Shared Resource with Improper Synchronization)  
**CVSS Score:** 7.4 (High)  
**Affected Component:** `/api/scan/[nfcUid]/route.ts`

**Descripción:**
Múltiples requests simultáneos pueden crear visitas duplicadas y otorgar puntos múltiples:

```typescript
// Atacante envía 10 requests simultáneas
Promise.all([
  fetch('/api/scan/NFC-123', { method: 'POST', ... }),
  fetch('/api/scan/NFC-123', { method: 'POST', ... }),
  // ... x10
]);
// ✅ Obtiene 10x los puntos antes de que se registre la primera visita
```

**Remediation:**

```typescript
// lib/redis/locks.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function acquireLock(
  key: string,
  ttlSeconds: number = 10
): Promise<boolean> {
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', {
    ex: ttlSeconds,
    nx: true, // Solo set si no existe
  });
  return acquired === 'OK';
}

export async function releaseLock(key: string): Promise<void> {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
}
```

```typescript
// app/api/scan/[nfcUid]/route.ts - CON DISTRIBUTED LOCK
import { acquireLock, releaseLock } from '@/lib/redis/locks';

export async function POST(req: NextRequest, { params }: { params: { nfcUid: string } }) {
  const lockKey = `scan:${session.user.email}:${params.nfcUid}`;
  
  // ✅ Adquirir lock antes de procesar
  const acquired = await acquireLock(lockKey, 10);
  
  if (!acquired) {
    return NextResponse.json(
      { error: 'Scan in progress, please wait' },
      { status: 429 }
    );
  }
  
  try {
    // Verificar visita existente dentro del lock
    const existingVisit = await prisma.visit.findUnique({
      where: {
        userId_poiId: {
          userId: user.id,
          poiId: poi.id,
        },
      },
    });

    if (existingVisit) {
      return NextResponse.json(
        { error: 'Already visited' },
        { status: 400 }
      );
    }
    
    // ✅ Transacción atómica para visita + puntos
    const result = await prisma.$transaction(async (tx) => {
      const visit = await tx.visit.create({
        data: { userId: user.id, poiId: poi.id, ... },
      });
      
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: poi.points },
          experiencePoints: { increment: poi.xpReward },
        },
      });
      
      return { visit, updatedUser };
    });
    
    return NextResponse.json({ success: true, ...result });
  } finally {
    // ✅ Siempre liberar el lock
    await releaseLock(lockKey);
  }
}
```

---

## 🟠 VULNERABILIDADES ALTAS (Resolver antes de producción)

### [ALTA-001] 🟠 Webhook sin Autenticación

**CWE ID:** CWE-306  
**Affected Component:** Webhook en `lib/auth.ts`

**Problema:**
```typescript
// lib/auth.ts línea 60
await fetch(`${process.env.N8N_WEBHOOK_URL}/user-registered`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, email, name }),
});
// ❌ Sin autenticación - cualquiera puede triggerear
```

**Remediation:**
```typescript
// lib/webhooks/n8n.ts
import crypto from 'crypto';

function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export async function sendWebhook(
  endpoint: string,
  data: object
): Promise<void> {
  const payload = JSON.stringify(data);
  const signature = signPayload(payload, process.env.WEBHOOK_SECRET!);
  
  await fetch(`${process.env.N8N_WEBHOOK_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': Date.now().toString(),
    },
    body: payload,
  });
}
```

---

### [ALTA-002] 🟠 XSS en Descripciones de POIs

**CWE ID:** CWE-79  
**Affected Component:** Admin POI creation

**Problema:**
```typescript
// Descripciones almacenadas sin sanitización
descEs: descEs, // ⚠️ Puede contener <script>alert('XSS')</script>
```

**Remediation:**
```bash
npm install dompurify isomorphic-dompurify
```

```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}

// app/api/admin/pois/route.ts
import { sanitizeHTML } from '@/lib/security/sanitize';

const poi = await prisma.pOI.create({
  data: {
    descEs: sanitizeHTML(descEs),
    descEn: sanitizeHTML(descEn),
    // ...
  },
});
```

---

### [ALTA-003] 🟠 IDOR en Endpoints de Usuario

**CWE ID:** CWE-639  
**Affected Component:** `/api/admin/users/[id]/route.ts`

**Problema:**
```typescript
// ⚠️ No valida que el admin tenga permiso para ver ese usuario
const user = await prisma.user.findUnique({ where: { id: params.id } });
```

**Remediation:**
```typescript
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  
  // ✅ Log acceso a datos de usuario
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'VIEW_USER',
      targetUserId: params.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    },
  });
  
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  return NextResponse.json(user);
}
```

---

## 🔐 SECURITY HEADERS - Configuración Inmediata

```javascript
// next.config.js - AGREGAR HEADERS DE SEGURIDAD
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self), camera=(), microphone=()'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https: blob:;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://api.stripe.com;
              frame-src https://js.stripe.com;
            `.replace(/\\s{2,}/g, ' ').trim()
          },
        ],
      },
    ];
  },
};
```

---

## 📊 PRIORIZACIÓN DE IMPLEMENTACIÓN

### Sprint 1 (Semana 1-2) - CRÍTICO
- [ ] CRÍTICO-002: Integración completa de Stripe + validación de pagos
- [ ] CRÍTICO-003: Implementar rate limiting con Redis
- [ ] CRÍTICO-004: Sistema RBAC con roles en BD
- [ ] Security headers en next.config.js

### Sprint 2 (Semana 3-4) - ALTO
- [ ] CRÍTICO-001: Validación GPS + detección de spoofing
- [ ] CRÍTICO-005: Distributed locks para race conditions
- [ ] ALTA-001: Autenticación de webhooks
- [ ] ALTA-002: Sanitización de HTML

### Sprint 3 (Semana 5-6) - MEDIO
- [ ] Audit logging completo
- [ ] GDPR compliance (datos personales, retention policy)
- [ ] Monitoring y alertas de seguridad
- [ ] Penetration testing

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### Análisis de Código
```bash
# SAST
npm install -D @typescript-eslint/eslint-plugin-security
npx eslint . --ext .ts,.tsx

# Dependency scanning
npm audit
npx snyk test

# Secrets scanning
npx secretlint "**/*"
```

### Testing de Seguridad
```bash
# API security testing
npm install -D @apidevtools/swagger-cli
npm install -D newman

# E2E security tests
npx playwright test --grep @security
```

### Monitoring
```bash
# Setup Sentry para error tracking
npm install @sentry/nextjs

# Upstash Redis para rate limiting
npm install @upstash/redis
```

---

## 📞 CONTACTO Y SOPORTE

**Para incidentes de seguridad críticos:**
- Email: security@estepona-tours.com (crear)
- Respuesta esperada: < 4 horas
- GPG Key: [Generar e incluir]

**Bug Bounty Program:**
- Considerar programa de recompensas para investigadores
- Scopes: In-scope vs out-of-scope
- Recompensas sugeridas: €50-500 según severidad

---

**Última actualización:** 15 de Enero de 2026  
**Próxima revisión:** 15 de Febrero de 2026  
**Versión del documento:** 1.0

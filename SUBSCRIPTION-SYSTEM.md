# Sistema de Suscripciones por Período de Tiempo

## Descripción

El sistema permite controlar el acceso de los usuarios a la aplicación mediante suscripciones con períodos de tiempo determinados. Cada usuario puede tener un plan (FREE, PREMIUM o FAMILY) con una fecha de inicio y expiración.

## Características

### 1. **Campos en Base de Datos**

Se agregaron los siguientes campos al modelo `User` en Prisma:

```prisma
subscriptionStart    DateTime?    // Fecha de inicio de la suscripción
subscriptionEnd      DateTime?    // Fecha de expiración
isSubscriptionActive Boolean      // Estado de la suscripción
```

### 2. **Verificación Automática**

- El componente `SubscriptionCheck` verifica el estado de la suscripción cada 5 minutos
- Si la suscripción ha expirado, cierra la sesión automáticamente y redirige al usuario a la página principal
- El usuario debe renovar su plan para continuar accediendo

### 3. **Selección de Duración**

En la página de upgrade (`/upgrade`), el usuario puede seleccionar:

- **Mensual**: 30 días
  - Premium: €9.99
  - Familiar: €19.99
  
- **Trimestral**: 90 días (15% descuento)
  - Premium: €24.99
  - Familiar: €49.99
  
- **Anual**: 365 días (25% descuento)
  - Premium: €89.99
  - Familiar: €179.99

### 4. **API Endpoints**

#### Verificar Suscripción
```
GET /api/user/subscription
```
Retorna:
```json
{
  "isActive": true,
  "tier": "PREMIUM",
  "subscriptionStart": "2024-01-15T00:00:00.000Z",
  "subscriptionEnd": "2024-02-15T00:00:00.000Z",
  "daysRemaining": 30
}
```

#### Actualizar Tier
```
POST /api/user/tier
Body: {
  "tier": "PREMIUM",
  "duration": 30  // días
}
```

#### Extender Suscripción (Admin)
```
POST /api/admin/users/[id]/subscription
Body: {
  "extendDays": 30
}
```

### 5. **Panel de Administración**

Nueva página: `/admin/subscriptions`

Funcionalidades:
- Ver todas las suscripciones de usuarios
- Filtrar por nombre o email
- Ver días restantes de cada suscripción
- Alertas visuales para suscripciones próximas a vencer (≤7 días)
- Extender suscripciones (+30 días o +90 días)

### 6. **Componentes y Hooks**

#### `useSubscription` Hook
```typescript
const { subscription, loading, isActive, tier, daysRemaining } = useSubscription();
```

#### `SubscriptionBadge` Componente
Muestra el plan actual y días restantes con alertas visuales.

#### `SubscriptionCheck` Componente
Verifica automáticamente el estado de la suscripción y cierra sesión si expiró.

## Flujo de Usuario

1. **Usuario Nuevo**
   - Se registra → Tier FREE (sin límite de tiempo)
   - Puede elegir un plan de pago en `/upgrade`

2. **Selección de Plan**
   - Elige tier (PREMIUM o FAMILY)
   - Selecciona duración (30, 90 o 365 días)
   - Se registra `subscriptionStart` y `subscriptionEnd`
   - `isSubscriptionActive` = true

3. **Durante la Suscripción**
   - Acceso completo a funcionalidades del plan
   - Badge visible con días restantes
   - Alerta 7 días antes de expirar

4. **Expiración**
   - `SubscriptionCheck` detecta expiración
   - Cierra sesión automáticamente
   - Usuario debe renovar para acceder nuevamente
   - Tier vuelve a FREE automáticamente

## Integración con Stripe (Pendiente)

Para integrar pagos reales:

1. Instalar: `npm install stripe @stripe/stripe-js`
2. Configurar webhook de Stripe
3. Actualizar `handleSelectTier` en `/upgrade/page.tsx`
4. Crear sesión de checkout de Stripe
5. Manejar confirmación de pago
6. Actualizar suscripción en base de datos

## Consideraciones de Seguridad

- Las fechas se verifican en el servidor (no confiar en el cliente)
- La API `/api/user/subscription` requiere autenticación
- Las operaciones de administrador deberían verificar rol (implementar campo `isAdmin`)
- Las sesiones expiradas se invalidan automáticamente

## Tareas Pendientes

- [ ] Agregar campo `isAdmin` al modelo User
- [ ] Implementar integración con Stripe
- [ ] Agregar emails de notificación antes de expiración
- [ ] Implementar renovación automática
- [ ] Agregar historial de suscripciones
- [ ] Implementar reembolsos y cancelaciones

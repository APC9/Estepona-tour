# 🏆 Sistema de Gestión de Premios

## Descripción

El sistema permite a los administradores gestionar de forma dinámica los puntos necesarios para cada nivel de premio (Bronce, Plata y Oro) a través del panel administrativo.

## Características

✅ **Configuración Dinámica**: Los puntos requeridos se almacenan en la base de datos  
✅ **Panel Administrativo**: Interfaz intuitiva para editar premios  
✅ **Validaciones**: Garantiza orden ascendente de puntos (Bronce < Plata < Oro)  
✅ **Valores Predeterminados**: Sistema de fallback si la BD no está disponible  
✅ **Activación/Desactivación**: Control individual de cada nivel de premio  

## Estructura

### Base de Datos

Nueva tabla `reward_configs`:
```prisma
model RewardConfig {
  id              String     @id @default(cuid())
  tier            RewardTier @unique // BRONZE, SILVER, GOLD
  pointsRequired  Int
  name            String
  size            String
  description     String     @db.Text
  emoji           String     @default("🏆")
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

### API Endpoints

#### `GET /api/admin/rewards`
Obtiene todas las configuraciones de premios (requiere permisos de admin)

**Respuesta:**
```json
{
  "rewardConfigs": [
    {
      "id": "...",
      "tier": "BRONZE",
      "pointsRequired": 500,
      "name": "Bronce",
      "size": "10x15 cm",
      "description": "...",
      "emoji": "🥉",
      "isActive": true
    }
  ]
}
```

#### `PUT /api/admin/rewards`
Actualiza la configuración de premios (requiere permisos de admin)

**Body:**
```json
{
  "rewardConfigs": [
    {
      "tier": "BRONZE",
      "pointsRequired": 600,
      "name": "Bronce",
      "size": "10x15 cm",
      "description": "...",
      "emoji": "🥉",
      "isActive": true
    }
  ]
}
```

#### `POST /api/admin/rewards`
Inicializa la configuración con valores predeterminados (solo si no existe)

#### `GET /api/rewards/config`
Obtiene la configuración pública de premios (sin autenticación)

## Instalación y Configuración

### 1. Aplicar Cambios al Schema

```bash
# Sincronizar base de datos con el nuevo schema
pnpm prisma db push

# Generar cliente de Prisma
pnpm prisma generate
```

### 2. Inicializar Configuración

Opción A - Usando el script:
```bash
pnpm tsx scripts/init-rewards.ts
```

Opción B - Desde el panel administrativo:
1. Ir a http://localhost:3000/admin/rewards
2. Click en "Inicializar Configuración"

## Uso del Panel Administrativo

### Acceder al Panel

1. Iniciar sesión como administrador
2. Navegar a **Admin Panel → 🏆 Premios**
3. URL: http://localhost:3000/admin/rewards

### Editar Configuración

1. **Puntos Requeridos**: Cambiar la cantidad de puntos necesarios
2. **Tamaño**: Editar las dimensiones del premio
3. **Emoji**: Personalizar el icono mostrado
4. **Descripción**: Modificar el texto descriptivo
5. **Estado**: Activar/desactivar un nivel de premio

### Guardar Cambios

- Click en **"💾 Guardar Cambios"**
- El sistema valida automáticamente:
  - ✅ Puntos positivos
  - ✅ Orden ascendente (Bronce < Plata < Oro)
  - ✅ Puntos únicos para cada tier

## Validaciones

El sistema implementa las siguientes validaciones:

1. **Puntos positivos**: Los puntos deben ser > 0
2. **Orden ascendente**: Bronce < Plata < Oro
3. **Puntos únicos**: No puede haber duplicados
4. **Permisos**: Solo administradores pueden editar

## Integración con el Código

### Obtener Configuración de Premios

```typescript
// En el servidor (API routes, Server Components)
import { getRewardsConfig } from '@/lib/rewards';

const config = await getRewardsConfig();
// { BRONZE: {...}, SILVER: {...}, GOLD: {...} }

// Obtener puntos específicos
import { getPointsRequiredForTier } from '@/lib/rewards';

const bronzePoints = await getPointsRequiredForTier('BRONZE');
```

```typescript
// En el cliente
const res = await fetch('/api/rewards/config');
const { config } = await res.json();
```

### Sistema de Fallback

Si la base de datos no está disponible, el sistema usa valores predeterminados:
- 🥉 Bronce: 500 puntos
- 🥈 Plata: 1500 puntos
- 🥇 Oro: 3000 puntos

## Migración desde Constantes

Antes:
```typescript
// lib/constants.ts
export const REWARDS_CONFIG = {
  BRONZE: { pointsRequired: 500, ... },
  SILVER: { pointsRequired: 1500, ... },
  GOLD: { pointsRequired: 3000, ... },
};
```

Después:
```typescript
// Usar función helper
import { getRewardsConfig } from '@/lib/rewards';
const config = await getRewardsConfig();
```

## Consideraciones Importantes

⚠️ **Los cambios son inmediatos**: Afectan a todos los usuarios instantáneamente  
⚠️ **Usuarios existentes**: Los que ya reclamaron premios no se ven afectados  
⚠️ **Desactivación**: Oculta el premio pero mantiene los datos históricos  
⚠️ **Backup**: Se recomienda hacer backup antes de cambios significativos  

## Troubleshooting

### Error: "La configuración de premios ya existe"
- La configuración ya está inicializada
- No es necesario ejecutar el script de inicialización

### Error: "No autorizado"
- Verificar que el usuario tenga permisos de administrador
- Revisar que `isAdmin = true` y `role = 'ADMIN'` en la BD

### Error: "Los puntos deben estar en orden"
- Asegurar que: Bronce < Plata < Oro
- Ejemplo válido: 500 < 1500 < 3000

## Testing

```bash
# Verificar que la tabla existe
pnpm prisma studio

# Inicializar datos de prueba
pnpm tsx scripts/init-rewards.ts

# Verificar endpoint público
curl http://localhost:3000/api/rewards/config

# Verificar endpoint admin (requiere autenticación)
curl http://localhost:3000/api/admin/rewards
```

## Archivos Relacionados

- `prisma/schema.prisma` - Definición del modelo
- `lib/rewards.ts` - Funciones helper
- `app/api/admin/rewards/route.ts` - API administrativa
- `app/api/rewards/config/route.ts` - API pública
- `app/admin/rewards/page.tsx` - Interfaz de gestión
- `scripts/init-rewards.ts` - Script de inicialización

## Changelog

### v1.0.0 (2026-01-19)
- ✨ Configuración dinámica de premios
- ✨ Panel administrativo de gestión
- ✨ Validaciones automáticas
- ✨ Sistema de fallback
- ✨ Script de inicialización

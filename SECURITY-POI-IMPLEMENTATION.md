# ✅ Checklist de Implementación - Anti-Spoofing NFC + GPS

## Paso 1: Instalar Dependencias

```bash
# Zod ya debería estar instalado, verificar:
pnpm list zod

# Si no está instalado:
pnpm add zod
```

## Paso 2: Aplicar Migración de Base de Datos

```bash
# Generar migración
npx prisma db push

# Verificar que se crearon las tablas:
# - visit_challenges
# - visit_audit_logs
# - session_logs
# - refresh_tokens
# - ip_blacklist
```

## Paso 3: Verificar Archivos Creados

- [ ] `lib/security/gps-validator.ts`
- [ ] `lib/security/device-fingerprint.ts`
- [ ] `lib/security/poi-validation.ts`
- [ ] `app/api/poi/challenge/route.ts`
- [ ] `app/api/poi/validate-visit/route.ts`
- [ ] `hooks/useSecureNFCScanner.ts`
- [ ] `prisma/schema.prisma` (actualizado)

## Paso 4: Integrar en Componente NFCScanner

Reemplazar el método de escaneo actual por:

```typescript
import { useSecureNFCScanner } from '@/hooks/useSecureNFCScanner';

// En tu componente:
const { isScanning, error, gpsSampleCount, scanPOI } = useSecureNFCScanner();

const handleNFCScan = async (nfcUid: string, poiId: string) => {
  const result = await scanPOI(nfcUid, poiId);
  
  if (result.success) {
    onSuccess?.(result);
  } else {
    onError?.(result.error);
  }
};
```

## Paso 5: Probar Flujo Completo

### Test en Desarrollo:
```bash
pnpm dev
```

1. [ ] Navegar a la página del mapa
2. [ ] Abrir el NFC Scanner
3. [ ] Observar que se recolectan 3 GPS samples
4. [ ] Escanear un NFC tag
5. [ ] Verificar que se registra la visita

### Test de Seguridad:

**Caso 1: GPS con baja accuracy**
```
Resultado esperado: Rechazado con flag "LOW_ACCURACY"
```

**Caso 2: Intentar escanear dos veces rápido**
```
Resultado esperado: "Cooldown activo. Intenta en X minutos"
```

**Caso 3: Estar lejos del POI**
```
Resultado esperado: "Usuario a Xm del POI (máximo 50m)"
```

## Paso 6: Monitorear Audit Logs

```typescript
// En Prisma Studio o pgAdmin:
SELECT * FROM visit_audit_logs 
WHERE success = false 
ORDER BY timestamp DESC 
LIMIT 10;

// Ver flags más comunes:
SELECT 
  unnest(flags) as flag,
  COUNT(*) as count
FROM visit_audit_logs
GROUP BY flag
ORDER BY count DESC;
```

## Paso 7: (Opcional) Crear Dashboard de Admin

Agregar en `/app/admin/security/page.tsx`:

```typescript
// Mostrar intentos fallidos recientes
// Gráfica de flags de seguridad
// Lista de usuarios flaggeados
// Mapa de calor de intentos sospechosos
```

## Paso 8: Configurar Alertas (Opcional)

Si usas Sentry o similar:

```typescript
// En lib/security/poi-validation.ts, al rechazar:
if (!validation.isValid && validation.confidence < 20) {
  // Enviar alerta - posible ataque serio
  Sentry.captureMessage('Serious security flag detected', {
    level: 'warning',
    extra: {
      userId,
      poiId,
      flags: validation.flags,
      confidence: validation.confidence
    }
  });
}
```

## ✅ Lista de Verificación Final

- [ ] Base de datos migrada correctamente
- [ ] Todas las dependencias instaladas
- [ ] Componente NFCScanner actualizado
- [ ] Flujo de escaneo probado
- [ ] Tests de seguridad pasados
- [ ] Audit logs funcionando
- [ ] Documentación leída

## 🐛 Troubleshooting

### Error: "Challenge no encontrado"
**Solución**: El challenge expiró (60s). Genera uno nuevo antes de escanear.

### Error: "No se pudieron recolectar suficientes samples"
**Solución**: 
- Verifica que el GPS esté activo
- Intenta en exterior (mejor señal)
- Espera 10-15 segundos para 3 samples

### Error: "Usuario a Xm del POI"
**Solución**: Acércate más al POI real. Radio permitido: 50 metros.

### Error: "Cooldown activo"
**Solución**: Espera 5 minutos desde el último escaneo de ese POI.

### Error: "Rate limit excedido"
**Solución**: Has escaneado 20 POIs en la última hora. Espera.

## 🎉 ¡Listo!

Tu aplicación ahora tiene protección anti-spoofing de nivel enterprise. Los usuarios necesitan:
- ✅ Estar físicamente en el POI
- ✅ Tener GPS preciso
- ✅ Completar validación de challenge
- ✅ Pasar todas las verificaciones de device fingerprinting

**Nivel de seguridad alcanzado: 🔒🔒🔒🔒🔒 (5/5)**

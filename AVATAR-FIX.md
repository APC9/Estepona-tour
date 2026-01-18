# 🗺️ Solución: Avatar del Usuario en el Mapa

## Problema Reportado
El usuario no ve su avatar (punto azul pulsante) en el mapa.

## Causas Posibles

### 1. **Permisos de Geolocalización No Otorgados** ⚠️
**La causa más común**. El navegador necesita permiso explícito para acceder a la ubicación GPS.

**Solución:**
1. El navegador debe mostrar un cuadro de diálogo pidiendo permiso
2. Haz clic en **"Permitir"** o **"Allow"**
3. Si ya lo denegaste:
   - **Chrome:** Ve a Configuración del sitio (icono de candado en la barra de direcciones) → Ubicación → Permitir
   - **Firefox:** Haz clic en el icono de información (ⓘ) → Permisos → Ubicación → Permitir
   - **Safari:** Preferencias → Sitios web → Ubicación → Permitir para localhost

### 2. **GPS Desactivado en el Dispositivo** 📱
Si estás en un móvil, el GPS debe estar activo:
- **Android:** Configuración → Ubicación → Activar
- **iOS:** Ajustes → Privacidad → Servicios de ubicación → Activar

### 3. **HTTPS Requerido en Producción** 🔒
La API de geolocalización solo funciona en:
- `localhost` (desarrollo)
- Sitios con HTTPS (producción)

Si desplegaste la app, asegúrate de tener un certificado SSL válido.

### 4. **Tailwind CSS No Aplicado a Leaflet** 🎨
Los marcadores de Leaflet se crean dinámicamente con `divIcon`, y a veces Tailwind no aplica estilos.

**Verificación:**
Abre las DevTools del navegador (F12) → Console y busca el elemento del marcador. Verifica si las clases `bg-blue-500`, `animate-pulse-slow` están aplicadas.

**Solución si no están aplicadas:**
Añade las clases de animación a `globals.css`:

```css
/* En app/globals.css */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.player-marker {
  z-index: 1000 !important;
}
```

## Cómo Verificar que Funciona

### Paso 1: Abre la Consola del Navegador
Presiona **F12** → Ve a la pestaña **Console**

### Paso 2: Busca Logs de Geolocalización
Deberías ver:
```
User location updated: {lat: 36.4273, lng: -5.1448}
```

Si ves un error como:
```
User denied geolocation
```
→ Problema de permisos (ver solución arriba)

### Paso 3: Inspecciona el Mapa
1. Abre **Elements** en DevTools
2. Busca el marcador del jugador (`.player-marker`)
3. Verifica que exista en el DOM

### Paso 4: Prueba Manual
1. Ve a `/map`
2. Deberías ver:
   - Un punto azul pulsante (tu ubicación)
   - Un círculo verde semi-transparente alrededor tuyo (radio de 50m)
   - Marcadores rojos (POIs)

## Debugging Adicional

### Añadir Logs Temporales
Edita `components/map/GameMap.tsx` y añade console.logs:

```tsx
useEffect(() => {
  if (userLocation) {
    console.log('✅ User location:', userLocation);
    // ... resto del código
  } else {
    console.log('❌ No user location yet');
  }
}, [userLocation]);
```

### Verificar useUserStore
Comprueba que el store de ubicación se actualiza:

```tsx
// En cualquier componente
const userLocation = useUserStore((state) => state.location);
console.log('Location from store:', userLocation);
```

### Forzar una Ubicación de Prueba
Para testing, puedes simular una ubicación en DevTools:
1. F12 → Console → Menú ⋮ → More tools → Sensors
2. En "Location", selecciona una ubicación o ingresa coordenadas manualmente
3. Recarga la página

## Código Implementado

El avatar está implementado en `components/map/GameMap.tsx` (líneas 83-108):

```tsx
const playerIcon = L.divIcon({
  className: 'player-marker',
  html: `
    <div class="relative">
      <div class="w-8 h-8 bg-blue-500 border-4 border-white rounded-full shadow-lg animate-pulse-slow"></div>
      <div class="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-75"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

if (!playerMarkerRef.current && mapRef.current) {
  playerMarkerRef.current = L.marker(
    [userLocation.latitude, userLocation.longitude],
    {
      icon: playerIcon,
      zIndexOffset: 1000,
    }
  ).addTo(mapRef.current);
}
```

## Resultado Esperado

Cuando todo funcione correctamente, verás:

1. **📍 Punto azul pulsante** → Tu ubicación actual
2. **🟢 Círculo verde** → Radio de 50m donde puedes escanear POIs
3. **🔴 Marcadores rojos** → POIs disponibles
4. El mapa se centrará automáticamente en tu ubicación

## Soporte Adicional

Si después de seguir estos pasos el avatar aún no aparece:

1. Toma una captura de la consola del navegador (F12)
2. Verifica que `useGeolocation` hook esté pidiendo permisos
3. Comprueba que no hay errores de JavaScript
4. Asegúrate de estar en la página `/map` (no en otra ruta)

---

**📝 Nota para el Administrador:**  
Si necesitas cambiar el estilo del avatar, edita el HTML del `divIcon` en GameMap.tsx. Puedes cambiar colores (bg-blue-500 → bg-red-500), tamaño (w-8 h-8 → w-10 h-10), o animaciones.

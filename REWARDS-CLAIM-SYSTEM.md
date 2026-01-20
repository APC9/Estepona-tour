# 🎁 Sistema de Reclamación de Premios con Cloudinary

## Funcionalidades Implementadas

### ✅ Para Usuarios
- Modal de reclamación de premios con subida de foto
- Preview de la foto antes de enviar
- Campo opcional para mensaje personalizado
- Validación de tipo de archivo (imágenes) y tamaño (máx 10MB)
- Subida directa a Cloudinary
- Feedback visual durante la subida

### ✅ Para Administradores
- Página `/admin/user-rewards` para ver todas las solicitudes
- Visualización de fotos en alta calidad con opción de ampliar
- URL de Cloudinary para cada foto
- Gestión de estados del premio
- Campo para número de seguimiento

## Configuración de Cloudinary

### 1. Crear Cuenta en Cloudinary

1. Visita [cloudinary.com](https://cloudinary.com)
2. Crea una cuenta gratuita (incluye 25GB de almacenamiento)
3. Accede al Dashboard

### 2. Obtener Credenciales

En el Dashboard de Cloudinary encontrarás:
- **Cloud Name**: `your-cloud-name`
- **API Key**: `123456789012345`
- **API Secret**: `abc...xyz`

### 3. Configurar Upload Preset

1. Ve a **Settings → Upload**
2. Scroll hasta "Upload presets"
3. Click en **Add upload preset**
4. Configura:
   - **Upload preset name**: `rewards_photos`
   - **Signing Mode**: **Unsigned** (importante para uploads desde cliente)
   - **Folder**: `user-rewards` (opcional, organiza mejor)
   - **Max file size**: `10485760` (10MB)
   - **Allowed formats**: `jpg, png, webp, jpeg`
5. **Save**

### 4. Actualizar Variables de Entorno

Edita tu archivo `.env`:

```env
# Cloudinary (para fotos de premios)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name-aqui"
CLOUDINARY_API_KEY="tu-api-key-aqui"
CLOUDINARY_API_SECRET="tu-api-secret-aqui"
```

**⚠️ IMPORTANTE**: Solo `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` es accesible desde el frontend.

### 5. Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C)
pnpm dev
```

## Flujo de Usuario

### 1. Usuario Reclama Premio

1. Usuario acumula puntos suficientes
2. Ve el botón "Reclamar Premios" habilitado
3. Click en el botón
4. Se abre modal con formulario:
   - Seleccionar foto de Estepona
   - (Opcional) Agregar mensaje personalizado
   - Confirmar reclamación

### 2. Subida a Cloudinary

```
Usuario → Modal → Cloudinary API → URL generada → Base de Datos
```

### 3. Administrador Gestiona

1. Accede a `/admin/user-rewards`
2. Ve todas las solicitudes con:
   - Foto del usuario
   - URL de Cloudinary
   - Datos del usuario
   - Estado actual
3. Puede:
   - Cambiar estado del premio
   - Agregar número de seguimiento
   - Ver foto en tamaño completo
   - Copiar URL para descarga

## Estados del Premio

| Estado | Descripción |
|--------|-------------|
| ⏳ **PENDING** | Solicitud recibida, pendiente de revisión |
| ✅ **APPROVED** | Aprobado por admin, listo para producción |
| 🏭 **IN_PRODUCTION** | En proceso de fabricación |
| 📦 **SHIPPED** | Enviado al usuario |
| ✓ **DELIVERED** | Entregado al usuario |
| ❌ **CANCELED** | Cancelado por algún motivo |

## Estructura de Base de Datos

La tabla `user_rewards` ya contiene:
- `photoUrl`: URL de Cloudinary
- `userMessage`: Mensaje opcional del usuario
- `status`: Estado del premio
- `trackingNumber`: Número de seguimiento
- `claimedAt`, `approvedAt`, `shippedAt`, `deliveredAt`: Timestamps

## URLs Generadas por Cloudinary

Formato típico:
```
https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/user-rewards/abc123.jpg
```

Puedes aplicar transformaciones en la URL:
- Redimensionar: `/w_500,h_500,c_fill/`
- Optimizar: `/q_auto,f_auto/`
- Ejemplo: `https://res.cloudinary.com/.../w_500,h_500,c_fill,q_auto/user-rewards/abc123.jpg`

## Seguridad

✅ **Upload Preset Unsigned**: Permite uploads desde el frontend sin exponer API Secret
✅ **Validación de Tamaño**: Máximo 10MB
✅ **Validación de Tipo**: Solo imágenes (jpg, png, webp)
✅ **Folder Organizado**: Todas las fotos en `user-rewards/`
✅ **Autenticación**: Solo usuarios premium pueden reclamar premios

## Testing

### Probar Subida de Foto

1. Inicia sesión como usuario premium
2. Acumula puntos (o ajusta en BD)
3. Ve a la sección de premios
4. Click en "Reclamar Premios"
5. Sube una foto de prueba
6. Verifica que:
   - Se muestra preview
   - La subida es rápida
   - Se guarda en BD con URL

### Verificar en Cloudinary

1. Accede al Dashboard de Cloudinary
2. Ve a **Media Library**
3. Busca carpeta `user-rewards`
4. Verifica que la imagen se subió correctamente

### Verificar en Admin

1. Accede a `/admin/user-rewards`
2. Verifica que aparece la solicitud
3. Click en la imagen para ampliar
4. Verifica que la URL es accesible

## Troubleshooting

### Error: "Upload preset not found"

**Solución**: Crear el upload preset en Cloudinary con nombre exacto `rewards_photos` y modo **Unsigned**.

### Error: "Invalid cloud name"

**Solución**: Verificar que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` en `.env` es correcto y reiniciar servidor.

### La imagen no se sube

1. Verificar consola del navegador para errores
2. Confirmar que el upload preset existe y es Unsigned
3. Verificar tamaño de imagen (< 10MB)
4. Verificar formato de imagen (jpg, png, webp)

### La URL no se guarda en BD

1. Verificar que el endpoint `/api/user/rewards` recibe `photoUrl`
2. Revisar logs del servidor
3. Verificar que la tabla `user_rewards` tiene la columna `photoUrl`

## Mejoras Futuras

- [ ] Crop/resize de imágenes antes de subir
- [ ] Múltiples fotos por premio
- [ ] Filtros y efectos de imagen
- [ ] Galería de fotos destacadas
- [ ] Notificaciones por email en cada cambio de estado
- [ ] Export de fotos para impresión
- [ ] Integración con servicio de impresión

## Archivos Creados/Modificados

- `components/rewards/ClaimRewardModal.tsx` - Modal de reclamación
- `components/rewards/RewardsProgress.tsx` - Integración del modal
- `app/admin/user-rewards/page.tsx` - Panel de gestión
- `app/api/admin/user-rewards/route.ts` - API para listar premios
- `app/api/admin/user-rewards/[id]/route.ts` - API para actualizar estados
- `app/admin/layout.tsx` - Nuevo enlace en menú

## Soporte

Para más información sobre Cloudinary:
- [Documentación oficial](https://cloudinary.com/documentation)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Transformaciones](https://cloudinary.com/documentation/image_transformations)

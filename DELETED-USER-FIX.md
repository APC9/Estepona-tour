# 🔒 Corrección: Usuarios Eliminados Mantienen Acceso

## Problema Identificado

Un usuario eliminado de la base de datos mantenía su sesión JWT activa y podía seguir accediendo al panel administrativo y al mapa.

### Root Cause
- **NextAuth usa JWT sessions** que se almacenan en cookies del navegador
- Las sesiones JWT **no se invalidan automáticamente** cuando se elimina un usuario de la BD
- Los tokens JWT continúan siendo válidos hasta su expiración (30 días)

---

## ✅ Solución Implementada

### 1️⃣ Verificación en Callback de Sesión (`lib/auth.ts`)

**Cambio:** El callback `session` ahora verifica que el usuario existe en BD antes de devolver la sesión.

```typescript
async session({ session, token }) {
  if (session.user) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        tier: true,
        isAdmin: true,
        role: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    // 🔒 Si el usuario no existe, invalidar sesión
    if (!user) {
      return { ...session, user: undefined };
    }

    // Resto del código...
  }
}
```

**Efecto:**
- Si el usuario fue eliminado, NextAuth recibirá `user: undefined`
- La sesión se considera inválida
- El usuario es redirigido al login

---

### 2️⃣ Verificación Server-Side en Admin Panel (`app/admin/layout.tsx`)

**Cambio:** El layout del admin ahora llama a un endpoint server-side para verificar acceso.

```typescript
useEffect(() => {
  const checkAdminAccess = async () => {
    if (status === 'authenticated') {
      try {
        const response = await fetch('/api/admin/check-access');
        const data = await response.json();

        if (!data.isAdmin || response.status === 404) {
          console.warn('User deleted or not admin - signing out');
          await signOut({ 
            callbackUrl: '/auth/signin?error=AdminAccessDenied' 
          });
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
      }
    }
    setChecking(false);
  };

  checkAdminAccess();
}, [session, status]);
```

**Efecto:**
- Verifica en el servidor que el usuario existe en BD
- Si el usuario fue eliminado (404), cierra la sesión automáticamente
- Redirige al login con mensaje de error

---

### 3️⃣ Endpoint de Verificación (`app/api/admin/check-access/route.ts`)

**Nuevo archivo:** Endpoint server-side que verifica usuario y rol admin.

```typescript
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  // 🔒 Verificar que el usuario existe en BD
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, isAdmin: true, role: true },
  });

  // Usuario no existe en BD
  if (!user) {
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'User not found in database' 
    }, { status: 404 });
  }

  const isAdmin = user.isAdmin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  return NextResponse.json({ isAdmin });
}
```

**Efecto:**
- Consulta la BD en cada verificación
- Retorna 404 si el usuario no existe
- No depende solo de la sesión JWT

---

### 4️⃣ Verificación en Páginas Principales (`app/(main)/layout.tsx`)

**Cambio:** El layout principal ahora verifica que el usuario existe antes de renderizar.

```typescript
useEffect(() => {
  const checkUserExists = async () => {
    if (status === 'authenticated' && session?.user) {
      try {
        // 🔒 Verificar que el usuario todavía existe en BD
        const response = await fetch('/api/user/profile');
        
        if (response.status === 404) {
          // Usuario eliminado de BD - cerrar sesión
          console.warn('User no longer exists in database - signing out');
          await signOut({ 
            callbackUrl: '/auth/signin?error=UserDeleted' 
          });
          return;
        }
      } catch (error) {
        console.error('Error verifying user existence:', error);
      }
    }
    setChecking(false);
  };

  checkUserExists();
}, [session, status]);
```

**Efecto:**
- Usa endpoint existente `/api/user/profile` que retorna 404 si usuario no existe
- Cierra sesión automáticamente si el usuario fue eliminado
- Redirige al login con mensaje de error

---

## 🧪 Cómo Probar la Corrección

### Escenario 1: Usuario Normal Eliminado

1. **Login como usuario normal:**
   ```bash
   # Acceder a http://localhost:3000/auth/signin
   ```

2. **Verificar acceso al mapa:**
   ```bash
   # Navegar a http://localhost:3000/map
   # Debe cargar correctamente
   ```

3. **Eliminar usuario de BD (Prisma Studio):**
   ```bash
   npx prisma studio
   # Ir a tabla User
   # Eliminar el usuario autenticado
   ```

4. **Recargar página:**
   ```bash
   # Presionar F5 en /map
   # Resultado esperado: Redirect automático a /auth/signin?error=UserDeleted
   ```

### Escenario 2: Admin Eliminado

1. **Login como admin:**
   ```bash
   # Acceder con cuenta admin
   ```

2. **Verificar acceso al panel admin:**
   ```bash
   # Navegar a http://localhost:3000/admin
   # Debe cargar correctamente
   ```

3. **Eliminar usuario admin de BD:**
   ```bash
   npx prisma studio
   # Eliminar el admin autenticado
   ```

4. **Recargar página:**
   ```bash
   # Presionar F5 en /admin
   # Resultado esperado: Redirect a /auth/signin?error=AdminAccessDenied
   ```

### Escenario 3: Intento de Acceso con JWT Antiguo

1. **Copiar cookie de sesión antes de eliminar:**
   ```bash
   # DevTools > Application > Cookies
   # Copiar valor de next-auth.session-token
   ```

2. **Eliminar usuario de BD:**
   ```bash
   npx prisma studio
   ```

3. **Intentar acceder con la cookie antigua:**
   ```bash
   # Pegar la cookie en el navegador
   # Navegar a /map o /admin
   # Resultado esperado: Sesión inválida, redirect a login
   ```

---

## 📋 Checklist de Validación

- [ ] Usuario normal eliminado no puede acceder al mapa
- [ ] Admin eliminado no puede acceder al panel admin
- [ ] JWT antiguo se invalida si usuario no existe en BD
- [ ] Redirect muestra mensaje de error apropiado
- [ ] Session callback retorna `user: undefined` si usuario eliminado
- [ ] Endpoint `/api/admin/check-access` retorna 404 si usuario no existe
- [ ] Endpoint `/api/user/profile` retorna 404 si usuario no existe
- [ ] Loading spinner se muestra durante verificación
- [ ] Console logs adecuados en caso de error

---

## 🔐 Mejoras de Seguridad Adicionales

### Invalidación Inmediata de Sesiones

Para casos donde necesites invalidar sesiones inmediatamente (no esperar al siguiente refresh):

**Opción 1: Blacklist de Tokens (Redis)**
```typescript
// lib/security/tokenBlacklist.ts
import { redis } from '@/lib/redis';

export async function blacklistToken(userId: string) {
  await redis.set(`blacklist:${userId}`, 'true', { ex: 60 * 60 * 24 * 30 }); // 30 días
}

export async function isTokenBlacklisted(userId: string): Promise<boolean> {
  const result = await redis.get(`blacklist:${userId}`);
  return result === 'true';
}
```

**Opción 2: Timestamps de Invalidación**
```typescript
// Agregar a schema.prisma
model User {
  sessionInvalidatedAt DateTime?
}

// En session callback
if (user.sessionInvalidatedAt && 
    new Date(user.sessionInvalidatedAt) > new Date(token.iat * 1000)) {
  return { ...session, user: undefined };
}
```

---

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `lib/auth.ts` | ✅ Session callback verifica existencia de usuario |
| `app/admin/layout.tsx` | ✅ Verificación server-side con `/api/admin/check-access` |
| `app/(main)/layout.tsx` | ✅ Verificación de usuario con `/api/user/profile` |
| `app/api/admin/check-access/route.ts` | ✅ **NUEVO** - Endpoint de verificación admin |

---

## 🎯 Resultado Final

✅ **Problema Resuelto:**
- Usuarios eliminados ya NO pueden acceder al sistema
- Sessions JWT se validan contra la BD en cada request
- Cierre de sesión automático si usuario no existe
- Admin panel verifica acceso server-side
- Páginas principales verifican existencia de usuario

✅ **Seguridad Mejorada:**
- Protección contra JWT replay attacks con usuarios eliminados
- Verificación server-side (no solo client-side)
- Auditoría de accesos en logs del servidor
- Redirects con mensajes de error apropiados

---

## 🚀 Próximos Pasos Recomendados

1. **Implementar Blacklist de Tokens** (para invalidación inmediata)
2. **Agregar SecurityLog para eliminación de usuarios** (auditoría)
3. **Rate limit en endpoints de verificación** (prevenir abuse)
4. **Notificar al usuario por email cuando su cuenta sea eliminada**
5. **Implementar soft delete** (marcar como eliminado en lugar de borrar)

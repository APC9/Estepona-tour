/**
 * Decoradores/Wrappers para proteger API routes con RBAC
 * 
 * USO:
 * ```typescript
 * export const GET = withAuth(async (req, { user }) => {
 *   return NextResponse.json({ user });
 * });
 * 
 * export const POST = withPermission(Resource.POI, Action.CREATE, async (req, { user }) => {
 *   // crear POI
 * });
 * 
 * export const DELETE = withOwnership(Resource.VISIT, async (req, { user, params }) => {
 *   // borrar visita propia
 * });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  requireAdmin,
  requirePermission,
  requireOwnership,
  handleAuthError,
  Resource,
  Action,
  AuthenticatedUser,
} from '@/lib/security/rbac';

/**
 * Contexto enriquecido para handlers
 */
export interface AuthContext {
  user: AuthenticatedUser;
  params?: Record<string, string>;
}

/**
 * Tipo de handler protegido
 */
export type AuthHandler = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Wrapper: Requiere autenticación
 */
export function withAuth(handler: AuthHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();

      // Await params (Next.js 15+)
      const params = await context.params;

      return await handler(request, {
        user,
        params,
      });
    } catch (error) {
      const { error: message, status } = handleAuthError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wrapper: Requiere rol admin
 */
export function withAdmin(handler: AuthHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const user = await requireAdmin();

      // Await params (Next.js 15+)
      const params = await context.params;

      return await handler(request, {
        user,
        params,
      });
    } catch (error) {
      const { error: message, status } = handleAuthError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wrapper: Requiere permiso específico
 */
export function withPermission(
  resource: Resource,
  action: Action,
  handler: AuthHandler
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      await requirePermission(user.id, resource, action);

      // Await params (Next.js 15+)
      const params = await context.params;

      return await handler(request, {
        user,
        params,
      });
    } catch (error) {
      const { error: message, status } = handleAuthError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wrapper: Requiere ser propietario del recurso (anti-IDOR)
 * 
 * Extrae resourceId de:
 * 1. params.id (ruta dinámica)
 * 2. searchParams.id (query string)
 * 3. body.id (JSON body)
 */
export function withOwnership(resource: Resource, handler: AuthHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();

      // Await params (Next.js 15+)
      const params = await context.params;

      // Intentar extraer resourceId
      let resourceId: string | null = null;

      // 1. Desde params (ruta dinámica)
      if (params?.id) {
        resourceId = params.id;
      }

      // 2. Desde query string
      if (!resourceId) {
        const { searchParams } = new URL(request.url);
        resourceId = searchParams.get('id');
      }

      // 3. Desde body (solo POST/PUT/PATCH)
      if (!resourceId && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          resourceId = body.id;
        } catch {
          // Ignorar si no hay body
        }
      }

      if (!resourceId) {
        return NextResponse.json(
          { error: 'Resource ID requerido' },
          { status: 400 }
        );
      }

      // Verificar ownership
      await requireOwnership(user.id, resource, resourceId);

      return await handler(request, {
        user,
        params,
      });
    } catch (error) {
      const { error: message, status } = handleAuthError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Wrapper combinado: Requiere permiso Y ownership
 */
export function withPermissionAndOwnership(
  resource: Resource,
  action: Action,
  handler: AuthHandler
) {
  return async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      const user = await requireAuth();
      await requirePermission(user.id, resource, action);

      // Extraer resourceId
      let resourceId: string | null = null;

      if (context?.params?.id) {
        resourceId = context.params.id;
      }

      if (!resourceId) {
        const { searchParams } = new URL(request.url);
        resourceId = searchParams.get('id');
      }

      if (!resourceId && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        try {
          const body = await request.json();
          resourceId = body.id;
        } catch {
          // Ignorar
        }
      }

      if (resourceId) {
        await requireOwnership(user.id, resource, resourceId);
      }

      return await handler(request, {
        user,
        params: context?.params,
      });
    } catch (error) {
      const { error: message, status } = handleAuthError(error);
      return NextResponse.json({ error: message }, { status });
    }
  };
}

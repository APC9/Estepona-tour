/**
 * 🔒 SECURITY - Role-Based Access Control (RBAC)
 * 
 * Sistema centralizado de autorización con roles y permisos
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isAdmin: boolean;
  tier: string;
  stripeCustomerId: string | null;
}

/**
 * Verifica que el usuario está autenticado
 * @throws Error si no está autenticado
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isAdmin: true,
      tier: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
}

/**
 * Verifica que el usuario es administrador
 * @throws Error si no es admin
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (!user.isAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Verifica que el usuario tiene un rol específico
 */
export async function requireRole(role: Role): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== role && user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Verifica que el usuario es el propietario del recurso o es admin
 */
export async function requireOwnerOrAdmin(resourceUserId: string): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const isOwner = user.id === resourceUserId;
  const isAdmin = user.isAdmin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (!isOwner && !isAdmin) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Verifica que el usuario tiene tier premium
 */
export async function requirePremium(): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.tier === 'FREE') {
    throw new Error('PREMIUM_REQUIRED');
  }

  return user;
}

/**
 * Helper para manejar errores de autorización en API routes
 */
export function handleAuthError(error: unknown): { error: string; status: number } {
  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return { error: 'Unauthorized', status: 401 };
      case 'USER_NOT_FOUND':
        return { error: 'User not found', status: 404 };
      case 'FORBIDDEN':
        return { error: 'Forbidden', status: 403 };
      case 'PREMIUM_REQUIRED':
        return { error: 'Premium subscription required', status: 403 };
      default:
        return { error: 'Internal server error', status: 500 };
    }
  }
  return { error: 'Internal server error', status: 500 };
}

/**
 * Verificar si el email es del admin configurado
 * (Fallback temporal hasta que se migren todos los admins a BD)
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

// ============================================================================
// RBAC AVANZADO - Permisos Granulares
// ============================================================================

/**
 * Recursos protegidos del sistema
 */
export enum Resource {
  POI = 'POI',
  VISIT = 'VISIT',
  BADGE = 'BADGE',
  USER = 'USER',
  NFC = 'NFC',
  ANALYTICS = 'ANALYTICS',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

/**
 * Acciones sobre recursos
 */
export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LIST = 'LIST',
  MANAGE = 'MANAGE',
}

/**
 * Matriz de permisos por tier
 */
const TIER_PERMISSIONS: Record<string, Partial<Record<Resource, Action[]>>> = {
  FREE: {
    [Resource.POI]: [Action.READ, Action.LIST],
    [Resource.VISIT]: [Action.CREATE, Action.READ],
    [Resource.BADGE]: [Action.READ],
    [Resource.USER]: [Action.READ, Action.UPDATE],
    [Resource.SUBSCRIPTION]: [Action.READ],
  },
  PREMIUM: {
    [Resource.POI]: [Action.READ, Action.LIST],
    [Resource.VISIT]: [Action.CREATE, Action.READ, Action.LIST],
    [Resource.BADGE]: [Action.READ, Action.LIST],
    [Resource.USER]: [Action.READ, Action.UPDATE],
    [Resource.NFC]: [Action.READ],
    [Resource.SUBSCRIPTION]: [Action.READ, Action.UPDATE],
  },
  BUSINESS: {
    [Resource.POI]: [Action.READ, Action.LIST],
    [Resource.VISIT]: [Action.CREATE, Action.READ, Action.LIST],
    [Resource.BADGE]: [Action.READ, Action.LIST],
    [Resource.USER]: [Action.READ, Action.UPDATE],
    [Resource.NFC]: [Action.READ, Action.LIST],
    [Resource.ANALYTICS]: [Action.READ],
    [Resource.SUBSCRIPTION]: [Action.READ, Action.UPDATE],
  },
};

/**
 * Cache de permisos (en memoria, 5 min TTL)
 */
const permissionCache = new Map<string, { permissions: Set<string>; expiresAt: number }>();
const PERMISSION_CACHE_TTL = 5 * 60 * 1000;

/**
 * Verifica si un tier tiene permiso para una acción
 */
export function hasPermission(
  tier: string,
  resource: Resource,
  action: Action
): boolean {
  const permissions = TIER_PERMISSIONS[tier.toUpperCase()];
  if (!permissions) return false;

  const actions = permissions[resource];
  if (!actions) return false;

  return actions.includes(action);
}

/**
 * Verifica permiso para un usuario autenticado
 */
export async function checkPermission(
  userId: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  // Verificar cache
  const cacheKey = `${userId}:${resource}:${action}`;
  const cached = permissionCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions.has(`${resource}:${action}`);
  }

  // Obtener usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, isAdmin: true, role: true },
  });

  if (!user) return false;

  // Admin tiene todos los permisos
  if (user.isAdmin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Verificar permisos por tier
  const hasAccess = hasPermission(user.tier, resource, action);

  // Guardar en cache
  const permissions = new Set<string>();
  if (hasAccess) {
    permissions.add(`${resource}:${action}`);
  }

  permissionCache.set(cacheKey, {
    permissions,
    expiresAt: Date.now() + PERMISSION_CACHE_TTL,
  });

  return hasAccess;
}

/**
 * Requiere permiso (lanza error si no tiene acceso)
 */
export async function requirePermission(
  userId: string,
  resource: Resource,
  action: Action
): Promise<void> {
  const hasAccess = await checkPermission(userId, resource, action);

  if (!hasAccess) {
    throw new Error('FORBIDDEN');
  }
}

/**
 * Verifica propiedad de un recurso (anti-IDOR)
 */
export async function checkOwnership(
  userId: string,
  resource: Resource,
  resourceId: string
): Promise<boolean> {
  switch (resource) {
    case Resource.VISIT:
      const visit = await prisma.visit.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      return visit?.userId === userId;

    case Resource.BADGE:
      // resourceId es el badgeId - verificamos que el usuario lo haya desbloqueado
      const badge = await prisma.userBadge.findFirst({
        where: {
          userId,
          badgeId: resourceId
        },
      });
      return !!badge;

    case Resource.USER:
      return resourceId === userId;

    case Resource.SUBSCRIPTION:
      // Las suscripciones están en el modelo User, no hay modelo separado
      // Verificamos que el resourceId sea el mismo userId
      return resourceId === userId;

    default:
      return false;
  }
}

/**
 * Requiere ser propietario (anti-IDOR)
 */
export async function requireOwnership(
  userId: string,
  resource: Resource,
  resourceId: string
): Promise<void> {
  const isOwner = await checkOwnership(userId, resource, resourceId);

  if (!isOwner) {
    // Verificar si es admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, role: true },
    });

    const isAdmin = user?.isAdmin || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      throw new Error('FORBIDDEN');
    }
  }
}

/**
 * Limpia el cache de permisos
 */
export function clearPermissionCache(userId?: string): void {
  if (userId) {
    // Borrar todas las entradas de un usuario
    for (const key of permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        permissionCache.delete(key);
      }
    }
  } else {
    permissionCache.clear();
  }
}

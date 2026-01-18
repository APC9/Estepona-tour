/**
 * 🔒 SECURITY - Rate Limiting con Redis
 * 
 * Previene:
 * - Spam de escaneos
 * - Brute force attacks
 * - Resource exhaustion
 * - Double-spending de puntos
 */

import { Redis } from '@upstash/redis';

// Inicializar cliente Redis desde variables de entorno
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limit por usuario y POI específico
 * Previene escaneo múltiple del mismo POI en corto período
 * 
 * @param userId - ID del usuario
 * @param poiId - ID del POI
 * @param limitPerWindow - Número máximo de escaneos permitidos (default: 1)
 * @param windowSeconds - Ventana de tiempo en segundos (default: 24 horas)
 */
export async function rateLimitScan(
  userId: string,
  poiId: string,
  limitPerWindow: number = 1,
  windowSeconds: number = 24 * 60 * 60 // 24 horas
): Promise<RateLimitResult> {
  const key = `ratelimit:scan:${userId}:${poiId}`;

  try {
    // Incrementar contador
    const count = await redis.incr(key);

    // Si es la primera vez, setear expiración
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Obtener tiempo restante
    const ttl = await redis.ttl(key);
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success: count <= limitPerWindow,
      limit: limitPerWindow,
      remaining: Math.max(0, limitPerWindow - count),
      reset,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // En caso de error de Redis, permitir request (fail-open)
    // En producción, considerar fail-closed
    return {
      success: true,
      limit: limitPerWindow,
      remaining: limitPerWindow - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Rate limit global por usuario
 * Previene spam general de requests
 * 
 * @param userId - ID del usuario
 * @param limit - Número máximo de requests permitidos
 * @param windowSeconds - Ventana de tiempo en segundos
 */
export async function rateLimitUser(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:user:${userId}`;

  try {
    // Usar pipeline para operaciones atómicas
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();
    const count = results[0] as number;

    const ttl = await redis.ttl(key);
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Rate limit por IP address
 * Previene ataques desde la misma IP
 */
export async function rateLimitIP(
  ipAddress: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const key = `ratelimit:ip:${ipAddress}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Rate limit para acciones costosas (ej: creación de usuarios, pagos)
 */
export async function rateLimitExpensive(
  identifier: string,
  action: string,
  limit: number = 3,
  windowSeconds: number = 3600 // 1 hora
): Promise<RateLimitResult> {
  const key = `ratelimit:expensive:${action}:${identifier}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Limpiar manualmente un rate limit (ej: para testing o resolución de problemas)
 */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error clearing rate limit:', error);
  }
}

/**
 * Banear temporalmente un usuario o IP
 */
export async function banUser(
  identifier: string,
  durationSeconds: number = 3600,
  reason?: string
): Promise<void> {
  const key = `ban:${identifier}`;

  try {
    await redis.set(
      key,
      JSON.stringify({
        bannedAt: Date.now(),
        reason: reason || 'Security violation',
      }),
      { ex: durationSeconds }
    );
  } catch (error) {
    console.error('Error banning user:', error);
  }
}

/**
 * Verificar si un usuario o IP está baneado
 */
export async function isBanned(identifier: string): Promise<{
  banned: boolean;
  reason?: string;
  bannedAt?: number;
}> {
  const key = `ban:${identifier}`;

  try {
    const data = await redis.get(key);

    if (!data) {
      return { banned: false };
    }

    const banInfo = JSON.parse(data as string);
    return {
      banned: true,
      reason: banInfo.reason,
      bannedAt: banInfo.bannedAt,
    };
  } catch (error) {
    console.error('Error checking ban status:', error);
    return { banned: false };
  }
}

/**
 * Helper: Generar headers HTTP de rate limit
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
  };
}

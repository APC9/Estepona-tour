/**
 * EJEMPLO: API Route con TODAS las capas de seguridad
 * 
 * Este endpoint demuestra cómo usar:
 * - RBAC con decoradores
 * - Anti-cheat gamification
 * - Session validation (via middleware)
 * - Anti-spoofing GPS + NFC
 * - Rate limiting
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/api-decorators';
import { Resource, Action, requirePermission } from '@/lib/security/rbac';
import { awardXP } from '@/lib/security/gamification-guard';
import { validatePOIVisit } from '@/lib/security/poi-validation';
import { z } from 'zod';

/**
 * Schema de validación
 */
const SecureVisitSchema = z.object({
  poiId: z.string().cuid(),
  nfcUid: z.string().min(1),
  challengeNonce: z.string().min(1),
  challengeResponse: z.string().min(1),
  deviceFingerprint: z.string().min(1),
  gpsSamples: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number(),
      altitude: z.number().nullable(),
      timestamp: z.number(),
    })
  ).min(3),
});

/**
 * POST /api/secure/visit
 * 
 * Endpoint ULTRA-SEGURO para registrar visitas a POIs
 * 
 * CAPAS DE SEGURIDAD:
 * 1. Middleware: Session fingerprinting + anomaly detection
 * 2. Decorador: Autenticación con withAuth
 * 3. RBAC: Permiso CREATE en recurso VISIT
 * 4. Schema validation: Zod
 * 5. Anti-spoofing: GPS + NFC + Challenge-response
 * 6. Anti-cheat: Rate limiting + idempotency + impossible journeys
 * 7. Audit trail: Logs completos
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // 1. Verificar permiso RBAC
    await requirePermission(user.id, Resource.VISIT, Action.CREATE);

    // 2. Parsear y validar body
    const body = await request.json();
    const validation = SecureVisitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 3. Extraer IP y User-Agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Crear objeto challenge desde el nonce recibido
    const challenge = {
      challengeId: `${data.poiId}-${data.challengeNonce}`,
      nonce: data.challengeNonce,
      timestamp: Date.now(),
      expiresAt: Date.now() + 60000, // 1 minuto
    };

    // Crear deviceInfo
    const deviceInfo = {
      userAgent,
      ip,
      language: request.headers.get('accept-language')?.split(',')[0] || 'unknown',
      timezone: 'unknown',
      cookiesEnabled: true,
    };

    // 4. Validar POI visit con anti-spoofing
    const poiValidation = await validatePOIVisit({
      userId: user.id,
      poiId: data.poiId,
      nfcUid: data.nfcUid,
      challenge,
      gpsSamples: data.gpsSamples,
      deviceInfo,
      clientFingerprint: data.deviceFingerprint,
    });

    if (!poiValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Validación fallida',
          reason: poiValidation.reason,
          flags: poiValidation.flags,
        },
        { status: 403 }
      );
    }

    // 5. Generar idempotency key único
    const idempotencyKey = `visit:${user.id}:${data.poiId}:${Date.now()}:${data.challengeNonce}`;

    // 6. Otorgar XP con anti-cheat
    const xpResult = await awardXP({
      userId: user.id,
      actionType: 'VISIT_POI',
      poiId: data.poiId,
      idempotencyKey,
      coordinates: {
        latitude: data.gpsSamples[0].latitude,
        longitude: data.gpsSamples[0].longitude,
      },
      metadata: {
        nfcUid: data.nfcUid,
        confidence: poiValidation.confidence,
        flags: poiValidation.flags,
      },
    });

    // 7. Responder con éxito
    return NextResponse.json({
      success: true,
      message: '¡Visita registrada exitosamente!',
      xpAwarded: xpResult.xpAwarded,
      totalXP: xpResult.newTotal,
      confidence: poiValidation.confidence,
      securityFlags: poiValidation.flags,
    });
  } catch (error) {
    console.error('Secure visit error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/secure/visit
 * 
 * Obtiene el historial de visitas del usuario autenticado
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Verificar permiso
    await requirePermission(user.id, Resource.VISIT, Action.LIST);

    // Obtener query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Consultar visitas con gamification logs
    const visits = await prisma.visit.findMany({
      where: { userId: user.id },
      include: {
        poi: {
          select: {
            id: true,
            category: true,
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.visit.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      visits,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json(
      { error: 'Error al obtener visitas' },
      { status: 500 }
    );
  }
});

import { prisma } from '@/lib/prisma';

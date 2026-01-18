import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  validatePOIVisit,
  recordSuccessfulVisit,
  VisitValidationRequest,
} from '@/lib/security/poi-validation';
import { extractDeviceInfoFromHeaders } from '@/lib/security/device-fingerprint';
import { z } from 'zod';

// Schema de validación con Zod
const GPSCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  altitude: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  timestamp: z.number(),
});

const VisitRequestSchema = z.object({
  poiId: z.string().cuid(),
  nfcUid: z.string().min(1),
  challenge: z.object({
    challengeId: z.string().uuid(),
    nonce: z.string().length(64),
    timestamp: z.number(),
    expiresAt: z.number(),
  }),
  gpsSamples: z.array(GPSCoordinateSchema).min(3).max(10),
  clientFingerprint: z.string().min(1),
  deviceInfo: z.object({
    screenResolution: z.string().optional(),
    timezone: z.string(),
    language: z.string(),
    platform: z.string().optional(),
    vendor: z.string().optional(),
    cookiesEnabled: z.boolean(),
    doNotTrack: z.string().optional(),
  }),
});

/**
 * POST /api/poi/validate-visit
 * 
 * Valida y registra una visita a un POI
 * Requiere challenge previo generado con /api/poi/challenge
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Parsear y validar body
    const body = await request.json();
    const validationResult = VisitRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 3. Extraer información del dispositivo desde headers
    const serverDeviceInfo = extractDeviceInfoFromHeaders(request.headers);

    // Obtener IP del usuario
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 4. Preparar request de validación
    const visitRequest: VisitValidationRequest = {
      userId: session.user.id,
      poiId: data.poiId,
      nfcUid: data.nfcUid,
      challenge: data.challenge,
      gpsSamples: data.gpsSamples,
      deviceInfo: {
        ...data.deviceInfo,
        ...serverDeviceInfo,
        userAgent: serverDeviceInfo.userAgent || 'unknown',
        ip,
      },
      clientFingerprint: data.clientFingerprint,
    };

    // 5. Validar visita (anti-spoofing completo)
    const validation = await validatePOIVisit(visitRequest);

    // 6. Si la validación falla, retornar error
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.reason,
          confidence: validation.confidence,
          flags: validation.flags,
          auditLogId: validation.auditLogId,
        },
        { status: 403 }
      );
    }

    // 7. Registrar visita exitosa
    const lastSample = data.gpsSamples[data.gpsSamples.length - 1];
    const visit = await recordSuccessfulVisit(
      session.user.id,
      data.poiId,
      validation.auditLogId!,
      lastSample
    );

    // 8. Retornar éxito
    return NextResponse.json({
      success: true,
      visit: {
        id: visit.id,
        pointsEarned: visit.pointsEarned,
        xpEarned: visit.xpEarned,
        scannedAt: visit.scannedAt,
      },
      validation: {
        confidence: validation.confidence,
        flags: validation.flags,
        auditLogId: validation.auditLogId,
      },
    });
  } catch (error) {
    console.error('Error validating visit:', error);
    return NextResponse.json(
      { error: 'Error al validar visita' },
      { status: 500 }
    );
  }
}

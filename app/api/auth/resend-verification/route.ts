import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * Endpoint para reenviar el código de verificación por email
 * POST /api/auth/resend-verification
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validar email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el email existe y no está verificado
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    // Por seguridad, siempre retornamos éxito aunque el email no exista
    // Esto previene que alguien use este endpoint para verificar si un email está registrado
    if (!user) {
      return NextResponse.json(
        { message: 'Si el email existe, se enviará un código de verificación' },
        { status: 200 }
      );
    }

    // Si ya está verificado, no enviamos nuevo código
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Este email ya está verificado' },
        { status: 400 }
      );
    }

    // Verificar rate limiting: máximo 3 intentos en 1 hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.verificationToken.count({
      where: {
        identifier: user.email,
        expires: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentTokens >= 3) {
      return NextResponse.json(
        { error: 'Has excedido el límite de intentos. Intenta de nuevo en 1 hora' },
        { status: 429 }
      );
    }

    // Eliminar tokens antiguos de este email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: user.email,
      },
    });

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar token en BD
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    // Construir URL de verificación
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const callbackUrl = encodeURIComponent('/map');
    const url = `${baseUrl}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(
      user.email
    )}&callbackUrl=${callbackUrl}`;

    // Enviar email
    await sendVerificationEmail({
      email: user.email,
      token,
      url,
    });

    return NextResponse.json(
      { message: 'Código de verificación enviado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al reenviar código:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código de verificación' },
      { status: 500 }
    );
  }
}

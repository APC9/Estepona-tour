import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/subscription
 * Verifica el estado de la suscripción del usuario
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        tier: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        isSubscriptionActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si la suscripción está activa
    const now = new Date();
    let isActive = user.isSubscriptionActive;

    // Si el tier es FREE, siempre está activo
    if (user.tier === 'FREE') {
      isActive = true;
    }
    // Si el tier es PREMIUM o FAMILY, verificar estado
    else if (user.tier === 'PREMIUM' || user.tier === 'FAMILY') {
      // Si isSubscriptionActive es true, confiar en ese campo
      if (user.isSubscriptionActive) {
        isActive = true;

        // Solo verificar fecha de expiración si existe
        if (user.subscriptionEnd) {
          isActive = user.subscriptionEnd > now;

          // Si ha expirado, actualizar el estado en la BD
          if (!isActive) {
            await prisma.user.update({
              where: { email: session.user.email },
              data: {
                isSubscriptionActive: false,
                tier: 'FREE', // Volver a FREE cuando expira
              },
            });
          }
        }
      } else {
        // Si isSubscriptionActive es false, verificar por fecha
        if (user.subscriptionEnd && user.subscriptionEnd > now) {
          // La suscripción debería estar activa, actualizar
          isActive = true;
          await prisma.user.update({
            where: { email: session.user.email },
            data: { isSubscriptionActive: true },
          });
        } else {
          isActive = false;
        }
      }
    }

    return NextResponse.json({
      isActive,
      tier: isActive ? user.tier : 'FREE',
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      daysRemaining: user.subscriptionEnd
        ? Math.max(0, Math.ceil((user.subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null,
    });
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

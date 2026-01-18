import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/[id]/subscription
 * Extender o modificar la suscripción de un usuario
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario es administrador
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Aquí deberías tener un campo isAdmin o similar en tu modelo User
    // Por ahora, asumimos que todos los usuarios autenticados pueden hacer esto
    // En producción, deberías verificar el rol

    const { extendDays } = await req.json();

    if (!extendDays || typeof extendDays !== 'number') {
      return NextResponse.json(
        { error: 'Días de extensión inválidos' },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular nueva fecha de expiración
    const now = new Date();
    let newSubscriptionEnd: Date;

    if (user.subscriptionEnd && user.subscriptionEnd > now) {
      // Si hay suscripción activa, extender desde la fecha actual de expiración
      newSubscriptionEnd = new Date(user.subscriptionEnd);
      newSubscriptionEnd.setDate(newSubscriptionEnd.getDate() + extendDays);
    } else {
      // Si no hay suscripción activa, empezar desde ahora
      newSubscriptionEnd = new Date(now);
      newSubscriptionEnd.setDate(newSubscriptionEnd.getDate() + extendDays);
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        subscriptionEnd: newSubscriptionEnd,
        subscriptionStart: user.subscriptionStart || now,
        isSubscriptionActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Suscripción extendida hasta ${newSubscriptionEnd.toLocaleDateString()}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error extendiendo suscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

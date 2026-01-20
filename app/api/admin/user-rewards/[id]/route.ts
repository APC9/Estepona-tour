import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/user-rewards/[id]
 * Actualiza el estado de un premio
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true },
    });

    if (!user?.isAdmin || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { status, trackingNumber, shippingAddress } = body;

    // Validar estado
    const validStatuses = ['PENDING', 'APPROVED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // Actualizar timestamps según el estado
      if (status === 'APPROVED' && !updateData.approvedAt) {
        updateData.approvedAt = new Date();
      } else if (status === 'SHIPPED' && !updateData.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (status === 'DELIVERED' && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber || null;
    }

    if (shippingAddress !== undefined) {
      updateData.shippingAddress = shippingAddress || null;
    }

    // Actualizar premio
    const reward = await prisma.userReward.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Enviar email al usuario notificando el cambio de estado

    return NextResponse.json({
      success: true,
      message: 'Premio actualizado exitosamente',
      reward,
    });
  } catch (error) {
    console.error('❌ Error al actualizar premio:', error);
    return NextResponse.json(
      { error: 'Error al actualizar premio' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { level, experiencePoints, totalPoints, tier } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        level: level !== undefined ? level : undefined,
        experiencePoints: experiencePoints !== undefined ? experiencePoints : undefined,
        totalPoints: totalPoints !== undefined ? totalPoints : undefined,
        tier: tier !== undefined ? tier : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Eliminar usuario y sus relaciones en cascada
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}

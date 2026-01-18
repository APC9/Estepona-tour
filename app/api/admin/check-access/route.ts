import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // 🔒 Verificar que el usuario existe en BD
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isAdmin: true,
        role: true,
      },
    });

    // Usuario no existe en BD
    if (!user) {
      return NextResponse.json({
        isAdmin: false,
        error: 'User not found in database'
      }, { status: 404 });
    }

    // Verificar si es admin
    const isAdmin = user.isAdmin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin access:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

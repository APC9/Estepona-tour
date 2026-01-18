import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si es admin
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generar nuevo NFC UID
    const newNfcUid = `NFC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Actualizar POI
    const poi = await prisma.pOI.update({
      where: { id },
      data: {
        nfcUid: newNfcUid,
      },
    });

    return NextResponse.json({ poi, newNfcUid });
  } catch (error) {
    console.error('Error regenerating NFC UID:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

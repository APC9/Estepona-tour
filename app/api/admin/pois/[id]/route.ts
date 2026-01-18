import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function GET(
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

    const poi = await prisma.pOI.findUnique({
      where: { id },
    });

    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    return NextResponse.json({ poi });
  } catch (error) {
    console.error('Error fetching POI:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.pOI.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting POI:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
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

    const body = await req.json();

    // Mapear el tipo del formulario al enum Category
    const categoryMap: Record<string, Category> = {
      'restaurant': Category.RESTAURANT,
      'monument': Category.MONUMENT,
      'beach': Category.BEACH,
      'museum': Category.MUSEUM,
      'park': Category.PARK,
      'shop': Category.SHOPPING,
      'shopping': Category.SHOPPING,
      'viewpoint': Category.VIEWPOINT,
      'historic': Category.HISTORIC,
      'culture': Category.CULTURE,
      'nature': Category.NATURE,
      'bar': Category.BAR,
      'nightclub': Category.NIGHTCLUB,
      'port': Category.PORT,
      'entertainment': Category.ENTERTAINMENT,
      'other': Category.MONUMENT,
    };

    const category = categoryMap[body.type?.toLowerCase()] || Category.MONUMENT;

    // Actualizar POI
    const poi = await prisma.pOI.update({
      where: { id },
      data: {
        nameEs: body.nameEs || body.name,
        nameEn: body.nameEn || body.nameEs || body.name,
        nameFr: body.nameFr || body.nameEs || body.name,
        nameDe: body.nameDe || body.nameEs || body.name,
        nameIt: body.nameIt || body.nameEs || body.name,
        descEs: body.descEs || body.description,
        descEn: body.descEn || body.descEs || body.description,
        descFr: body.descFr || body.descEs || body.description,
        descDe: body.descDe || body.descEs || body.description,
        descIt: body.descIt || body.descEs || body.description,
        lat: body.latitude,
        lng: body.longitude,
        category: category,
        address: body.address || '',
        images: body.imageUrl ? [body.imageUrl] : [],
        externalLink: body.externalLink || null,
        points: body.points || 10,
        xpReward: body.xpReward || 50,
        premiumOnly: body.premiumOnly !== undefined ? body.premiumOnly : false,
      },
    });

    return NextResponse.json({ poi });
  } catch (error) {
    console.error('Error updating POI:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

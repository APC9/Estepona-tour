import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si es admin
    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { nameEs, nameEn, nameFr, nameDe, nameIt, descEs, descEn, descFr, descDe, descIt, latitude, longitude, type, address, imageUrl, externalLink, points, xpReward } = body;

    // Validaciones
    if (!nameEs || !descEs || !latitude || !longitude || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
      'other': Category.MONUMENT, // default fallback
    };

    const category = categoryMap[type.toLowerCase()] || Category.MONUMENT;

    // Crear POI
    const poi = await prisma.pOI.create({
      data: {
        nameEs: nameEs,
        nameEn: nameEn || nameEs,
        nameFr: nameFr || nameEs,
        nameDe: nameDe || nameEs,
        nameIt: nameIt || nameEs,
        descEs: descEs,
        descEn: descEn || descEs,
        descFr: descFr || descEs,
        descDe: descDe || descEs,
        descIt: descIt || descEs,
        lat: latitude,
        lng: longitude,
        category,
        address: address || '',
        images: imageUrl ? [imageUrl] : [],
        externalLink: externalLink || null,
        points: points || 10,
        xpReward: xpReward || 50,
        nfcUid: `NFC-${Date.now()}`,
        slug: nameEs.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
      },
    });

    return NextResponse.json({ poi }, { status: 201 });
  } catch (error) {
    console.error('Error creating POI:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

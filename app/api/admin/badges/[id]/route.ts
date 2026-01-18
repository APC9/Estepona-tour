import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeRarity, Category } from '@prisma/client';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    const badge = await prisma.badge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Error fetching badge:', error);
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const {
      nameEs,
      nameEn,
      nameFr,
      nameDe,
      descriptionEs,
      descriptionEn,
      descriptionFr,
      descriptionDe,
      icon,
      category,
      rarity,
      requirement,
      pointsReward,
      xpReward,
      isActive,
    } = body;

    // Actualizar slug si cambia el nombre
    const slug = nameEs
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const badge = await prisma.badge.update({
      where: { id },
      data: {
        slug,
        nameEs,
        nameEn: nameEn || nameEs,
        nameFr: nameFr || nameEs,
        nameDe: nameDe || nameEs,
        descriptionEs,
        descriptionEn: descriptionEn || descriptionEs,
        descriptionFr: descriptionFr || descriptionEs,
        descriptionDe: descriptionDe || descriptionEs,
        icon: icon || '🏅',
        category: category ? (category as Category) : null,
        rarity: rarity as BadgeRarity,
        requirement,
        pointsReward: parseInt(pointsReward),
        xpReward: parseInt(xpReward),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ badge });
  } catch (error) {
    console.error('Error updating badge:', error);
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

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.badge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

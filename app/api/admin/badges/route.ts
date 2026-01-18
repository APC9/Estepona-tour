import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeRarity, Category } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const badges = await prisma.badge.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    } = body;

    // Generar slug
    const slug = nameEs
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    // Crear badge
    const badge = await prisma.badge.create({
      data: {
        slug,
        nameEs: nameEs || '',
        nameEn: nameEn || nameEs || '',
        nameFr: nameFr || nameEs || '',
        nameDe: nameDe || nameEs || '',
        descriptionEs: descriptionEs || '',
        descriptionEn: descriptionEn || descriptionEs || '',
        descriptionFr: descriptionFr || descriptionEs || '',
        descriptionDe: descriptionDe || descriptionEs || '',
        icon: icon || '🏅',
        category: category ? (category as Category) : null,
        rarity: (rarity as BadgeRarity) || BadgeRarity.COMMON,
        requirement: requirement || {},
        pointsReward: parseInt(pointsReward) || 0,
        xpReward: parseInt(xpReward) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

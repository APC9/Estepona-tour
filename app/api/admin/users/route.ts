import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/lib/security/rbac';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 🔒 SECURITY: Verificar que el usuario es administrador
    const admin = await requireAdmin();

    // Obtener parámetros de búsqueda y paginación
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    type WhereClause = {
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
      tier?: 'FREE' | 'PREMIUM' | 'FAMILY';
    };
    const where: WhereClause = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier && (tier === 'FREE' || tier === 'PREMIUM' || tier === 'FAMILY')) {
      where.tier = tier as 'FREE' | 'PREMIUM' | 'FAMILY';
    }

    // Obtener usuarios con estadísticas
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          tier: true,
          level: true,
          experiencePoints: true,
          totalPoints: true,
          language: true,
          createdAt: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          isSubscriptionActive: true,
          _count: {
            select: {
              visits: true,
              userBadges: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);

    // Manejar errores de autorización
    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

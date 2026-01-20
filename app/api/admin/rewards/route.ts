import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/rewards
 * Obtiene la configuración de todos los premios
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
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

    // Obtener todas las configuraciones de premios
    const rewardConfigs = await prisma.rewardConfig.findMany({
      orderBy: { pointsRequired: 'asc' },
    });

    return NextResponse.json({ rewardConfigs }, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener configuración de premios:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración de premios' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/rewards
 * Actualiza la configuración de premios
 */
export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
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
    const { rewardConfigs } = body;

    if (!Array.isArray(rewardConfigs)) {
      return NextResponse.json(
        { error: 'Formato de datos inválido' },
        { status: 400 }
      );
    }

    // Validar que los puntos sean positivos y únicos
    const pointsSet = new Set<number>();
    for (const config of rewardConfigs) {
      if (!config.tier || typeof config.pointsRequired !== 'number' || config.pointsRequired < 0) {
        return NextResponse.json(
          { error: 'Configuración inválida para ' + (config.tier || 'tier desconocido') },
          { status: 400 }
        );
      }
      if (pointsSet.has(config.pointsRequired)) {
        return NextResponse.json(
          { error: 'Los puntos requeridos deben ser únicos para cada tier' },
          { status: 400 }
        );
      }
      pointsSet.add(config.pointsRequired);
    }

    // Actualizar o crear cada configuración
    const updatedConfigs = await Promise.all(
      rewardConfigs.map(async (config) => {
        return await prisma.rewardConfig.upsert({
          where: { tier: config.tier },
          update: {
            pointsRequired: config.pointsRequired,
            name: config.name,
            size: config.size,
            description: config.description,
            emoji: config.emoji || '🏆',
            isActive: config.isActive !== undefined ? config.isActive : true,
          },
          create: {
            tier: config.tier,
            pointsRequired: config.pointsRequired,
            name: config.name,
            size: config.size,
            description: config.description,
            emoji: config.emoji || '🏆',
            isActive: config.isActive !== undefined ? config.isActive : true,
          },
        });
      })
    );

    return NextResponse.json(
      {
        message: 'Configuración de premios actualizada exitosamente',
        rewardConfigs: updatedConfigs
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al actualizar configuración de premios:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración de premios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rewards/initialize
 * Inicializa la configuración de premios con valores por defecto
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
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

    // Verificar si ya existe configuración
    const existingConfigs = await prisma.rewardConfig.count();
    if (existingConfigs > 0) {
      return NextResponse.json(
        { error: 'La configuración de premios ya existe' },
        { status: 400 }
      );
    }

    // Crear configuración por defecto
    const defaultConfigs = [
      {
        tier: 'BRONZE',
        pointsRequired: 500,
        name: 'Bronce',
        size: '10x15 cm',
        description: 'Postal sublimada en aluminio acabado mate',
        emoji: '🥉',
        isActive: true,
      },
      {
        tier: 'SILVER',
        pointsRequired: 1500,
        name: 'Plata',
        size: '15x20 cm',
        description: 'Postal sublimada en aluminio premium acabado brillante con marco',
        emoji: '🥈',
        isActive: true,
      },
      {
        tier: 'GOLD',
        pointsRequired: 3000,
        name: 'Oro',
        size: '20x30 cm',
        description: 'Postal sublimada en aluminio de lujo acabado espejo con marco premium y certificado',
        emoji: '🥇',
        isActive: true,
      },
    ];

    const createdConfigs = await Promise.all(
      defaultConfigs.map((config) =>
        prisma.rewardConfig.create({
          data: config as any,
        })
      )
    );

    return NextResponse.json(
      {
        message: 'Configuración de premios inicializada exitosamente',
        rewardConfigs: createdConfigs,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al inicializar configuración de premios:', error);
    return NextResponse.json(
      { error: 'Error al inicializar la configuración de premios' },
      { status: 500 }
    );
  }
}

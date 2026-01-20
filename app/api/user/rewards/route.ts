import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getRewardsConfig, getPointsRequiredForTier } from '@/lib/rewards';

/**
 * GET /api/user/rewards
 * Obtiene los premios disponibles y reclamados del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener usuario con sus puntos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        totalPoints: true,
        tier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener configuración dinámica de premios
    const REWARDS_CONFIG = await getRewardsConfig();

    // Verificar premios reclamados
    const claimedRewards = await prisma.userReward.findMany({
      where: { userId: user.id },
      select: {
        rewardTier: true,
        claimedAt: true,
        status: true,
      },
    });

    // Calcular premios disponibles
    const availableRewards = {
      bronze: {
        ...REWARDS_CONFIG.BRONZE,
        available: user.totalPoints >= REWARDS_CONFIG.BRONZE.pointsRequired,
        claimed: claimedRewards.some((r: any) => r.rewardTier === 'BRONZE'),
        currentPoints: user.totalPoints,
      },
      silver: {
        ...REWARDS_CONFIG.SILVER,
        available: user.totalPoints >= REWARDS_CONFIG.SILVER.pointsRequired,
        claimed: claimedRewards.some((r: any) => r.rewardTier === 'SILVER'),
        currentPoints: user.totalPoints,
      },
      gold: {
        ...REWARDS_CONFIG.GOLD,
        available: user.totalPoints >= REWARDS_CONFIG.GOLD.pointsRequired,
        claimed: claimedRewards.some((r: any) => r.rewardTier === 'GOLD'),
        currentPoints: user.totalPoints,
      },
    };

    return NextResponse.json({
      totalPoints: user.totalPoints,
      tier: user.tier,
      isPremium: user.tier === 'PREMIUM' || user.tier === 'FAMILY',
      rewards: availableRewards,
      claimedRewards,
    });
  } catch (error) {
    console.error('Error obteniendo premios:', error);
    return NextResponse.json(
      { error: 'Error al obtener premios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/rewards
 * Reclama un premio
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { rewardTier, photoUrl, userMessage } = body;

    // Validar tier del premio
    if (!['BRONZE', 'SILVER', 'GOLD'].includes(rewardTier)) {
      return NextResponse.json(
        { error: 'Tier de premio inválido' },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        totalPoints: true,
        tier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que es usuario Premium
    if (user.tier !== 'PREMIUM' && user.tier !== 'FAMILY') {
      return NextResponse.json(
        { error: 'Se requiere plan Premium para reclamar premios' },
        { status: 403 }
      );
    }

    // Verificar puntos suficientes
    const pointsRequired = await getPointsRequiredForTier(rewardTier as 'BRONZE' | 'SILVER' | 'GOLD');
    if (user.totalPoints < pointsRequired) {
      return NextResponse.json(
        {
          error: 'Puntos insuficientes',
          required: pointsRequired,
          current: user.totalPoints,
        },
        { status: 400 }
      );
    }

    // Verificar si ya reclamó este premio
    const existingClaim = await prisma.userReward.findFirst({
      where: {
        userId: user.id,
        rewardTier,
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Ya has reclamado este premio' },
        { status: 400 }
      );
    }

    // Crear reclamación del premio
    const reward = await prisma.userReward.create({
      data: {
        userId: user.id,
        rewardTier,
        photoUrl: photoUrl || null,
        userMessage: userMessage || null,
        status: 'PENDING',
      },
    });

    // Resetear puntos del usuario a 0
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPoints: 0,
      },
    });

    console.log(`✅ Usuario ${user.id} reclamó premio ${rewardTier}. Puntos reseteados: ${user.totalPoints} → 0`);

    // TODO: Enviar notificación por email al admin sobre la nueva reclamación
    // TODO: Enviar email de confirmación al usuario

    return NextResponse.json({
      success: true,
      message: 'Premio reclamado exitosamente',
      reward: {
        id: reward.id,
        tier: reward.rewardTier,
        claimedAt: reward.claimedAt,
        status: reward.status,
      },
      pointsReset: true,
      previousPoints: user.totalPoints,
      newPoints: 0,
    });
  } catch (error) {
    console.error('Error reclamando premio:', error);
    return NextResponse.json(
      { error: 'Error al reclamar premio' },
      { status: 500 }
    );
  }
}

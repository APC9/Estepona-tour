import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/security/rbac';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { tier } = await req.json();

    if (!tier || !['FREE', 'PREMIUM', 'FAMILY'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Obtener el usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tier: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lógica mejorada de asignación de tier:
    // 1. Si ya tiene el mismo tier, no hacer nada
    // 2. Si no tiene tier (null), permitir cualquier tier
    // 3. Si tiene FREE, permitir cambiar a PREMIUM/FAMILY
    // 4. Si tiene tier de pago, solo permitir FREE (downgrade)

    if (currentUser.tier === tier) {
      console.log(`✅ User ${user.id} already has tier ${tier}`);
      return NextResponse.json({
        success: true,
        tier,
        message: `User already has tier ${tier}`,
        noChange: true
      });
    }

    // Validar cambios de tier
    if (currentUser.tier &&
      currentUser.tier !== 'FREE' &&
      tier !== 'FREE' &&
      currentUser.tier !== tier) {
      return NextResponse.json(
        {
          error: 'Cannot change from one paid tier to another directly',
          currentTier: currentUser.tier,
          requestedTier: tier
        },
        { status: 400 }
      );
    }

    // Asignar el tier
    await prisma.user.update({
      where: { id: user.id },
      data: { tier },
    });

    console.log(`✅ Tier updated for user ${user.id} (${currentUser.email}): ${currentUser.tier || 'null'} → ${tier}`);

    return NextResponse.json({
      success: true,
      tier,
      previousTier: currentUser.tier,
      message: `Tier updated from ${currentUser.tier || 'null'} to ${tier}`
    });

  } catch (error) {
    console.error('Error assigning tier:', error);

    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    return NextResponse.json(
      { error: 'Failed to assign tier' },
      { status: 500 }
    );
  }
}
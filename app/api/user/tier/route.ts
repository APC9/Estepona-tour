import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Tier } from '@prisma/client';
import { verifyCheckoutSession } from '@/lib/security/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, duration = 30, stripeSessionId } = await req.json();

    if (!tier || !['FREE', 'PREMIUM', 'FAMILY'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // 🔒 SECURITY: Verificar pago con Stripe para upgrades a premium
    if (tier !== 'FREE') {
      if (!stripeSessionId) {
        return NextResponse.json(
          { error: 'Payment verification required for premium tiers' },
          { status: 400 }
        );
      }

      const paymentVerification = await verifyCheckoutSession(stripeSessionId);

      if (!paymentVerification.valid) {
        console.error('Payment verification failed:', paymentVerification.error);

        // Log security event
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          await prisma.securityLog.create({
            data: {
              userId: user.id,
              action: 'PAYMENT_VERIFICATION_FAILED',
              severity: 'HIGH',
              details: {
                tier,
                stripeSessionId,
                error: paymentVerification.error,
              },
              ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
              userAgent: req.headers.get('user-agent') || undefined,
            },
          });
        }

        return NextResponse.json(
          { error: 'Payment verification failed', details: paymentVerification.error },
          { status: 403 }
        );
      }

      // Verificar que el tier del pago coincide con el solicitado
      if (paymentVerification.tier?.toUpperCase() !== tier.toUpperCase()) {
        return NextResponse.json(
          { error: 'Tier mismatch between payment and request' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const subscriptionEnd = new Date(now);
    subscriptionEnd.setDate(subscriptionEnd.getDate() + duration);

    // Actualizar tier del usuario y establecer fechas de suscripción
    const updateData: any = {
      tier: tier as Tier,
    };

    // Si es un plan de pago (no FREE), establecer fechas de suscripción
    if (tier !== 'FREE') {
      updateData.subscriptionStart = now;
      updateData.subscriptionEnd = subscriptionEnd;
      updateData.isSubscriptionActive = true;

      // Guardar Stripe Customer ID si está disponible
      const paymentVerification = await verifyCheckoutSession(stripeSessionId!);
      if (paymentVerification.customerId) {
        updateData.stripeCustomerId = paymentVerification.customerId;
      }
    } else {
      // Si vuelve a FREE, limpiar las fechas
      updateData.subscriptionStart = null;
      updateData.subscriptionEnd = null;
      updateData.isSubscriptionActive = false;
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Log successful tier change
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: 'TIER_CHANGED',
        severity: 'LOW',
        details: {
          previousTier: user.tier,
          newTier: tier,
          stripeSessionId: tier !== 'FREE' ? stripeSessionId : null,
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: req.headers.get('user-agent') || undefined,
      },
    });

    return NextResponse.json({
      user,
      success: true,
      message: tier !== 'FREE'
        ? `Suscripción activada hasta ${subscriptionEnd.toLocaleDateString()}`
        : 'Plan FREE activado'
    });
  } catch (error) {
    console.error('Error updating tier:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        tier: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        isSubscriptionActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar si la suscripción ha expirado
    const now = new Date();
    let actualTier = user.tier;

    if (user.tier !== 'FREE' && user.subscriptionEnd && user.subscriptionEnd < now) {
      actualTier = 'FREE';
    }

    return NextResponse.json({
      tier: actualTier,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      isActive: user.tier === 'FREE' || (user.subscriptionEnd ? user.subscriptionEnd > now : false),
    });
  } catch (error) {
    console.error('Error fetching tier:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

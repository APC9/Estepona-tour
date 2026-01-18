import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/rbac';
import { stripe } from '@/lib/stripe/config';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log(`🔍 Verifying session ${sessionId} for user ${user.id}`);

    // Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      console.log(`❌ Payment not completed for session ${sessionId}`);
      return NextResponse.json({
        error: 'Payment not completed',
        status: session.payment_status
      }, { status: 400 });
    }

    // Extraer información de la sesión
    const tier = session.metadata?.tier as 'PREMIUM' | 'FAMILY' | undefined;
    const userId = session.metadata?.userId;

    if (!tier || userId !== user.id) {
      console.log(`❌ Invalid session metadata. Tier: ${tier}, UserId: ${userId}, Expected: ${user.id}`);
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    console.log(`✅ Payment verified for user ${user.id}, tier: ${tier}`);

    // Calcular fechas de suscripción
    const subscription = session.subscription as any;
    const subscriptionStart = new Date();
    let subscriptionEnd: Date;

    if (subscription && subscription.current_period_end) {
      subscriptionEnd = new Date(subscription.current_period_end * 1000);
      console.log('📅 Using Stripe subscription dates');
    } else {
      subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      console.log('📅 Using fallback 30-day period');
    }

    console.log('📅 Subscription dates:', {
      start: subscriptionStart.toISOString(),
      end: subscriptionEnd.toISOString(),
    });

    // Actualizar usuario en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        tier,
        stripeCustomerId: session.customer as string,
        subscriptionStart,
        subscriptionEnd,
        isSubscriptionActive: true,
      },
    });

    console.log('✅ User updated successfully:', {
      userId: updatedUser.id,
      email: updatedUser.email,
      tier: updatedUser.tier,
      stripeCustomerId: updatedUser.stripeCustomerId,
      subscriptionStart: updatedUser.subscriptionStart,
      subscriptionEnd: updatedUser.subscriptionEnd,
      isSubscriptionActive: updatedUser.isSubscriptionActive,
    });

    // Log de seguridad
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_ACTIVATED',
        severity: 'LOW',
        details: {
          tier,
          sessionId: session.id,
          customerId: session.customer as string,
          verifiedManually: true,
        },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      tier: updatedUser.tier,
      subscriptionStart: updatedUser.subscriptionStart,
      subscriptionEnd: updatedUser.subscriptionEnd,
      isSubscriptionActive: updatedUser.isSubscriptionActive,
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

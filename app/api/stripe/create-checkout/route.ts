import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/security/rbac';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { tier } = await req.json();

    if (!tier || !['PREMIUM', 'FAMILY'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const plan = STRIPE_PLANS[tier as keyof typeof STRIPE_PLANS];

    if (!plan) {
      console.error('Plan not found in STRIPE_PLANS:', tier);
      return NextResponse.json(
        { error: `Plan ${tier} not configured. Please contact support.` },
        { status: 500 }
      );
    }

    if (!plan.priceId) {
      console.error('Missing priceId for plan:', tier, 'Plan config:', plan);
      return NextResponse.json(
        { error: 'Plan price not configured. Please check Stripe configuration.' },
        { status: 500 }
      );
    }

    // Verificar que Stripe esté configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Stripe not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Crear Checkout Session en Stripe (pago único)
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Pago único en lugar de suscripción
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
        tier,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    const authError = handleAuthError(error);
    if (authError.status !== 500) {
      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/config';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // 🔒 SECURITY: Verificar firma HMAC de Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);

    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 400 }
    );
  }

  console.log('✅ Webhook verified:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as 'PREMIUM' | 'FAMILY' | undefined;

  console.log('🔍 DEBUG - Session metadata:', {
    userId,
    tier,
    customer: session.customer,
    allMetadata: session.metadata,
  });

  if (!userId || !tier) {
    console.error('❌ Missing userId or tier in session metadata');
    return;
  }

  console.log(`💳 Checkout completed for user ${userId}, tier: ${tier}`);

  // Obtener la sesión completa con la suscripción
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['subscription'],
  });

  const subscription = fullSession.subscription as Stripe.Subscription | null;

  // Calcular fechas de suscripción
  const subscriptionStart = new Date();
  let subscriptionEnd: Date;

  if (subscription && subscription.current_period_end) {
    // Usar la fecha real del período de Stripe
    subscriptionEnd = new Date(subscription.current_period_end * 1000);
    console.log('📅 Using Stripe subscription dates');
  } else {
    // Fallback: 30 días desde ahora
    subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    console.log('📅 Using fallback 30-day period');
  }

  console.log('📅 Subscription dates:', {
    start: subscriptionStart.toISOString(),
    end: subscriptionEnd.toISOString(),
  });

  try {
    // Activar suscripción
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
      tier: updatedUser.tier,
      stripeCustomerId: updatedUser.stripeCustomerId,
      subscriptionStart: updatedUser.subscriptionStart,
      subscriptionEnd: updatedUser.subscriptionEnd,
      isSubscriptionActive: updatedUser.isSubscriptionActive,
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }

  // Log de seguridad
  await prisma.securityLog.create({
    data: {
      userId,
      action: 'SUBSCRIPTION_ACTIVATED',
      severity: 'LOW',
      details: {
        tier,
        sessionId: session.id,
        customerId: session.customer as string,
      },
      ipAddress: 'stripe-webhook',
      userAgent: 'Stripe',
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  const tier = subscription.metadata.tier as 'PREMIUM' | 'FAMILY' | undefined;

  if (!tier) {
    console.error('No tier in subscription metadata');
    return;
  }

  console.log(`🔄 Subscription updated for user ${user.id}: ${subscription.status}`);

  // Calcular fechas de suscripción
  const subscriptionStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : new Date();

  const subscriptionEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Actualizar estado de suscripción
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier,
      isSubscriptionActive: subscription.status === 'active',
      subscriptionStart,
      subscriptionEnd,
    },
  });

  await prisma.securityLog.create({
    data: {
      userId: user.id,
      action: 'SUBSCRIPTION_UPDATED',
      severity: 'LOW',
      details: {
        subscriptionId: subscription.id,
        status: subscription.status,
        tier,
      },
      ipAddress: 'stripe-webhook',
      userAgent: 'Stripe',
    },
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  console.log(`❌ Subscription cancelled for user ${user.id}`);

  // Downgrade a FREE
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier: 'FREE',
      isSubscriptionActive: false,
      subscriptionEnd: new Date(),
    },
  });

  await prisma.securityLog.create({
    data: {
      userId: user.id,
      action: 'SUBSCRIPTION_CANCELLED',
      severity: 'LOW',
      details: {
        subscriptionId: subscription.id,
        reason: subscription.cancellation_details?.reason,
      },
      ipAddress: 'stripe-webhook',
      userAgent: 'Stripe',
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  console.log(`✅ Payment succeeded for user ${user.id}`);

  // Si el pago está asociado a una suscripción, actualizar las fechas
  if (invoice.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const subscriptionStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : new Date();

      const subscriptionEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Actualizar fechas de suscripción tras pago exitoso
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStart,
          subscriptionEnd,
          isSubscriptionActive: subscription.status === 'active',
        },
      });

      console.log(`📅 Updated subscription dates for user ${user.id}: ${subscriptionStart.toISOString()} to ${subscriptionEnd.toISOString()}`);
    } catch (error) {
      console.error('Error updating subscription dates:', error);
    }
  }

  await prisma.securityLog.create({
    data: {
      userId: user.id,
      action: 'PAYMENT_SUCCEEDED',
      severity: 'LOW',
      details: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      },
      ipAddress: 'stripe-webhook',
      userAgent: 'Stripe',
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  console.log(`❌ Payment failed for user ${user.id}`);

  await prisma.securityLog.create({
    data: {
      userId: user.id,
      action: 'PAYMENT_FAILED',
      severity: 'HIGH',
      details: {
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        attemptCount: invoice.attempt_count,
      },
      ipAddress: 'stripe-webhook',
      userAgent: 'Stripe',
    },
  });

  // TODO: Enviar email notificando el fallo de pago
}

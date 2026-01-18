/**
 * 🔒 SECURITY - Stripe Payment Verification
 * 
 * Validación server-side de pagos para prevenir tier bypass
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Verifica que el pago fue exitoso para un checkout session
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  valid: boolean;
  customerId?: string;
  tier?: string;
  error?: string;
}> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verificar que el pago fue completado
    if (session.payment_status !== 'paid') {
      return {
        valid: false,
        error: 'Payment not completed',
      };
    }

    // Obtener el tier del metadata
    const tier = session.metadata?.tier || session.metadata?.plan;

    if (!tier) {
      return {
        valid: false,
        error: 'No tier specified in payment metadata',
      };
    }

    return {
      valid: true,
      customerId: session.customer as string,
      tier,
    };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica que un subscription está activo
 */
export async function verifySubscription(subscriptionId: string): Promise<{
  valid: boolean;
  tier?: string;
  error?: string;
}> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status !== 'active') {
      return {
        valid: false,
        error: `Subscription status: ${subscription.status}`,
      };
    }

    // Obtener el tier del metadata o price
    const tier = subscription.metadata?.tier ||
      subscription.items.data[0]?.price.metadata?.tier;

    if (!tier) {
      return {
        valid: false,
        error: 'No tier specified in subscription',
      };
    }

    return {
      valid: true,
      tier,
    };
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica que un customer tiene subscription activa
 */
export async function hasActiveSubscription(customerId: string): Promise<boolean> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    return subscriptions.data.length > 0;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Valida webhook signature (HMAC)
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Crea un checkout session para upgrades
 */
export async function createCheckoutSession(
  userId: string,
  tier: 'PREMIUM' | 'BUSINESS',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const priceIds = {
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
    BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID!,
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceIds[tier],
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tier,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}

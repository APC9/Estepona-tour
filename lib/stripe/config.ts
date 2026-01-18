/**
 * Stripe Server-side Configuration
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const STRIPE_PLANS = {
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    name: 'Premium',
    price: 4.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Acceso a POIs premium',
      'Estadísticas avanzadas',
      'Sin anuncios',
      'Soporte prioritario',
    ],
  },
  FAMILY: {
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    name: 'Family',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Todo lo de Premium',
      'Hasta 5 miembros',
      'Dashboard familiar',
      'Descuentos en tours',
    ],
  },
} as const;

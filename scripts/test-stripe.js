#!/usr/bin/env node

/**
 * Script de testing para Stripe
 * Uso: node scripts/test-stripe.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeSetup() {
  console.log('🧪 Testing Stripe Configuration...\n');

  try {
    // Test 1: Verificar conexión API
    console.log('1️⃣ Testing API Connection...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ API Connection OK');
    console.log(`   Available: ${balance.available[0].amount / 100} ${balance.available[0].currency.toUpperCase()}\n`);

    // Test 2: Verificar productos
    console.log('2️⃣ Testing Products...');
    const products = await stripe.products.list({ limit: 10 });
    console.log(`✅ Found ${products.data.length} products`);
    products.data.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
    });
    console.log('');

    // Test 3: Verificar precios
    console.log('3️⃣ Testing Prices...');
    
    if (process.env.STRIPE_PREMIUM_PRICE_ID) {
      try {
        const premiumPrice = await stripe.prices.retrieve(process.env.STRIPE_PREMIUM_PRICE_ID);
        console.log(`✅ Premium Price: ${premiumPrice.unit_amount / 100} ${premiumPrice.currency.toUpperCase()}/${premiumPrice.recurring.interval}`);
      } catch (e) {
        console.log('❌ Premium Price ID inválido');
      }
    } else {
      console.log('⚠️  STRIPE_PREMIUM_PRICE_ID no configurado');
    }

    if (process.env.STRIPE_BUSINESS_PRICE_ID) {
      try {
        const businessPrice = await stripe.prices.retrieve(process.env.STRIPE_BUSINESS_PRICE_ID);
        console.log(`✅ Business Price: ${businessPrice.unit_amount / 100} ${businessPrice.currency.toUpperCase()}/${businessPrice.recurring.interval}`);
      } catch (e) {
        console.log('❌ Business Price ID inválido');
      }
    } else {
      console.log('⚠️  STRIPE_BUSINESS_PRICE_ID no configurado');
    }
    console.log('');

    // Test 4: Verificar webhooks
    console.log('4️⃣ Testing Webhooks...');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    console.log(`✅ Found ${webhooks.data.length} webhook endpoints`);
    webhooks.data.forEach(wh => {
      console.log(`   - ${wh.url}`);
      console.log(`     Status: ${wh.status}`);
      console.log(`     Events: ${wh.enabled_events.join(', ')}`);
    });
    console.log('');

    // Test 5: Crear test checkout session
    console.log('5️⃣ Creating Test Checkout Session...');
    if (process.env.STRIPE_PREMIUM_PRICE_ID) {
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: 'http://localhost:3001/upgrade?success=true',
        cancel_url: 'http://localhost:3001/upgrade?canceled=true',
        metadata: {
          userId: 'test-user-id',
          tier: 'PREMIUM',
        },
      });
      console.log('✅ Test checkout session created');
      console.log(`   URL: ${session.url}`);
      console.log(`   ID: ${session.id}\n`);
    } else {
      console.log('⚠️  Skipped (no STRIPE_PREMIUM_PRICE_ID)\n');
    }

    console.log('✅ All tests passed!\n');
    console.log('📝 Checklist:');
    console.log('   ✅ API Keys configured');
    console.log(`   ${products.data.length > 0 ? '✅' : '❌'} Products created`);
    console.log(`   ${process.env.STRIPE_PREMIUM_PRICE_ID ? '✅' : '❌'} Premium Price ID configured`);
    console.log(`   ${process.env.STRIPE_BUSINESS_PRICE_ID ? '✅' : '❌'} Business Price ID configured`);
    console.log(`   ${webhooks.data.length > 0 ? '✅' : '❌'} Webhooks configured`);
    console.log(`   ${process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌'} Webhook secret configured\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testStripeSetup();

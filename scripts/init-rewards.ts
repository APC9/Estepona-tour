/**
 * Script para inicializar la configuración de premios en la base de datos
 * Ejecutar con: pnpm tsx scripts/init-rewards.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎁 Inicializando configuración de premios...');

  try {
    // Verificar si ya existe configuración
    const existingConfigs = await prisma.rewardConfig.count();

    if (existingConfigs > 0) {
      console.log('⚠️  La configuración de premios ya existe. Saltando inicialización.');
      console.log(`   Registros existentes: ${existingConfigs}`);
      return;
    }

    // Crear configuración por defecto
    const defaultConfigs = [
      {
        tier: 'BRONZE' as const,
        pointsRequired: 500,
        name: 'Bronce',
        size: '10x15 cm',
        description: 'Postal sublimada en aluminio acabado mate',
        emoji: '🥉',
        isActive: true,
      },
      {
        tier: 'SILVER' as const,
        pointsRequired: 1500,
        name: 'Plata',
        size: '15x20 cm',
        description: 'Postal sublimada en aluminio premium acabado brillante con marco',
        emoji: '🥈',
        isActive: true,
      },
      {
        tier: 'GOLD' as const,
        pointsRequired: 3000,
        name: 'Oro',
        size: '20x30 cm',
        description: 'Postal sublimada en aluminio de lujo acabado espejo con marco premium y certificado',
        emoji: '🥇',
        isActive: true,
      },
    ];

    console.log('📝 Creando configuraciones...');

    for (const config of defaultConfigs) {
      const created = await prisma.rewardConfig.create({
        data: config,
      });
      console.log(`   ✅ ${config.emoji} ${config.name}: ${config.pointsRequired} puntos`);
    }

    console.log('');
    console.log('✨ ¡Configuración de premios inicializada exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log('   - 🥉 Bronce: 500 puntos');
    console.log('   - 🥈 Plata: 1500 puntos');
    console.log('   - 🥇 Oro: 3000 puntos');
    console.log('');
    console.log('💡 Puedes editar estos valores en el panel de administración:');
    console.log('   http://localhost:3000/admin/rewards');

  } catch (error) {
    console.error('❌ Error al inicializar configuración de premios:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from './prisma';

/**
 * Obtiene la configuración de premios desde la base de datos
 * Si no existe, devuelve la configuración por defecto
 */
export async function getRewardsConfig() {
  try {
    const configs = await prisma.rewardConfig.findMany({
      where: { isActive: true },
      orderBy: { pointsRequired: 'asc' },
    });

    if (configs.length === 0) {
      // Devolver configuración por defecto si no existe en BD
      return {
        BRONZE: {
          name: 'Bronce',
          emoji: '🥉',
          pointsRequired: 500,
          size: '10x15 cm',
          description: 'Postal sublimada en aluminio acabado mate',
        },
        SILVER: {
          name: 'Plata',
          emoji: '🥈',
          pointsRequired: 1500,
          size: '15x20 cm',
          description: 'Postal sublimada en aluminio premium acabado brillante con marco',
        },
        GOLD: {
          name: 'Oro',
          emoji: '🥇',
          pointsRequired: 3000,
          size: '20x30 cm',
          description: 'Postal sublimada en aluminio de lujo acabado espejo con marco premium y certificado',
        },
      };
    }

    // Convertir array a objeto con keys por tier
    const configObject: Record<string, any> = {};
    configs.forEach((config) => {
      configObject[config.tier] = {
        name: config.name,
        emoji: config.emoji,
        pointsRequired: config.pointsRequired,
        size: config.size,
        description: config.description,
      };
    });

    return configObject;
  } catch (error) {
    console.error('❌ Error al obtener configuración de premios:', error);
    // Devolver configuración por defecto en caso de error
    return {
      BRONZE: {
        name: 'Bronce',
        emoji: '🥉',
        pointsRequired: 500,
        size: '10x15 cm',
        description: 'Postal sublimada en aluminio acabado mate',
      },
      SILVER: {
        name: 'Plata',
        emoji: '🥈',
        pointsRequired: 1500,
        size: '15x20 cm',
        description: 'Postal sublimada en aluminio premium acabado brillante con marco',
      },
      GOLD: {
        name: 'Oro',
        emoji: '🥇',
        pointsRequired: 3000,
        size: '20x30 cm',
        description: 'Postal sublimada en aluminio de lujo acabado espejo con marco premium y certificado',
      },
    };
  }
}

/**
 * Obtiene los puntos requeridos para un tier específico
 */
export async function getPointsRequiredForTier(tier: 'BRONZE' | 'SILVER' | 'GOLD'): Promise<number> {
  try {
    const config = await prisma.rewardConfig.findUnique({
      where: { tier },
      select: { pointsRequired: true, isActive: true },
    });

    if (!config || !config.isActive) {
      // Valores por defecto
      const defaults = { BRONZE: 500, SILVER: 1500, GOLD: 3000 };
      return defaults[tier];
    }

    return config.pointsRequired;
  } catch (error) {
    console.error(`❌ Error al obtener puntos para tier ${tier}:`, error);
    const defaults = { BRONZE: 500, SILVER: 1500, GOLD: 3000 };
    return defaults[tier];
  }
}

/**
 * Script de mantenimiento para el sistema de seguridad
 * 
 * Ejecutar diariamente con cron:
 * 0 2 * * * cd /app && node scripts/security-maintenance.js
 * 
 * Funciones:
 * - Limpiar sesiones expiradas
 * - Limpiar logs antiguos de gamificación (> 90 días)
 * - Limpiar IPs blacklist expiradas
 * - Limpiar challenges expirados
 * - Generar reporte de actividad sospechosa
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupExpiredSessions() {
  console.log('🧹 Limpiando sesiones expiradas...');

  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });

  console.log(`✅ ${result.count} sesiones expiradas eliminadas`);
  return result.count;
}

async function cleanupOldGamificationLogs() {
  console.log('🧹 Limpiando logs de gamificación antiguos...');

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await prisma.gamificationLog.deleteMany({
    where: {
      createdAt: {
        lt: ninetyDaysAgo,
      },
      suspiciousScore: {
        lt: 50, // Mantener logs sospechosos más tiempo
      },
    },
  });

  console.log(`✅ ${result.count} logs de gamificación eliminados`);
  return result.count;
}

async function cleanupExpiredIPBlacklist() {
  console.log('🧹 Limpiando IPs blacklist expiradas...');

  const result = await prisma.iPBlacklist.deleteMany({
    where: {
      permanent: false,
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`✅ ${result.count} IPs blacklist expiradas eliminadas`);
  return result.count;
}

async function cleanupExpiredChallenges() {
  console.log('🧹 Limpiando challenges expirados...');

  const result = await prisma.visitChallenge.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  console.log(`✅ ${result.count} challenges expirados eliminados`);
  return result.count;
}

async function cleanupOldAuditLogs() {
  console.log('🧹 Limpiando audit logs antiguos...');

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const result = await prisma.visitAuditLog.deleteMany({
    where: {
      timestamp: {
        lt: ninetyDaysAgo,
      },
      confidence: {
        gte: 75, // Solo eliminar logs con alta confianza
      },
    },
  });

  console.log(`✅ ${result.count} audit logs eliminados`);
  return result.count;
}

async function generateSuspiciousActivityReport() {
  console.log('📊 Generando reporte de actividad sospechosa...');

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Usuarios con más intentos de spoofing
  const suspiciousUsers = await prisma.visitAuditLog.groupBy({
    by: ['userId'],
    where: {
      timestamp: { gte: yesterday },
      confidence: { lt: 50 },
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 10,
  });

  console.log('\n🚨 Top 10 usuarios sospechosos (últimas 24h):');
  for (const user of suspiciousUsers) {
    console.log(`  - User ${user.userId}: ${user._count.userId} intentos de spoofing`);
  }

  // Sesiones marcadas como sospechosas
  const dangerousSessions = await prisma.sessionLog.count({
    where: {
      timestamp: { gte: yesterday },
      suspicious: true,
    },
  });

  console.log(`\n⚠️  ${dangerousSessions} sesiones marcadas como sospechosas`);

  // Intentos de cheat en gamificación
  const cheatingAttempts = await prisma.gamificationLog.count({
    where: {
      createdAt: { gte: yesterday },
      suspiciousScore: { gte: 70 },
    },
  });

  console.log(`\n🎮 ${cheatingAttempts} intentos de cheat bloqueados`);

  return {
    suspiciousUsers: suspiciousUsers.length,
    dangerousSessions,
    cheatingAttempts,
  };
}

async function main() {
  console.log('🚀 Iniciando mantenimiento de seguridad...\n');

  const startTime = Date.now();

  try {
    // Limpiezas
    const sessionsDeleted = await cleanupExpiredSessions();
    const logsDeleted = await cleanupOldGamificationLogs();
    const ipsDeleted = await cleanupExpiredIPBlacklist();
    const challengesDeleted = await cleanupExpiredChallenges();
    const auditLogsDeleted = await cleanupOldAuditLogs();

    // Reportes
    const report = await generateSuspiciousActivityReport();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✨ Mantenimiento completado exitosamente');
    console.log(`⏱️  Duración: ${duration}s`);
    console.log(`\n📈 Resumen:`);
    console.log(`  - Sesiones eliminadas: ${sessionsDeleted}`);
    console.log(`  - Logs gamificación eliminados: ${logsDeleted}`);
    console.log(`  - IPs blacklist eliminadas: ${ipsDeleted}`);
    console.log(`  - Challenges eliminados: ${challengesDeleted}`);
    console.log(`  - Audit logs eliminados: ${auditLogsDeleted}`);
    console.log(`\n🔍 Actividad sospechosa:`);
    console.log(`  - Usuarios sospechosos: ${report.suspiciousUsers}`);
    console.log(`  - Sesiones peligrosas: ${report.dangerousSessions}`);
    console.log(`  - Intentos de cheat: ${report.cheatingAttempts}`);

  } catch (error) {
    console.error('❌ Error durante mantenimiento:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

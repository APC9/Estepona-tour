'use client';

import { useState, useEffect } from 'react';

interface SecurityMetrics {
  // Anti-spoofing
  totalVisits: number;
  spoofingAttempts: number;
  avgConfidenceScore: number;
  topFlags: Record<string, number>;
  
  // Sessions
  activeSessions: number;
  suspiciousSessions: number;
  revokedToday: number;
  avgSuspiciousScore: number;
  
  // Gamification
  xpAwarded: number;
  cheatingAttempts: number;
  blockedActions: number;
}

/**
 * Dashboard de seguridad para administradores
 * 
 * Muestra métricas en tiempo real de:
 * - Intentos de spoofing
 * - Sesiones sospechosas
 * - Actividad de anti-cheat
 */
export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const loadMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/security/metrics?range=${timeRange}`);
      const data = await response.json();
      
      if (response.ok) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error al cargar métricas de seguridad</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de rango */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">
          🔒 Dashboard de Seguridad
        </h2>
        
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '24h' ? '24 horas' : range === '7d' ? '7 días' : '30 días'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Visitas */}
        <MetricCard
          title="Total Visitas"
          value={metrics.totalVisits.toLocaleString()}
          icon="📍"
          color="blue"
        />

        {/* Intentos de Spoofing */}
        <MetricCard
          title="Intentos de Spoofing"
          value={metrics.spoofingAttempts.toLocaleString()}
          subtitle={`${((metrics.spoofingAttempts / metrics.totalVisits) * 100).toFixed(1)}% del total`}
          icon="⚠️"
          color="red"
        />

        {/* Confidence Score Promedio */}
        <MetricCard
          title="Confidence Score"
          value={`${metrics.avgConfidenceScore.toFixed(1)}%`}
          icon="🎯"
          color="green"
        />

        {/* Sesiones Activas */}
        <MetricCard
          title="Sesiones Activas"
          value={metrics.activeSessions.toLocaleString()}
          icon="👥"
          color="purple"
        />

        {/* Sesiones Sospechosas */}
        <MetricCard
          title="Sesiones Sospechosas"
          value={metrics.suspiciousSessions.toLocaleString()}
          subtitle={`${((metrics.suspiciousSessions / metrics.activeSessions) * 100).toFixed(1)}% del total`}
          icon="🚨"
          color="orange"
        />

        {/* Sesiones Revocadas */}
        <MetricCard
          title="Revocadas Hoy"
          value={metrics.revokedToday.toLocaleString()}
          icon="🔒"
          color="red"
        />

        {/* XP Otorgado */}
        <MetricCard
          title="XP Otorgado"
          value={metrics.xpAwarded.toLocaleString()}
          icon="⭐"
          color="yellow"
        />

        {/* Cheating Attempts */}
        <MetricCard
          title="Intentos de Cheat"
          value={metrics.cheatingAttempts.toLocaleString()}
          icon="🎮"
          color="red"
        />
      </div>

      {/* Top Flags */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🚩 Top Flags de Seguridad
        </h3>
        
        <div className="space-y-3">
          {Object.entries(metrics.topFlags)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([flag, count]) => (
              <div key={flag} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚩</span>
                  <span className="font-semibold text-gray-700">{flag}</span>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Alerta de actividad sospechosa */}
      {(metrics.spoofingAttempts > 10 || metrics.cheatingAttempts > 5) && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🚨</span>
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Actividad Sospechosa Detectada
              </h3>
              <p className="text-red-800">
                Se han detectado múltiples intentos de spoofing o cheating en las últimas horas.
                Revisa los logs de seguridad para más detalles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'yellow';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      
      <h3 className="text-sm font-semibold opacity-80 mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      
      {subtitle && (
        <p className="text-xs opacity-70">{subtitle}</p>
      )}
    </div>
  );
}

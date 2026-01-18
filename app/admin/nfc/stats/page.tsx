'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Stats {
  totalScans: number;
  uniqueUsers: number;
  totalPointsAwarded: number;
  totalXPAwarded: number;
  topPOIs: Array<{
    id: string;
    nameEs: string;
    category: string;
    _count: { visits: number };
    totalPoints: number;
    totalXP: number;
  }>;
  recentScans: Array<{
    id: string;
    scannedAt: string;
    pointsEarned: number;
    xpEarned: number;
    user: {
      name: string | null;
      email: string;
    };
    poi: {
      nameEs: string;
      category: string;
    };
  }>;
  scansByCategory: Record<string, number>;
  scansByHour: Record<string, number>;
}

export default function NFCStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/nfc/stats?range=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Error cargando estadísticas</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Estadísticas de Escaneos NFC</h1>
          <p className="text-gray-600 mt-1">
            Análisis de visitas y escaneos de POIs
          </p>
        </div>
        <Link
          href="/admin/nfc"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition font-medium"
        >
          ← Volver
        </Link>
      </div>

      {/* Filtro de rango temporal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📅 Rango temporal
        </label>
        <div className="flex space-x-2">
          {[
            { value: 'all', label: 'Todo' },
            { value: 'today', label: 'Hoy' },
            { value: 'week', label: 'Esta semana' },
            { value: 'month', label: 'Este mes' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as 'all' | 'today' | 'week' | 'month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Escaneos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalScans}</p>
            </div>
            <div className="text-4xl">📱</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Únicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uniqueUsers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntos Otorgados</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPointsAwarded}</p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">XP Otorgado</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalXPAwarded}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Top POIs más visitados */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 POIs Más Visitados</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ranking
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  POI
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Visitas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Puntos
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  XP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topPOIs.map((poi, index) => (
                <tr key={poi.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{poi.nameEs}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{poi.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-900">{poi._count.visits}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-blue-600 font-medium">{poi.totalPoints}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-purple-600 font-medium">{poi.totalXP}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escaneos por categoría */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Escaneos por Categoría</h2>
        <div className="space-y-3">
          {Object.entries(stats.scansByCategory).map(([category, count]) => (
            <div key={category} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-700">{category}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-primary-500 h-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(count / stats.totalScans) * 100}%`,
                  }}
                >
                  <span className="text-xs font-bold text-white">{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escaneos recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Escaneos Recientes</h2>
        <div className="space-y-4">
          {stats.recentScans.map((scan) => (
            <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{scan.poi.nameEs}</p>
                <p className="text-sm text-gray-600">
                  {scan.user.name || scan.user.email} • {scan.poi.category}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(scan.scannedAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">+{scan.pointsEarned} pts</div>
                <div className="text-sm font-bold text-purple-600">+{scan.xpEarned} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

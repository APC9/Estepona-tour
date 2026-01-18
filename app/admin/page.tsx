'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SecurityDashboard from '@/components/admin/SecurityDashboard';

interface DashboardStats {
  totalPOIs: number;
  totalScans: number;
  totalUsers: number;
  activeToday: number;
  topPOIs: Array<{
    id: string;
    name: string;
    nameEs?: string;
    scans: number;
  }>;
  recentScans: Array<{
    id: string;
    poiName: string;
    userName: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {session?.user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Panel de control de Estepona Tours
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📍"
          label="Total POIs"
          value={stats?.totalPOIs || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon="📱"
          label="Total Escaneos"
          value={stats?.totalScans || 0}
          color="bg-green-500"
        />
        <StatCard
          icon="👥"
          label="Usuarios Totales"
          value={stats?.totalUsers || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon="🔥"
          label="Activos Hoy"
          value={stats?.activeToday || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Top POIs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          POIs Más Visitados
        </h2>
        <div className="space-y-3">
          {stats?.topPOIs?.map((poi, index) => (
            <div
              key={poi.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-400">
                  #{index + 1}
                </span>
                <span className="font-medium">{poi.nameEs || poi.name || 'Sin nombre'}</span>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {poi.scans} escaneos
              </span>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">
              No hay datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Escaneos Recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">⏱️</span>
          Escaneos Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  POI
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats?.recentScans?.map((scan) => (
                <tr key={scan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{scan.poiName}</td>
                  <td className="px-4 py-3 text-sm">{scan.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(scan.timestamp).toLocaleString('es-ES')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No hay escaneos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          icon="➕"
          title="Añadir POI"
          description="Crear nuevo punto de interés"
          href="/admin/pois/new"
          color="bg-green-500"
        />
        <QuickAction
          icon="📊"
          title="Ver Analytics"
          description="Análisis detallado de datos"
          href="/admin/analytics"
          color="bg-blue-500"
        />
        <QuickAction
          icon="📖"
          title="Guías"
          description="Instrucciones de uso"
          href="/admin/guide"
          color="bg-purple-500"
        />
      </div>

      {/* Security Dashboard */}
      <SecurityDashboard />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} text-white text-4xl p-4 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className={`${color} text-white text-3xl p-3 rounded-lg`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </a>
  );
}

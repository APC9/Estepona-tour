'use client';

import { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  visitsOverTime: Array<{ date: string; count: number }>;
  poiByType: Array<{ type: string; count: number }>;
  topUsers: Array<{ name: string; visits: number }>;
  totalStats: {
    totalVisits: number;
    uniqueUsers: number;
    avgVisitsPerUser: number;
    avgVisitsPerPOI: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch(`/api/admin/analytics?days=${timeRange}`);
        const analytics = await res.json();
        setData(analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const lineChartData = {
    labels: data?.visitsOverTime.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Visitas',
        data: data?.visitsOverTime.map((d) => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const barChartData = {
    labels: data?.poiByType.map((p) => p.type) || [],
    datasets: [
      {
        label: 'POIs por Tipo',
        data: data?.poiByType.map((p) => p.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const pieChartData = {
    labels: data?.topUsers.map((u) => u.name) || [],
    datasets: [
      {
        label: 'Visitas',
        data: data?.topUsers.map((u) => u.visits) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📈 Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de datos y estadísticas
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon="📱"
          label="Total Visitas"
          value={data?.totalStats.totalVisits || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon="👥"
          label="Usuarios Únicos"
          value={data?.totalStats.uniqueUsers || 0}
          color="bg-green-500"
        />
        <StatCard
          icon="📊"
          label="Promedio por Usuario"
          value={data?.totalStats.avgVisitsPerUser.toFixed(1) || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon="📍"
          label="Promedio por POI"
          value={data?.totalStats.avgVisitsPerPOI.toFixed(1) || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Gráfico de Línea - Visitas en el Tiempo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📉 Visitas en el Tiempo</h2>
        <Line data={lineChartData} options={{ responsive: true }} />
      </div>

      {/* Gráficos en Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* POIs por Tipo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📍 POIs por Tipo</h2>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>

        {/* Top Usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🏆 Top Usuarios</h2>
          <Pie data={pieChartData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Tabla de Top Usuarios */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">👥 Usuarios Más Activos</h2>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Visitas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.topUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-400">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 text-sm">{user.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {user.visits} visitas
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} text-white text-4xl p-4 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

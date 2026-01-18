'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface POI {
  id: string;
  nameEs?: string;
  name?: string | { es: string; en: string; fr: string; de: string };
  descEs?: string;
  description?: string | { es: string; en: string; fr: string; de: string };
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  category: string;
  type?: string;
  visitCount?: number;
  premiumOnly?: boolean;
}

export default function AdminPOIsPage() {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Helper para obtener texto de campos multiidioma
  const getText = (field: string | { es: string; en: string; fr: string; de: string } | undefined, fallback = ''): string => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    return field.es || field.en || field.fr || field.de || fallback;
  };

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      const res = await fetch('/api/pois');
      const data = await res.json();
      
      // Obtener conteo de visitas para cada POI
      const poisWithStats = await Promise.all(
        data.pois.map(async (poi: POI) => {
          const statsRes = await fetch(`/api/admin/poi-stats/${poi.id}`);
          const stats = await statsRes.json();
          return { ...poi, visitCount: stats.visitCount || 0 };
        })
      );
      
      setPois(poisWithStats);
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este POI?')) return;

    try {
      const res = await fetch(`/api/admin/pois/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPois(pois.filter((p) => p.id !== id));
        alert('POI eliminado exitosamente');
      } else {
        alert('Error al eliminar POI');
      }
    } catch (error) {
      console.error('Error deleting POI:', error);
      alert('Error al eliminar POI');
    }
  };

  const handleTogglePremium = async (id: string, currentValue: boolean) => {
    try {
      const poi = pois.find(p => p.id === id);
      if (!poi) return;

      const res = await fetch(`/api/admin/pois/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEs: poi.nameEs || getText(poi.name),
          descEs: poi.descEs || getText(poi.description),
          latitude: poi.lat || poi.latitude,
          longitude: poi.lng || poi.longitude,
          type: poi.category || poi.type,
          premiumOnly: !currentValue,
        }),
      });

      if (res.ok) {
        setPois(pois.map(p => 
          p.id === id ? { ...p, premiumOnly: !currentValue } : p
        ));
      } else {
        alert('Error al actualizar POI');
      }
    } catch (error) {
      console.error('Error toggling premium:', error);
      alert('Error al actualizar POI');
    }
  };

  const filteredPOIs = pois.filter((poi) => {
    if (filter === 'all') return true;
    return (poi.category || poi.type) === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const types = ['all', ...new Set(pois.map((p) => p.category || p.type || 'unknown'))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📍 Gestión de POIs y Comercios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los puntos de interés de la aplicación
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/pois/icons-guide"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-lg"
          >
            🎨 Guía de Insignias
          </Link>
          <Link
            href="/admin/pois/new"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold shadow-lg"
          >
            ➕ Añadir POI
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Filtrar por tipo:</span>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Total POIs</p>
          <p className="text-3xl font-bold text-primary-600">{pois.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Total Visitas</p>
          <p className="text-3xl font-bold text-green-600">
            {pois.reduce((sum, p) => sum + (p.visitCount || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Más Visitado</p>
          <p className="text-lg font-bold text-orange-600">
            {pois.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))[0]
              ?.nameEs || getText(pois[0]?.name, 'N/A')}
          </p>
        </div>
      </div>

      {/* Lista de POIs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Visitas
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPOIs.map((poi) => (
              <tr key={poi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{poi.nameEs || getText(poi.name, 'Sin nombre')}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {poi.descEs || getText(poi.description, 'Sin descripción')}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {poi.category || poi.type || 'unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePremium(poi.id, poi.premiumOnly || false)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      poi.premiumOnly
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={poi.premiumOnly ? 'Solo Premium - Click para cambiar a Gratuito' : 'Gratuito - Click para cambiar a Premium'}
                  >
                    {poi.premiumOnly ? '⭐ Premium' : '🆓 Gratuito'}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {(poi.lat || poi.latitude || 0).toFixed(4)}, {(poi.lng || poi.longitude || 0).toFixed(4)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {poi.visitCount || 0} 📱
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/pois/${poi.id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(poi.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPOIs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay POIs que coincidan con el filtro
          </div>
        )}
      </div>
    </div>
  );
}

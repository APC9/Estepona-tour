'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface POI {
  id: string;
  nfcUid: string;
  nameEs: string;
  category: string;
  points: number;
  xpReward: number;
  isActive: boolean;
  _count: {
    visits: number;
  };
}

export default function NFCManagementPage() {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      const res = await fetch('/api/admin/nfc');
      if (res.ok) {
        const data = await res.json();
        setPois(data.pois);
      }
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyNFCUrl = (nfcUid: string) => {
    const url = `${window.location.origin}/scan/${nfcUid}`;
    navigator.clipboard.writeText(url);
    alert('✅ URL copiada al portapapeles');
  };

  const regenerateNFCUid = async (poiId: string) => {
    if (!confirm('¿Regenerar código NFC? Esto invalidará el código anterior.')) return;

    try {
      const res = await fetch(`/api/admin/nfc/${poiId}/regenerate`, {
        method: 'POST',
      });
      
      if (res.ok) {
        alert('✅ Código NFC regenerado');
        fetchPOIs();
      } else {
        alert('❌ Error al regenerar código');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al regenerar código');
    }
  };

  const filteredPOIs = pois.filter(poi => {
    const matchesSearch = poi.nameEs.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando POIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📱 Gestión de Etiquetas NFC</h1>
          <p className="text-gray-600 mt-1">
            Administra las URLs NFC de cada punto de interés
          </p>
        </div>
        <Link
          href="/admin/nfc/stats"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
        >
          📊 Ver Estadísticas
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar POI
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Buscar por nombre..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="RESTAURANT">Restaurantes</option>
              <option value="MONUMENT">Monumentos</option>
              <option value="MUSEUM">Museos</option>
              <option value="BEACH">Playas</option>
              <option value="PARK">Parques</option>
              <option value="VIEWPOINT">Miradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de POIs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  POI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código NFC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recompensas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Escaneos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPOIs.map((poi) => (
                <tr key={poi.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{poi.nameEs}</div>
                      <div className="text-sm text-gray-500">{poi.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {poi.nfcUid}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-blue-600 font-medium">💎 {poi.points} pts</div>
                      <div className="text-purple-600">⭐ {poi.xpReward} XP</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      {poi._count.visits}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        poi.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {poi.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => copyNFCUrl(poi.nfcUid)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Copiar URL"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => regenerateNFCUid(poi.id)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Regenerar código"
                    >
                      🔄
                    </button>
                    <Link
                      href={`/admin/pois/${poi.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar POI"
                    >
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPOIs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron POIs</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Cómo funciona</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cada POI tiene un código NFC único que genera una URL de escaneo</li>
          <li>• Los usuarios escanean la etiqueta y acceden a la URL: <code className="bg-blue-100 px-1 rounded">/scan/[código]</code></li>
          <li>• Al escanear, se verifica la ubicación, se suman puntos y se registra la visita</li>
          <li>• Puedes regenerar códigos si una etiqueta se pierde o compromete</li>
          <li>• Los escaneos se registran con fecha, hora y ubicación del usuario</li>
        </ul>
      </div>
    </div>
  );
}

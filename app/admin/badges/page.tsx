'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Badge {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  icon: string;
  category: string | null;
  rarity: string;
  requirement: any;
  pointsReward: number;
  xpReward: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    users: number;
  };
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/admin/badges');
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el badge "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/badges/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Badge eliminado exitosamente');
        fetchBadges();
      } else {
        alert('❌ Error al eliminar badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('❌ Error al eliminar badge');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'bg-gray-100 text-gray-700';
      case 'RARE': return 'bg-blue-100 text-blue-700';
      case 'EPIC': return 'bg-purple-100 text-purple-700';
      case 'LEGENDARY': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'Común';
      case 'RARE': return 'Raro';
      case 'EPIC': return 'Épico';
      case 'LEGENDARY': return 'Legendario';
      default: return rarity;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🏅 Gestión de Badges</h1>
          <p className="text-gray-600 mt-1">
            Administra las insignias y logros del juego
          </p>
        </div>
        <Link
          href="/admin/badges/new"
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold shadow-lg"
        >
          ➕ Nuevo Badge
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Badges</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{badges.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              🏅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Común</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">
                {badges.filter(b => b.rarity === 'COMMON').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              ⚪
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Raro</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {badges.filter(b => b.rarity === 'RARE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              🔵
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Épico/Legendario</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {badges.filter(b => b.rarity === 'EPIC' || b.rarity === 'LEGENDARY').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              ⭐
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Badges */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Badges Disponibles ({badges.length})
          </h2>
        </div>
        
        {badges.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay badges creados
            </h3>
            <p className="text-gray-500 mb-6">
              Crea tu primer badge para comenzar a recompensar a los jugadores
            </p>
            <Link
              href="/admin/badges/new"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold"
            >
              ➕ Crear Primer Badge
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {badges.map((badge) => (
              <div key={badge.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono */}
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                      {badge.icon}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <h3 className="text-lg font-bold text-gray-800">{badge.nameEs}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityColor(badge.rarity)}`}>
                          {getRarityLabel(badge.rarity)}
                        </span>
                        {!badge.isActive && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Inactivo
                          </span>
                        )}
                        {badge.category && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {badge.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{badge.descriptionEs}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 flex-wrap gap-2">
                        <span>🎯 {badge.requirement.type}: {badge.requirement.value}</span>
                        <span>🎁 {badge.pointsReward} pts</span>
                        <span>⭐ {badge.xpReward} XP</span>
                        <span>👥 {badge._count.users} usuarios</span>
                        <span>📅 {new Date(badge.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <Link
                      href={`/admin/badges/${badge.id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(badge.id, badge.nameEs)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm whitespace-nowrap"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">ℹ️ Información</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• <strong>Común</strong>: Badges básicos, fáciles de conseguir</li>
          <li>• <strong>Raro</strong>: Badges que requieren dedicación</li>
          <li>• <strong>Épico</strong>: Badges difíciles de conseguir</li>
          <li>• <strong>Legendario</strong>: Los badges más prestigiosos y difíciles</li>
          <li>• Los badges se otorgan automáticamente al cumplir las condiciones</li>
        </ul>
      </div>
    </div>
  );
}

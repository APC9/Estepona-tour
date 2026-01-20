'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface RewardConfig {
  id: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  pointsRequired: number;
  name: string;
  size: string;
  description: string;
  emoji: string;
  isActive: boolean;
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/rewards');
      const data = await res.json();
      
      if (data.rewardConfigs && data.rewardConfigs.length > 0) {
        setRewards(data.rewardConfigs);
      }
    } catch (error) {
      console.error('Error al cargar premios:', error);
      toast.error('Error al cargar la configuración de premios');
    } finally {
      setLoading(false);
    }
  };

  const initializeRewards = async () => {
    try {
      setInitializing(true);
      const res = await fetch('/api/admin/rewards', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Configuración de premios inicializada');
        setRewards(data.rewardConfigs);
      } else {
        toast.error(data.error || 'Error al inicializar');
      }
    } catch (error) {
      console.error('Error al inicializar:', error);
      toast.error('Error al inicializar la configuración');
    } finally {
      setInitializing(false);
    }
  };

  const handleUpdate = (tier: string, field: keyof RewardConfig, value: any) => {
    setRewards(prev =>
      prev.map(reward =>
        reward.tier === tier ? { ...reward, [field]: value } : reward
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validar que los puntos sean positivos
      const invalidReward = rewards.find(r => r.pointsRequired <= 0);
      if (invalidReward) {
        toast.error('Los puntos requeridos deben ser mayores a 0');
        return;
      }

      // Validar que los puntos estén en orden ascendente
      const sortedRewards = [...rewards].sort((a, b) => a.pointsRequired - b.pointsRequired);
      const tierOrder = ['BRONZE', 'SILVER', 'GOLD'];
      const currentOrder = sortedRewards.map(r => r.tier);
      
      if (JSON.stringify(currentOrder) !== JSON.stringify(tierOrder)) {
        toast.error('Los puntos deben estar en orden: Bronce < Plata < Oro');
        return;
      }

      const res = await fetch('/api/admin/rewards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardConfigs: rewards }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('✅ Configuración guardada exitosamente');
        setRewards(data.rewardConfigs);
      } else {
        toast.error(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No hay configuración de premios
              </h2>
              <p className="text-gray-600 mb-6">
                Inicializa la configuración con los valores predeterminados
              </p>
              <button
                onClick={initializeRewards}
                disabled={initializing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initializing ? 'Inicializando...' : '🎁 Inicializar Configuración'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🏆 Gestión de Premios
              </h1>
              <p className="text-gray-600">
                Configura los puntos necesarios para cada nivel de premio
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>💾 Guardar Cambios</>
              )}
            </button>
          </div>
        </div>

        {/* Rewards List */}
        <div className="space-y-6">
          {rewards.map((reward) => (
            <div
              key={reward.tier}
              className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-400 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{reward.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {reward.name}
                  </h3>
                  <span className="text-sm text-gray-500 uppercase">
                    Tier {reward.tier}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Puntos Requeridos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos Requeridos
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={reward.pointsRequired}
                      onChange={(e) =>
                        handleUpdate(reward.tier, 'pointsRequired', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-3 text-gray-400">pts</span>
                  </div>
                </div>

                {/* Tamaño */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    value={reward.size}
                    onChange={(e) =>
                      handleUpdate(reward.tier, 'size', e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={reward.emoji}
                    onChange={(e) =>
                      handleUpdate(reward.tier, 'emoji', e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={2}
                  />
                </div>

                {/* Estado Activo */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reward.isActive}
                      onChange={(e) =>
                        handleUpdate(reward.tier, 'isActive', e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {reward.isActive ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </label>
                </div>

                {/* Descripción */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={reward.description}
                    onChange={(e) =>
                      handleUpdate(reward.tier, 'description', e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 mb-2">ℹ️ Información Importante</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los puntos deben estar en orden ascendente: Bronce {'<'} Plata {'<'} Oro</li>
            <li>• Los cambios afectarán a todos los usuarios inmediatamente</li>
            <li>• Los usuarios que ya reclamaron premios no se verán afectados</li>
            <li>• Desactivar un premio lo ocultará de la interfaz de usuario</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserReward {
  id: string;
  userId: string;
  rewardTier: 'BRONZE' | 'SILVER' | 'GOLD';
  photoUrl: string | null;
  userMessage: string | null;
  status: 'PENDING' | 'APPROVED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  trackingNumber: string | null;
  shippingAddress: string | null;
  claimedAt: string;
  approvedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    totalPoints: number;
  };
}

export default function AdminUserRewardsPage() {
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/user-rewards');
      const data = await res.json();
      
      if (data.rewards) {
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Error al cargar premios:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRewardStatus = async (
    rewardId: string,
    status: string,
    trackingNumber?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/user-rewards/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingNumber }),
      });

      if (res.ok) {
        fetchRewards();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    if (filter === 'all') return true;
    return reward.status === filter;
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_PRODUCTION: 'bg-purple-100 text-purple-800 border-purple-300',
    SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    DELIVERED: 'bg-green-100 text-green-800 border-green-300',
    CANCELED: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusLabels = {
    PENDING: '⏳ Pendiente',
    APPROVED: '✅ Aprobado',
    IN_PRODUCTION: '🏭 En Producción',
    SHIPPED: '📦 Enviado',
    DELIVERED: '✓ Entregado',
    CANCELED: '❌ Cancelado',
  };

  const tierEmojis = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🎁 Premios Reclamados por Usuarios
              </h1>
              <p className="text-gray-600">
                Gestiona las solicitudes de premios de los usuarios
              </p>
            </div>
            <button
              onClick={fetchRewards}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🔄 Actualizar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'APPROVED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '📋 Todos' : statusLabels[status as keyof typeof statusLabels]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de premios */}
        {filteredRewards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hay premios {filter !== 'all' ? 'con este estado' : 'reclamados'}
            </h3>
            <p className="text-gray-600">
              Los premios reclamados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Imagen y datos del usuario */}
                  <div className="lg:col-span-1">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-5xl">{tierEmojis[reward.rewardTier]}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Premio {reward.rewardTier}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reward.user.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500">{reward.user.email}</p>
                      </div>
                    </div>

                    {/* Foto */}
                    {reward.photoUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📸 Foto seleccionada:
                        </label>
                        <div
                          className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition"
                          onClick={() => setShowImageModal(reward.photoUrl)}
                        >
                          <Image
                            src={reward.photoUrl}
                            alt="User reward photo"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded opacity-0 hover:opacity-100 transition">
                              Click para ampliar
                            </span>
                          </div>
                        </div>
                        <a
                          href={reward.photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2 text-xs text-blue-600 hover:underline break-all"
                        >
                          🔗 {reward.photoUrl}
                        </a>
                      </div>
                    )}

                    {/* Mensaje del usuario */}
                    {reward.userMessage && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          💬 Mensaje:
                        </p>
                        <p className="text-sm text-blue-800">{reward.userMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Información y estados */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">📅 Reclamado:</p>
                        <p className="font-semibold">
                          {new Date(reward.claimedAt).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">🎯 Puntos del usuario:</p>
                        <p className="font-semibold">{reward.user.totalPoints} pts</p>
                      </div>
                    </div>

                    {/* Estado actual */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Estado actual:</p>
                      <span
                        className={`inline-block px-4 py-2 rounded-lg font-semibold border-2 ${
                          statusColors[reward.status]
                        }`}
                      >
                        {statusLabels[reward.status]}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Cambiar estado:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateRewardStatus(reward.id, status)
                            }
                            disabled={reward.status === status}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                              reward.status === status
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Número de seguimiento */}
                    {(reward.status === 'SHIPPED' || reward.status === 'DELIVERED') && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          📦 Número de seguimiento:
                        </label>
                        <input
                          type="text"
                          defaultValue={reward.trackingNumber || ''}
                          onBlur={(e) => {
                            if (e.target.value !== reward.trackingNumber) {
                              updateRewardStatus(
                                reward.id,
                                reward.status,
                                e.target.value
                              );
                            }
                          }}
                          placeholder="Ingresa el número de tracking"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de imagen */}
      {showImageModal && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setShowImageModal(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowImageModal(null)}
                className="absolute -top-12 right-0 p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
              >
                ✕ Cerrar
              </button>
              <div className="relative w-full h-[80vh] bg-white rounded-lg overflow-hidden">
                <Image
                  src={showImageModal}
                  alt="Full size"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ClaimRewardModal from './ClaimRewardModal';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { translations } from '@/lib/translations';

interface Reward {
  name: string;
  emoji: string;
  pointsRequired: number;
  size: string;
  description: string;
}

interface RewardStatus {
  bronze: { available: boolean; claimed: boolean; currentPoints: number };
  silver: { available: boolean; claimed: boolean; currentPoints: number };
  gold: { available: boolean; claimed: boolean; currentPoints: number };
}

interface RewardsProgressProps {
  compact?: boolean;
}

export default function RewardsProgress({ compact = false }: RewardsProgressProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const t = (key: keyof typeof translations) => translations[key][language];
  
  const [rewards, setRewards] = useState<RewardStatus | null>(null);
  const [rewardsConfig, setRewardsConfig] = useState<Record<string, Reward> | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
    name: string;
    emoji: string;
    pointsRequired: number;
    size: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        // Obtener configuración de premios desde la BD
        const configResponse = await fetch('/api/rewards/config');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setRewardsConfig(configData.config);
        }

        // Obtener estado de premios del usuario
        const rewardsResponse = await fetch('/api/user/rewards');
        if (rewardsResponse.ok) {
          const data = await rewardsResponse.json();
          setRewards(data.rewards);
          setTotalPoints(data.totalPoints);
          setIsPremium(data.isPremium);
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const handleOpenClaimModal = (tier: 'BRONZE' | 'SILVER' | 'GOLD') => {
    if (!rewardsConfig) return;
    
    const config = rewardsConfig[tier];
    setSelectedReward({
      tier,
      name: config.name,
      emoji: config.emoji,
      pointsRequired: config.pointsRequired,
      size: config.size,
      description: config.description,
    });
    
    setShowClaimModal(true);
  };

  const handleClaimSuccess = async () => {
    // Recargar datos de premios
    try {
      const rewardsResponse = await fetch('/api/user/rewards');
      if (rewardsResponse.ok) {
        const data = await rewardsResponse.json();
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Error reloading rewards:', error);
    }
  };

  if (loading || !rewards || !rewardsConfig) {
    return null;
  }

  const rewardsList: { key: string; data: Reward }[] = [
    { key: 'BRONZE', data: rewardsConfig.BRONZE },
    { key: 'SILVER', data: rewardsConfig.SILVER },
    { key: 'GOLD', data: rewardsConfig.GOLD },
  ];

  // Calcular siguiente premio disponible
  const nextReward = rewardsList.find((r) => {
    const status = rewards[r.key.toLowerCase() as keyof RewardStatus];
    return !status.claimed && !status.available;
  });

  const nextRewardData = nextReward ? nextReward.data : null;
  const pointsToNext = nextRewardData ? nextRewardData.pointsRequired - totalPoints : 0;
  const progressToNext = nextRewardData
    ? (totalPoints / nextRewardData.pointsRequired) * 100
    : 100;

  // Contar premios disponibles no reclamados
  const availableRewards = rewardsList.filter((r) => {
    const status = rewards[r.key.toLowerCase() as keyof RewardStatus];
    return status.available && !status.claimed;
  }).length;

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            availableRewards > 0
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 animate-pulse'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="text-xl">🏆</span>
          <div className="text-left">
            <div className="text-xs font-bold">{t('rewards')}</div>
            <div className="text-[10px]">
              {totalPoints} {t('pts')}
              {availableRewards > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold">
                  {availableRewards}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Modal de detalles */}
        {showDetails && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowDetails(false)}
            />
            <div className="fixed inset-x-4 top-20 z-50 bg-white rounded-2xl shadow-2xl max-w-md mx-auto max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    🏆 {t('rewardsTitle')}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-1 hover:bg-black/10 rounded"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {totalPoints} {t('totalPoints')}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {!isPremium && (
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-sm font-semibold text-primary-900 mb-2">
                      {t('upgradeToPremuim')}
                    </div>
                    <div className="text-xs text-primary-700 mb-3">
                      {t('rewardsOnlyPremium')}
                    </div>
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        router.push('/upgrade');
                      }}
                      className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm"
                    >
                      {t('seePlans')}
                    </button>
                  </div>
                )}

                {rewardsList.map((reward) => {
                  const status = rewards[reward.key.toLowerCase() as keyof RewardStatus];
                  const progress = (totalPoints / reward.data.pointsRequired) * 100;

                  return (
                    <div
                      key={reward.key}
                      className={`border-2 rounded-lg p-4 ${
                        status.claimed
                          ? 'bg-green-50 border-green-300'
                          : status.available
                          ? 'bg-yellow-50 border-yellow-400 shadow-lg'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{reward.data.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">
                              {reward.data.name}
                            </h4>
                            {status.claimed && (
                              <span className="text-green-600 text-sm font-bold">
                                ✓ {t('claimed')}
                              </span>
                            )}
                            {status.available && !status.claimed && (
                              <span className="text-yellow-600 text-sm font-bold animate-pulse">
                                {t('available')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {reward.data.size} • {reward.data.pointsRequired} {t('pts')}
                          </div>
                          {!status.claimed && (
                            <div className="space-y-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    status.available
                                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                      : 'bg-primary-500'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-600">
                                {status.available ? (
                                  <span className="text-green-600 font-semibold">
                                    {t('youReachedReward')}
                                  </span>
                                ) : (
                                  <span>
                                    {t('needMorePoints').replace('{points}', String(reward.data.pointsRequired - totalPoints))}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {availableRewards > 0 && isPremium && (
                  <button
                    onClick={() => {
                      // Buscar el primer premio disponible
                      const firstAvailable = rewardsList.find(r => {
                        const key = r.key.toLowerCase();
                        const status = rewards[key as keyof RewardStatus];
                        return status && status.available && !status.claimed;
                      });
                      
                      if (firstAvailable) {
                        setShowDetails(false);
                        handleOpenClaimModal(firstAvailable.key as 'BRONZE' | 'SILVER' | 'GOLD');
                      }
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg font-bold shadow-lg"
                  >
                    {t('claimRewardsCount').replace('{count}', String(availableRewards))}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Modal de reclamación para vista compacta */}
        {selectedReward && (
          <ClaimRewardModal
            isOpen={showClaimModal}
            onClose={() => setShowClaimModal(false)}
            reward={selectedReward}
            currentPoints={totalPoints}
            onSuccess={handleClaimSuccess}
          />
        )}
      </div>
    );
  }

  // Vista completa (no compacta)
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🏆 {t('rewardsTitle')}
        </h3>
        {availableRewards > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
            {t('availableCount').replace('{count}', String(availableRewards)).replace('{plural}', availableRewards > 1 ? 's' : '')}
          </span>
        )}
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white text-center mb-6">
          <div className="text-4xl mb-3">⭐</div>
          <h4 className="text-xl font-bold mb-2">{t('upgradeToPremuim')}</h4>
          <p className="text-sm mb-4 opacity-90">
            {t('rewardsExclusiveOnlyPremium')}
          </p>
          <button
            onClick={() => router.push('/upgrade')}
            className="px-6 py-3 bg-white text-primary-700 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            {t('seePremiumPlans')}
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {rewardsList.map((reward) => {
          const status = rewards[reward.key.toLowerCase() as keyof RewardStatus];
          const progress = (totalPoints / reward.data.pointsRequired) * 100;

          return (
            <div
              key={reward.key}
              className={`border-2 rounded-xl p-4 transition-all ${
                status.claimed
                  ? 'bg-green-50 border-green-300'
                  : status.available
                  ? 'bg-yellow-50 border-yellow-400 shadow-xl'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{reward.data.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-gray-900">{reward.data.name}</h4>
                    {status.claimed && (
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                        ✓ Reclamado
                      </span>
                    )}
                    {status.available && !status.claimed && (
                      <span className="px-3 py-1 bg-yellow-500 text-gray-900 rounded-full text-sm font-bold animate-pulse">
                        ¡Disponible!
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {reward.data.description}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                    <span className="font-semibold">📏 {reward.data.size}</span>
                    <span className="font-semibold">🎯 {reward.data.pointsRequired} puntos</span>
                  </div>
                  {!status.claimed && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            status.available
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {totalPoints} / {reward.data.pointsRequired} puntos
                        </span>
                        {status.available ? (
                          <span className="text-green-600 font-bold">
                            ¡Has alcanzado este premio! 🎉
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            Faltan {reward.data.pointsRequired - totalPoints} pts
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {nextRewardData && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border-2 border-primary-200">
          <div className="text-sm font-semibold text-primary-900 mb-2">
            🎯 Próximo premio: {nextRewardData.name}
          </div>
          <div className="text-xs text-primary-700">
            Te faltan {pointsToNext} puntos. ¡Sigue visitando POIs!
          </div>
        </div>
      )}

      {availableRewards > 0 && isPremium && (
        <button
          onClick={() => {
            // Buscar el primer premio disponible
            const firstAvailable = rewardsList.find(r => {
              const status = rewards[r.key.toLowerCase() as keyof RewardStatus];
              return status.available && !status.claimed;
            });
            if (firstAvailable) {
              handleOpenClaimModal(firstAvailable.key as 'BRONZE' | 'SILVER' | 'GOLD');
            }
          }}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {t('claimReward')
            .replace('{count}', String(availableRewards))
            .replace('{plural}', availableRewards > 1 ? 's' : '')} 🎁
        </button>
      )}

      {/* Modal de reclamación */}
      {selectedReward && (
        <ClaimRewardModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          reward={selectedReward}
          currentPoints={totalPoints}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
}

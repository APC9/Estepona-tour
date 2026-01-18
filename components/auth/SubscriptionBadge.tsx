'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionInfo {
  isActive: boolean;
  tier: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  daysRemaining: number | null;
}

export default function SubscriptionBadge() {
  const { status } = useSession();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data);
        }
      } catch (error) {
        console.error('Error obteniendo información de suscripción:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [status]);

  if (loading || status !== 'authenticated' || !subscriptionInfo) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'FAMILY':
        return 'bg-gradient-to-r from-purple-400 to-purple-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return 'Premium';
      case 'FAMILY':
        return 'Familiar';
      default:
        return 'Gratis';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={`${getTierColor(subscriptionInfo.tier)} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg`}>
        <div className="flex items-center justify-between">
          <span>Plan {getTierLabel(subscriptionInfo.tier)}</span>
          {subscriptionInfo.tier !== 'FREE' && subscriptionInfo.daysRemaining !== null && (
            <span className="text-xs opacity-90">
              {subscriptionInfo.daysRemaining} días restantes
            </span>
          )}
        </div>
      </div>
      
      {subscriptionInfo.tier !== 'FREE' && subscriptionInfo.daysRemaining !== null && subscriptionInfo.daysRemaining <= 7 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 text-xs rounded">
          <p className="font-bold">⚠️ Tu suscripción está por vencer</p>
          <p>Renueva tu plan para seguir disfrutando de todos los beneficios.</p>
        </div>
      )}
    </div>
  );
}

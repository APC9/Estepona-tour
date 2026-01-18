import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionData {
  isActive: boolean;
  tier: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  daysRemaining: number | null;
}

/**
 * Hook para obtener información sobre la suscripción del usuario
 */
export function useSubscription() {
  const { status } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');

        if (!response.ok) {
          throw new Error('Error obteniendo suscripción');
        }

        const data = await response.json();
        setSubscription(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [status]);

  return {
    subscription,
    loading,
    error,
    isActive: subscription?.isActive ?? false,
    tier: subscription?.tier ?? 'FREE',
    daysRemaining: subscription?.daysRemaining ?? null,
  };
}

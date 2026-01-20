import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useRewardNotifications() {
  const { data: session, status } = useSession();
  const [notification, setNotification] = useState<{
    show: boolean;
    reward: string;
    emoji: string;
    points: number;
  } | null>(null);
  const [rewardsConfig, setRewardsConfig] = useState<any>(null);

  // Obtener configuración de premios
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/rewards/config');
        if (response.ok) {
          const data = await response.json();
          setRewardsConfig(data.config);
        }
      } catch (error) {
        console.error('Error fetching rewards config:', error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !rewardsConfig) return;

    const checkRewardMilestones = async () => {
      try {
        const response = await fetch('/api/user/rewards');
        if (!response.ok) return;

        const data = await response.json();
        const { rewards, totalPoints, isPremium } = data;

        // Solo mostrar notificaciones si es premium
        if (!isPremium) return;

        // Verificar localStorage para no mostrar la misma notificación múltiples veces
        const shownNotifications = JSON.parse(
          localStorage.getItem('reward-notifications-shown') || '[]'
        );

        // Verificar cada premio
        const rewardChecks = [
          { key: 'bronze', config: rewardsConfig.BRONZE },
          { key: 'silver', config: rewardsConfig.SILVER },
          { key: 'gold', config: rewardsConfig.GOLD },
        ];

        for (const check of rewardChecks) {
          const rewardStatus = rewards[check.key as keyof typeof rewards];

          // Si el premio está disponible pero no reclamado y no hemos mostrado notificación
          if (
            rewardStatus.available &&
            !rewardStatus.claimed &&
            !shownNotifications.includes(check.key)
          ) {
            // Mostrar notificación
            setNotification({
              show: true,
              reward: check.config.name,
              emoji: check.config.emoji,
              points: check.config.pointsRequired,
            });

            // Marcar como mostrada
            shownNotifications.push(check.key);
            localStorage.setItem(
              'reward-notifications-shown',
              JSON.stringify(shownNotifications)
            );

            // Auto-ocultar después de 8 segundos
            setTimeout(() => {
              setNotification(null);
            }, 8000);

            // Solo mostrar una notificación a la vez
            break;
          }
        }
      } catch (error) {
        console.error('Error checking reward milestones:', error);
      }
    };

    // Verificar al montar y cada 30 segundos
    checkRewardMilestones();
    const interval = setInterval(checkRewardMilestones, 30000);

    return () => clearInterval(interval);
  }, [status]);

  const dismissNotification = () => {
    setNotification(null);
  };

  return { notification, dismissNotification };
}

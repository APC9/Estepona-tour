'use client';

import { useRewardNotifications } from '@/hooks/useRewardNotifications';
import { useRouter } from 'next/navigation';

export default function RewardNotification() {
  const { notification, dismissNotification } = useRewardNotifications();
  const router = useRouter();

  if (!notification?.show) return null;

  const handleClick = () => {
    dismissNotification();
    router.push('/map'); // TODO: redirigir a página de premios
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-2xl p-4 max-w-sm cursor-pointer hover:scale-105 transition-transform"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="text-5xl animate-bounce">{notification.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-gray-900 text-lg">¡Premio Desbloqueado!</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification();
                }}
                className="text-gray-700 hover:text-gray-900 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-800 mb-2">
              ¡Has alcanzado <span className="font-bold">{notification.points} puntos</span>!
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Premio <span className="font-bold">{notification.reward}</span> disponible 🎉
            </p>
            <button className="w-full px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors">
              Reclamar Ahora →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

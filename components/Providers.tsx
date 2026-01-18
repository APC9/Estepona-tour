'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { usePOIStore } from '@/lib/stores/poiStore';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import SubscriptionCheck from './auth/SubscriptionCheck';

function SessionWatcher({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const prevStatusRef = useRef(status);

  useEffect(() => {
    // Si el usuario pasa de autenticado a no autenticado, limpiar stores
    if (prevStatusRef.current === 'authenticated' && status === 'unauthenticated') {
      console.log('🔴 Usuario cerró sesión - Limpiando stores locales');
      
      // Limpiar POI store
      usePOIStore.getState().clearVisited();
      
      // Resetear gamification store
      useGamificationStore.setState({
        level: 1,
        experiencePoints: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        achievements: [],
        pendingSyncVisits: [],
      });
    }
    
    prevStatusRef.current = status;
  }, [status]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SessionWatcher>
          <SubscriptionCheck />
          {children}
        </SessionWatcher>
      </QueryClientProvider>
    </SessionProvider>
  );
}

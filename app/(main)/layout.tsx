'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TierApplier } from '@/components/auth/TierApplier';
import RewardNotification from '@/components/rewards/RewardNotification';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserExists = async () => {
      if (status === 'loading') return;

      if (status === 'authenticated' && session?.user) {
        try {
          // 🔒 Verificar que el usuario todavía existe en BD
          const response = await fetch('/api/user/profile');
          
          if (response.status === 404) {
            // Usuario eliminado de BD - cerrar sesión y mantener loading
            console.warn('User no longer exists in database - signing out');
            await signOut({ 
              callbackUrl: '/?error=UserDeleted',
              redirect: true
            });
            // NO establecer checking en false - mantener loading hasta redirect
            return;
          }

          if (!response.ok) {
            console.error('Error checking user existence:', response.statusText);
            // Si hay otro error, intentar cerrar sesión por seguridad
            await signOut({ 
              callbackUrl: '/?error=SessionError',
              redirect: true
            });
            return;
          }
        } catch (error) {
          console.error('Error verifying user existence:', error);
          // En caso de error de red crítico, cerrar sesión por seguridad
          await signOut({ 
            callbackUrl: '/?error=NetworkError',
            redirect: true
          });
          return;
        }
      }

      setChecking(false);
    };

    checkUserExists();
  }, [session, status]);

  // Mostrar loading mientras verificamos
  if (checking && status === 'authenticated') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <TierApplier />
      <RewardNotification />
      {children}
    </main>
  );
}

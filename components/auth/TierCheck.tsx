'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function TierCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checking, setChecking] = useState(true);
  const [hasTier, setHasTier] = useState(false);

  useEffect(() => {
    const checkTier = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/user/tier');
        if (res.ok) {
          const data = await res.json();
          
          // Si el usuario ya tiene un tier definido, continuar
          if (data.tier) {
            setHasTier(true);
            setChecking(false);
          } else {
            // Si no tiene tier, redirigir a la página de selección
            router.push('/upgrade');
          }
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error('Error checking tier:', error);
        setChecking(false);
      }
    };

    checkTier();
  }, [status, router]);

  if (checking && status === 'authenticated') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!hasTier && status === 'authenticated') {
    return null; // El useEffect ya redirigió
  }

  return <>{children}</>;
}

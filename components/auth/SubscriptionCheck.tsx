'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Componente que verifica si la suscripción del usuario está activa.
 * Si la suscripción ha expirado, cierra la sesión y redirige a la página principal.
 */
export default function SubscriptionCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      if (status !== 'authenticated' || !session?.user?.email) {
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        
        if (!response.ok) {
          console.error('Error verificando suscripción');
          return;
        }

        const data = await response.json();

        // Si la suscripción no está activa o ha expirado
        // SOLO cerrar sesión si es un tier de pago (PREMIUM/FAMILY) que expiró
        // Los usuarios FREE siempre pueden acceder
        if (!data.isActive && data.tier !== 'FREE') {
          console.warn('⚠️ Suscripción expirada - Redirigiendo a upgrade...');
          
          // Redirigir a página de upgrade sin cerrar sesión
          router.push('/upgrade');
        }
      } catch (error) {
        console.error('Error al verificar suscripción:', error);
      }
    };

    checkSubscription();
    
    // Verificar cada 5 minutos
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [session, status, router]);

  return null;
}

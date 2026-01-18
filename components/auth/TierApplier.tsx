'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function TierApplier() {
  const { data: session, status } = useSession();
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // Este componente ya no aplica tiers automáticamente
    // Los tiers de pago (PREMIUM/FAMILY) se manejan a través de Stripe en /upgrade
    // Solo limpiar localStorage si el tier no es válido
    if (status === 'authenticated' && session?.user && !applied) {
      const selectedTier = localStorage.getItem('selected-tier');
      
      // Si hay un tier de pago pendiente, NO limpiarlo aquí
      // La página /upgrade lo manejará
      if (selectedTier && ['PREMIUM', 'FAMILY'].includes(selectedTier)) {
        // No hacer nada, dejarlo para /upgrade
        setApplied(true);
      } else {
        // Limpiar si es inválido o ya no es necesario
        if (selectedTier && !['FREE', 'PREMIUM', 'FAMILY'].includes(selectedTier)) {
          localStorage.removeItem('selected-tier');
        }
        setApplied(true);
      }
    }
  }, [status, session, applied]);

  // Este componente no renderiza nada
  return null;
}

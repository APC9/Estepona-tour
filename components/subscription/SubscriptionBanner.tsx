'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SubscriptionStatus {
  tier: string;
  isActive: boolean;
  subscriptionEnd: string | null;
}

export default function SubscriptionBanner() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/tier')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !status) return null;

  // No mostrar para usuarios FREE
  if (status.tier === 'FREE') {
    return (
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 text-center">
        <p className="text-sm">
          🎁 <strong>Desbloquea más aventuras</strong> con Premium. 
          <Link href="/upgrade" className="ml-2 underline font-semibold hover:text-primary-100">
            Ver planes →
          </Link>
        </p>
      </div>
    );
  }

  // Mostrar para usuarios Premium/Family
  const daysLeft = status.subscriptionEnd 
    ? Math.ceil((new Date(status.subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-center text-sm">
      <span>✨ Plan <strong>{status.tier}</strong> activo</span>
      {daysLeft !== null && daysLeft > 0 && (
        <span className="ml-2">• Renueva en {daysLeft} días</span>
      )}
      <Link href="/upgrade" className="ml-3 underline hover:text-green-100">
        Gestionar
      </Link>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PREMIUM' | 'FAMILY'>('FREE');
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [processingPendingTier, setProcessingPendingTier] = useState(false);
  const [stripeConfigError, setStripeConfigError] = useState(false);

  // 💳 Procesar tier pendiente de pago (al iniciar sesión desde página principal)
  useEffect(() => {
    if (!session || processingPendingTier) return;

    const pendingTier = localStorage.getItem('selected-tier');
    
    if (pendingTier && pendingTier !== 'FREE') {
      // Primero verificar si el usuario YA tiene este tier
      fetch('/api/user/tier')
        .then(res => res.json())
        .then(tierData => {
          console.log('🔍 Verificando tier actual antes de procesar pago:', tierData.tier, 'Pendiente:', pendingTier);
          
          // Si el usuario YA tiene el tier que intentó comprar, limpiar y redirigir
          if (tierData.tier === pendingTier) {
            console.log('✅ Usuario ya tiene el tier', pendingTier, '- Limpiando y redirigiendo al mapa');
            localStorage.removeItem('selected-tier');
            router.push('/map');
            return;
          }
          
          // Si no tiene el tier, procesar el pago
          console.log('💳 Procesando pago para tier:', pendingTier);
          setProcessingPendingTier(true);
          setSelectedTier(pendingTier as 'PREMIUM' | 'FAMILY');
          
          // Asignar el tier temporal al usuario (para usuarios nuevos)
          return fetch('/api/user/assign-tier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: pendingTier }),
          });
        })
        .then(res => {
          if (!res) return null; // Ya se manejó en el bloque anterior
          return res.json();
        })
        .then(resData => {
          if (!resData) return null; // Ya se manejó en el bloque anterior
          return resData;
        })
        .then(tierData => {
          if (!tierData) return; // Ya se manejó en el bloque anterior
          if (!tierData) return; // Ya se manejó en el bloque anterior
          
          console.log('✅ Tier asignado temporalmente:', tierData);
          
          // Luego procesar el pago
          setLoading(true);
          
          return fetch('/api/stripe/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier: pendingTier }),
          });
        })
        .then(res => {
          if (!res) return null;
          return res.json();
        })
        .then(data => {
          if (!data) return;
          if (data.url) {
            // ✅ Éxito - redirigir a Stripe (el tier se limpiará después del pago exitoso)
            window.location.href = data.url;
          } else {
            console.error('Error creating checkout:', data);
            setStripeConfigError(true);
            const errorMsg = data.error || 'Error desconocido';
            const details = data.details ? ` - ${data.details}` : '';
            console.error(`Error al procesar el pago: ${errorMsg}${details}`);
            
            // ❌ Error - NO limpiar localStorage, mantener tier pendiente
            // El usuario NO podrá acceder al mapa hasta completar el pago
            router.push('/?paymentError=true');
          }
        })
        .catch(error => {
          console.error('Error processing pending tier:', error);
          
          // ❌ Error - NO limpiar localStorage, mantener tier pendiente
          router.push('/?paymentError=true');
        });
    }
  }, [session, processingPendingTier]);

  useEffect(() => {
    // Cargar tier actual del usuario
    fetch('/api/user/tier')
      .then(res => res.json())
      .then(data => {
        setCurrentTier(data.tier);
        setHasSubscription(data.isActive && data.tier !== 'FREE');
        
        const pendingTier = localStorage.getItem('selected-tier');
        console.log('🔍 Upgrade page - Tier actual:', data.tier, 'Tier pendiente:', pendingTier);
        
        // Si el usuario ya tiene PREMIUM/FAMILY y no hay proceso de pago en curso, ir al mapa
        if (['PREMIUM', 'FAMILY'].includes(data.tier) && !pendingTier && !searchParams.get('success') && !searchParams.get('canceled')) {
          console.log('✅ Usuario ya tiene plan premium - redirigiendo al mapa');
          router.push('/map');
          return;
        }
        
        // Los usuarios FREE pueden ver la página de upgrade para seleccionar un plan
        console.log('📋 Usuario en página de upgrade - Tier actual:', data.tier);
      })
      .catch(console.error);

    // Verificar si viene de un checkout exitoso
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      console.log('🔍 Verificando pago completado con session:', sessionId);
      
      // IMPORTANTE: Limpiar localStorage INMEDIATAMENTE para evitar loops
      localStorage.removeItem('selected-tier');
      
      // Verificar y actualizar la base de datos
      fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('✅ Suscripción verificada y activada:', data);
            // Limpiar el tier pendiente
            localStorage.removeItem('selected-tier');
            // Redirigir a página principal con mensaje de éxito
            router.push('/?paymentSuccess=true');
          } else {
            console.error('❌ Error verificando sesión:', data);
            router.push('/?paymentError=true');
          }
        })
        .catch(error => {
          console.error('❌ Error en verificación:', error);
          router.push('/?paymentError=true');
        });
    } else if (success === 'true') {
      // Fallback si no hay sessionId
      localStorage.removeItem('selected-tier');
      router.push('/?paymentSuccess=true');
    } else if (canceled === 'true') {
      // Redirigir a página principal si cancela el pago
      router.push('/?paymentCanceled=true');
    }
  }, [searchParams, router]);

  const tiers = [
    {
      id: 'FREE',
      name: 'Gratuito',
      price: '€0',
      period: '',
      icon: '🎯',
      features: [
        'Acceso a POIs básicos',
        'Sistema de gamificación',
        'Mapa interactivo',
        'Badges básicos',
        'Progreso y estadísticas',
      ],
      color: 'from-gray-500 to-gray-600',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      price: '€4.99',
      period: '/mes',
      icon: '⭐',
      popular: true,
      features: [
        'Todo lo de Gratuito',
        'Acceso a todos los POIs premium',
        'Badges exclusivos',
        'Sin anuncios',
        'Estadísticas avanzadas',
        'Soporte prioritario',
      ],
      color: 'from-primary-500 to-primary-700',
      buttonColor: 'bg-primary-500 hover:bg-primary-600',
    },
    {
      id: 'FAMILY',
      name: 'Family',
      price: '€9.99',
      period: '/mes',
      icon: '👨‍👩‍👧‍👦',
      features: [
        'Todo lo de Premium',
        'Hasta 5 miembros',
        'Dashboard familiar',
        'Desafíos familiares',
        'Eventos exclusivos',
        'Descuentos en tours',
      ],
      color: 'from-purple-500 to-purple-700',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const handleSelectTier = async (tierId: 'FREE' | 'PREMIUM' | 'FAMILY') => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    setLoading(true);
    setSelectedTier(tierId);

    try {
      if (tierId === 'FREE') {
        // Downgrade a FREE (cancelar suscripción)
        const confirmDowngrade = confirm('¿Estás seguro de que quieres cancelar tu suscripción?');
        if (!confirmDowngrade) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/user/tier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: 'FREE' }),
        });

        if (res.ok) {
          console.log('✅ Suscripción cancelada');
          window.location.reload();
        } else {
          console.error('❌ Error al cancelar suscripción');
        }
      } else {
        // Crear Checkout Session con Stripe
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: tierId }),
        });

        const data = await res.json();

        if (res.ok && data.url) {
          // Redirigir a Stripe Checkout
          window.location.href = data.url;
        } else {
          setStripeConfigError(true);
          const errorMsg = data.error || 'Unknown error';
          const details = data.details ? ` - ${data.details}` : '';
          console.error(`Error al crear sesión de pago: ${errorMsg}${details}`);
          setLoading(false);
          
          // Redirigir a página principal con mensaje de error
          router.push('/?paymentError=true');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      
      // Redirigir a página principal con mensaje de error
      router.push('/?paymentError=true');
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error('❌ Error al abrir portal de gestión');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4">
      {/* 💳 Loading overlay para procesamiento automático de pago */}
      {processingPendingTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Procesando pago</h2>
            <p className="text-gray-600">Redirigiendo a Stripe Checkout...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* ⚠️ Banner de advertencia de configuración de Stripe */}
        {stripeConfigError && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Configuración de Stripe requerida</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Los pagos con Stripe no están configurados. Para habilitar suscripciones premium:</p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Crea una cuenta en <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Stripe.com</a></li>
                    <li>Obtén tus claves API (Secret Key y Publishable Key)</li>
                    <li>Crea los productos y precios en Stripe Dashboard</li>
                    <li>Configura las variables en <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
                  </ol>
                  <p className="mt-2">
                    Ver <a href="/STRIPE-SETUP.md" className="underline font-medium">STRIPE-SETUP.md</a> para instrucciones detalladas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {hasSubscription ? 'Gestionar Suscripción' : 'Completar registro'}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {session?.user?.name ? `Bienvenido, ${session.user.name}` : 'Bienvenido'}
          </p>
          <p className="text-gray-500 mb-4">
            {hasSubscription 
              ? 'Administra tu plan premium desde aquí' 
              : 'Procesando tu selección de plan...'}
          </p>
          {currentTier !== 'FREE' && !hasSubscription && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span>Plan seleccionado: <strong>{currentTier}</strong></span>
            </div>
          )}
        </div>

        {/* Botón de gestión de suscripción */}
        {hasSubscription && (
          <div className="text-center mb-8">
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Cargando...' : '⚙️ Gestionar suscripción'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Cancela, cambia de plan o actualiza tu método de pago
            </p>
            
            {/* Información de suscripción actual */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Tu Suscripción</h3>
              <p className="text-gray-600">Plan actual: <strong className="text-primary-600">{currentTier}</strong></p>
              <p className="text-sm text-gray-500 mt-4">
                Gestiona tu suscripción en el portal de Stripe para cancelar, cambiar de plan o actualizar tu método de pago.
              </p>
            </div>
          </div>
        )}

        {/* Planes - Solo mostrar si NO tiene suscripción activa */}
        {!hasSubscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  tier.popular ? 'ring-4 ring-primary-500' : ''
                } ${currentTier === tier.id ? 'ring-4 ring-green-500' : ''}`}
              >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  MÁS POPULAR
                </div>
              )}
              
              {currentTier === tier.id && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-bold rounded-br-lg">
                  PLAN ACTUAL
                </div>
              )}

              <div className={`bg-gradient-to-br ${tier.color} text-white p-8`}>
                <div className="text-5xl mb-4">{tier.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-lg ml-1">{tier.period}</span>
                </div>
              </div>

              <div className="p-8">{/* Features y botón continúan igual */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tier.id as 'FREE' | 'PREMIUM' | 'FAMILY')}
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tier.buttonColor}`}
                >
                  {loading && selectedTier === tier.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Procesando...
                    </span>
                  ) : tier.id === 'FREE' ? (
                    'Comenzar Gratis'
                  ) : (
                    'Seleccionar Plan'
                  )}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            💳 Pagos seguros procesados por Stripe
          </p>
          <p className="text-sm text-gray-500">
            Puedes cambiar o cancelar tu plan en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </div>
  );
}

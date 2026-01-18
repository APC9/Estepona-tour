'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailAuthForm } from '@/components/auth/EmailAuthForm';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { translate } from '@/lib/translations';

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage } = useLanguageStore();
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PREMIUM' | 'FAMILY'>('FREE');
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'success' | 'error' | 'canceled'>('success');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Imágenes del slideshow
  const slideshowImages = [
    '/images/estepona-1.webp',
    '/images/estepona-2.webp',
    '/images/estepona-3.webp',
    '/images/estepona-4.jpg',
    '/images/estepona-5.jpg',
  ];

  // Slideshow automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % slideshowImages.length
      );
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  // Detectar parámetros de pago en la URL
  useEffect(() => {
    const paymentSuccess = searchParams.get('paymentSuccess');
    const paymentError = searchParams.get('paymentError');
    const paymentCanceled = searchParams.get('paymentCanceled');

    if (paymentSuccess === 'true') {
      // IMPORTANTE: Limpiar localStorage inmediatamente cuando hay éxito
      localStorage.removeItem('selected-tier');
      
      setPaymentModalType('success');
      setShowPaymentModal(true);
      // Limpiar URL
      window.history.replaceState({}, '', '/');
    } else if (paymentError === 'true') {
      setPaymentModalType('error');
      setShowPaymentModal(true);
      window.history.replaceState({}, '', '/');
    } else if (paymentCanceled === 'true') {
      setPaymentModalType('canceled');
      setShowPaymentModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  // Si ya está autenticado, verificar tier actual y redirigir apropiadamente
  useEffect(() => {
    if (status === 'authenticated') {
      // Primero verificar el tier actual del usuario en la base de datos
      fetch('/api/user/tier')
        .then(res => res.json())
        .then(data => {
          const currentTier = data.tier;
          const pendingTier = localStorage.getItem('selected-tier');
          
          console.log('🔍 Usuario autenticado - Tier actual:', currentTier, 'Tier pendiente:', pendingTier);
          
          if (pendingTier && ['PREMIUM', 'FAMILY'].includes(pendingTier)) {
            // Tiene tier de pago pendiente - verificar si ya lo completó
            if (currentTier === pendingTier) {
              // Ya completó el pago - limpiar localStorage y ir al mapa
              localStorage.removeItem('selected-tier');
              console.log('✅ Pago ya completado, redirigiendo al mapa');
              router.push('/map');
            } else {
              // Aún no completó el pago - ir a upgrade
              console.log('💳 Pago pendiente, redirigiendo a upgrade');
              router.push('/upgrade');
            }
          } else if (currentTier && ['PREMIUM', 'FAMILY'].includes(currentTier)) {
            // Usuario ya tiene plan premium/family - ir directamente al mapa
            console.log('✅ Usuario premium existente, redirigiendo al mapa');
            localStorage.removeItem('selected-tier'); // Limpiar cualquier resto
            router.push('/map');
          } else if (currentTier === 'FREE') {
            // Usuario FREE - ir al mapa
            console.log('✅ Usuario FREE, redirigiendo al mapa');
            router.push('/map');
          } else {
            // Usuario sin tier - asignar FREE por defecto
            console.log('🆕 Usuario nuevo sin tier, asignando FREE');
            fetch('/api/user/assign-tier', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tier: 'FREE' }),
            })
              .then(res => res.json())
              .then(() => {
                console.log('✅ Tier FREE asignado, redirigiendo al mapa');
                router.push('/map');
              })
              .catch(error => {
                console.error('Error asignando tier FREE:', error);
                // Continuar al mapa aunque haya error
                router.push('/map');
              });
          }
        })
        .catch(error => {
          console.error('Error verificando tier del usuario:', error);
          // En caso de error, ir al mapa por defecto
          router.push('/map');
        });
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return null; // Evitar flash de contenido durante redirect
  }

  const tiers = [
    {
      id: 'FREE',
      name: translate('freePlan', language),
      price: '€0',
      period: '',
      icon: '🎯',
      features: [
        translate('basicPoisAccess', language),
        translate('gamificationSystem', language),
        translate('interactiveMap', language),
        translate('basicBadges', language),
        translate('progressStats', language),
      ],
      color: 'from-gray-500 to-gray-600',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      borderColor: 'border-gray-300',
    },
    {
      id: 'PREMIUM',
      name: translate('premiumPlan', language),
      price: '€9.99',
      period: translate('perMonth', language),
      icon: '⭐',
      popular: true,
      features: [
        translate('everythingFree', language),
        translate('allPremiumPois', language),
        translate('exclusiveBadges', language),
        translate('noAds', language),
        translate('businessDiscounts', language),
        translate('prioritySupport', language),
      ],
      color: 'from-primary-500 to-primary-700',
      buttonColor: 'bg-primary-500 hover:bg-primary-600',
      borderColor: 'border-primary-300',
    },
    {
      id: 'FAMILY',
      name: translate('familyPlan', language),
      price: '€19.99',
      period: translate('perMonth', language),
      icon: '👨‍👩‍👧‍👦',
      features: [
        translate('everythingPremium', language),
        translate('sixFamilyAccounts', language),
        translate('sharedProgress', language),
        translate('familyChallenges', language),
        translate('exclusiveEvents', language),
        translate('additionalDiscounts', language),
      ],
      color: 'from-purple-500 to-purple-700',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      borderColor: 'border-purple-300',
    },
  ];

  const handleContinue = async () => {
    if (selectedTier === 'FREE') {
      // Plan gratuito: iniciar sesión directamente
      localStorage.removeItem('selected-tier'); // Limpiar cualquier tier anterior
      await signIn('google', { callbackUrl: '/map' });
    } else {
      // Plan de pago: guardar tier, hacer login y luego ir a pago
      localStorage.setItem('selected-tier', selectedTier);
      // Redirigir a /upgrade donde se procesará el pago después del login
      await signIn('google', { callbackUrl: '/upgrade' });
    }
  };

  const handleExistingUserSignIn = async () => {
    // Para usuarios que ya tienen cuenta - no seleccionar tier específico
    localStorage.removeItem('selected-tier'); // Limpiar localStorage
    await signIn('google', { callbackUrl: '/map' });
  };

  const handleEmailAuth = () => {
    // Guardar tier seleccionado antes de mostrar form
    if (selectedTier !== 'FREE') {
      localStorage.setItem('selected-tier', selectedTier);
    } else {
      localStorage.removeItem('selected-tier');
    }
    setShowEmailAuth(true);
  };

  const getCallbackUrl = () => {
    return selectedTier === 'FREE' ? '/map' : '/upgrade';
  };

  // Determinar texto del botón basado en plan seleccionado
  const getButtonText = () => {
    if (selectedTier === 'FREE') {
      return translate('signInFree', language);
    } else {
      return translate('continueToPayment', language);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Payment Success/Error Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            {/* Icon */}
            <div className="text-center mb-6">
              {paymentModalType === 'success' && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {paymentModalType === 'error' && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {paymentModalType === 'canceled' && (
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {paymentModalType === 'success' && translate('paymentSuccessTitle', language)}
                {paymentModalType === 'error' && translate('paymentErrorTitle', language)}
                {paymentModalType === 'canceled' && translate('paymentCanceledTitle', language)}
              </h2>
              
              {/* Message */}
              <p className="text-gray-600 text-base">
                {paymentModalType === 'success' && translate('paymentSuccessMessage', language)}
                {paymentModalType === 'error' && translate('paymentErrorMessage', language)}
                {paymentModalType === 'canceled' && translate('paymentCanceledMessage', language)}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              {translate('closeButton', language)}
            </button>
          </div>
        </div>
      )}

      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en' | 'fr' | 'de' | 'it')}
          className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="es">🇪🇸 ES</option>
          <option value="en">🇺🇸 EN</option>
          <option value="fr">🇫🇷 FR</option>
          <option value="de">🇩🇪 DE</option>
          <option value="it">🇮🇹 IT</option>
        </select>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white h-[600px]">
        {/* Slideshow de imágenes de fondo */}
        <div className="absolute inset-0">
          {slideshowImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>
        
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Indicadores del slideshow */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 h-full flex items-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              🗺️ {translate('discoverEstepona', language)}
            </h1>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-lg">
              {translate('heroSubtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl">🏖️</span>
                <span>{translate('beaches', language)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl">🏛️</span>
                <span>{translate('monuments', language)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl">🍽️</span>
                <span>{translate('gastronomy', language)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-2xl">🎯</span>
                <span>{translate('challenges', language)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-50 to-transparent z-10"></div>
      </div>

      {/* Sección para usuarios existentes */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {translate('alreadyHaveAccount', language)}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {translate('existingUserMessage', language)}
          </p>
          <button
            onClick={handleExistingUserSignIn}
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            {translate('signInExisting', language)}
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {translate('choosePlanTitle', language)}
          </h2>
          <p className="text-lg text-gray-600">
            {translate('choosePlanSubtitle', language)}
          </p>
        </div>

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id as 'FREE' | 'PREMIUM' | 'FAMILY')}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                selectedTier === tier.id 
                  ? `ring-4 ring-offset-2 ${tier.borderColor.replace('border-', 'ring-')}` 
                  : tier.popular 
                  ? 'ring-2 ring-primary-500' 
                  : 'ring-1 ring-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10">
                  {translate('mostPopular', language)}
                </div>
              )}

              {selectedTier === tier.id && (
                <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-2 z-10">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className={`bg-gradient-to-br ${tier.color} text-white p-8`}>
                <div className="text-5xl mb-4">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-lg ml-1">{tier.period}</span>
                </div>
              </div>

              <div className="p-8">
                <ul className="space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
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
              </div>
            </div>
          ))}
        </div>

        {/* Botón de continuar */}
        <div className="text-center">
          {showEmailAuth ? (
            <div className="max-w-md mx-auto">
              <EmailAuthForm callbackUrl={getCallbackUrl()} />
              <button
                onClick={() => setShowEmailAuth(false)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
              >
                {translate('backToLoginOptions', language)}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección para usuarios nuevos */}
              <div className="space-y-4">
                <button
                  onClick={handleContinue}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-lg font-bold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                {getButtonText()}
              </button>
              
              <div className="flex items-center justify-center gap-4 my-6">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-sm text-gray-500">{translate('or', language)}</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              <button
                onClick={handleEmailAuth}
                className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-lg shadow-md hover:shadow-lg hover:border-purple-400 transform hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {translate('continueWithEmail', language)}
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                {selectedTier === 'FREE' 
                  ? translate('termsConditions', language)
                  : translate('paymentProcess', language)}
              </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-2">🎮</div>
            <h4 className="font-bold text-gray-800 mb-2">{translate('gamificationTitle', language)}</h4>
            <p className="text-gray-600 text-sm">
              {translate('gamificationDesc', language)}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">📱</div>
            <h4 className="font-bold text-gray-800 mb-2">{translate('nfcScanningTitle', language)}</h4>
            <p className="text-gray-600 text-sm">
              {translate('nfcScanningDesc', language)}
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🏆</div>
            <h4 className="font-bold text-gray-800 mb-2">{translate('competitionsTitle', language)}</h4>
            <p className="text-gray-600 text-sm">
              {translate('competitionsDesc', language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

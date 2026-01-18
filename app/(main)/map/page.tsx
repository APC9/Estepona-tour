'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePOIStore } from '@/lib/stores/poiStore';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { usePOIs } from '@/hooks/usePOIs';
import { useGeolocation } from '@/hooks/useGeolocation';
import { translate } from '@/lib/translations';
import POIDetailModal from '@/components/poi/POIDetailModal';
import NFCScannerButton from '@/components/nfc/NFCScannerButton';
import ScanModal from '@/components/nfc/ScanModal';
import UserProgress from '@/components/gamification/UserProgress';

// Cargar mapa dinámicamente (solo client-side)
const GameMap = dynamic(() => import('@/components/map/GameMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-game-grass">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white font-pixel text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // Si la sesión es inválida, redirigir inmediatamente
      window.location.href = '/?error=SessionInvalid';
    },
  });
  const router = useRouter();
  const { selectedPOI, selectPOI, pois } = usePOIStore();
  const { addExperience, addPoints } = useGamificationStore();
  const { language } = useLanguageStore();
  const [showScanner, setShowScanner] = useState(false);
  const [syncedWithServer, setSyncedWithServer] = useState(false);
  const [tierVerified, setTierVerified] = useState(false);
  const [verifyingTier, setVerifyingTier] = useState(true);
  const [userTier, setUserTier] = useState<string>('FREE');
  const [showAdBanner, setShowAdBanner] = useState(false);
  
  // Cargar POIs desde la API
  const { isLoading: loadingPOIs } = usePOIs();
  
  // Iniciar seguimiento de ubicación
  const { location, error: locationError } = useGeolocation();

  // Sincronizar stores con el servidor cuando se monta el componente
  useEffect(() => {
    const syncWithServer = async () => {
      if (status !== 'authenticated' || !session?.user?.email || syncedWithServer) {
        return;
      }

      try {
        console.log('🔄 Sincronizando datos del usuario con el servidor...');
        
        // Primero, limpiar los stores locales antes de sincronizar
        console.log('🧹 Limpiando stores locales antes de sincronizar...');
        usePOIStore.getState().clearVisited();
        
        // Cargar datos del usuario desde el servidor
        const userResponse = await fetch('/api/user/profile');
        if (!userResponse.ok) {
          const errorData = await userResponse.text();
          console.error('Error cargando perfil del usuario:', {
            status: userResponse.status,
            statusText: userResponse.statusText,
            error: errorData
          });
          
          // Si el usuario no existe en la BD (404), cerrar sesión y redirigir
          if (userResponse.status === 404) {
            console.warn('⚠️ Usuario no encontrado en BD - Cerrando sesión y redirigiendo...');
            await signOut({ redirect: false });
            router.push('/');
            return;
          }
          
          return;
        }
        
        const userData = await userResponse.json();
        
        console.log('👤 Datos del usuario desde el servidor:', userData);
        
        // Sincronizar gamification store
        if (userData.level !== undefined) {
          useGamificationStore.setState({
            level: userData.level,
            experiencePoints: userData.experiencePoints || 0,
            totalPoints: userData.totalPoints || 0,
          });
        }
        
        // Cargar visitas del usuario
        const visitsResponse = await fetch('/api/visits');
        if (!visitsResponse.ok) {
          console.error('Error cargando visitas del usuario');
          return;
        }
        
        const visitsData = await visitsResponse.json();
        console.log('📍 Visitas del usuario desde el servidor:', visitsData.length);
        
        // Sincronizar POI store con visitas (REEMPLAZAR, no agregar)
        const visitedPOIIds = visitsData.map((visit: any) => visit.poiId);
        usePOIStore.getState().setVisitedPOIs(visitedPOIIds);
        
        console.log('✅ Sincronización completada:', {
          level: userData.level,
          xp: userData.experiencePoints,
          points: userData.totalPoints,
          visitedPOIs: visitedPOIIds.length
        });
        
        setSyncedWithServer(true);
      } catch (error) {
        console.error('❌ Error sincronizando con servidor:', error);
      }
    };

    syncWithServer();
  }, [status, session, syncedWithServer]);

  const handlePOIClick = (poiId: string) => {
    const poi = pois.find(p => p.id === poiId);
    if (poi) {
      selectPOI(poi);
    }
  };

  // Redirect a página principal si no autenticado
  useEffect(() => {
    if (status !== 'authenticated') {
      // Si no está autenticado o aún está cargando, no hacer nada
      return;
    }
    
    // 🔒 Verificar tier y estado de pago al cargar la página
    if (session?.user && !tierVerified) {
      const pendingTier = localStorage.getItem('selected-tier');
      
      // 1. Primera verificación: localStorage tiene tier de pago pendiente
      if (pendingTier && ['PREMIUM', 'FAMILY'].includes(pendingTier)) {
        console.warn('Tier de pago pendiente detectado - redirigiendo a upgrade');
        alert('⚠️ Debes completar el pago para acceder al mapa.');
        router.push('/upgrade');
        return;
      }
      
      // 2. Segunda verificación: Consultar tier real en base de datos
      fetch('/api/user/tier')
        .then(res => res.json())
        .then(data => {
          const fetchedTier = data.tier;
          const savedTier = localStorage.getItem('selected-tier');
          
          // Si el usuario tiene tier FREE pero hay un tier de pago guardado
          if (fetchedTier === 'FREE' && savedTier && ['PREMIUM', 'FAMILY'].includes(savedTier)) {
            console.warn('Usuario con tier FREE intentando acceder sin completar pago');
            alert('⚠️ Debes completar el pago para acceder al mapa. Serás redirigido a la página de pago.');
            router.push('/upgrade');
            return;
          }
          
          // Guardar tier y mostrar banner publicitario si es FREE
          setUserTier(fetchedTier);
          if (fetchedTier === 'FREE') {
            // Mostrar el banner después de 5 segundos
            setTimeout(() => setShowAdBanner(true), 5000);
          }
          
          // Todo OK - permitir acceso
          setTierVerified(true);
          setVerifyingTier(false);
        })
        .catch(error => {
          console.error('Error verificando tier:', error);
          alert('❌ Error al verificar tu suscripción. Por favor, intenta de nuevo.');
          router.push('/');
        });
    }
  }, [status, session, router, tierVerified]);

  if (status !== 'authenticated') {
    return null; // Evitar flash de contenido durante redirect o loading
  }

  // Mostrar pantalla de carga mientras se verifica el tier
  if (status !== 'authenticated' || verifyingTier || loadingPOIs) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-game-grass">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-pixel text-sm">
            {verifyingTier ? '🔒 Verificando suscripción...' : loadingPOIs ? 'Cargando POIs...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Mensaje de error de ubicación */}
      {locationError && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1001] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">⚠️ {locationError}</p>
          <p className="text-xs mt-1">Por favor activa la ubicación en tu navegador</p>
        </div>
      )}
      
      {/* Mensaje informativo de ubicación y POIs */}
      <div className="absolute top-20 left-4 z-[1001] bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-lg text-xs">
        <p className="font-bold">Debug Info:</p>
        <p>📍 Ubicación: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'No disponible'}</p>
        <p>⭐ POIs cargados: {pois.length}</p>
      </div>
      
      {/* Mapa principal */}
      <Suspense fallback={<div>Cargando...</div>}>
        <GameMap onPOIClick={handlePOIClick} />
      </Suspense>

      {/* Barra superior con progreso del usuario */}
      <div className="absolute top-0 left-0 right-0 z-[1001]">
        <UserProgress />
      </div>

      {/* Botón flotante para escanear NFC/QR */}
      <div className="absolute bottom-8 right-8 z-[1001]">
        <NFCScannerButton onClick={() => setShowScanner(true)} />
      </div>

      {/* Modal de detalle del POI */}
      {selectedPOI && (
        <POIDetailModal
          poi={selectedPOI}
          isOpen={!!selectedPOI}
          onClose={() => selectPOI(null)}
          onScan={() => setShowScanner(true)}
        />
      )}

      {/* Modal de escaneo NFC/QR */}
      <ScanModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSuccess={(result) => {
          console.log('✅ Escaneo exitoso:', result);
          setShowScanner(false);
          // Recargar POIs para actualizar el estado de visitado
          window.location.reload();
        }}
      />

      {/* Banner publicitario - Solo para usuarios FREE */}
      {userTier === 'FREE' && showAdBanner && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[1002] w-[90%] max-w-lg animate-slide-up">
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-6 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowAdBanner(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
              aria-label={translate('dismissAd', language)}
            >
              ×
            </button>

            {/* Contenido */}
            <div className="text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {translate('adBannerTitle', language)}
              </h3>
              <p className="text-sm md:text-base text-white/90 mb-4">
                {translate('adBannerDescription', language)}
              </p>
              
              {/* Características Premium */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-300">✓</span>
                  <span>POIs Exclusivos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Sin Anuncios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Badges Especiales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-300">✓</span>
                  <span>Soporte Priority</span>
                </div>
              </div>

              {/* Botón CTA */}
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                {translate('adBannerButton', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

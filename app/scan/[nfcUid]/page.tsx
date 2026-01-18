'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/stores/languageStore';
import { translate } from '@/lib/translations';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { usePOIStore } from '@/lib/stores/poiStore';

interface ScanResult {
  success: boolean;
  visit?: {
    id: string;
    pointsEarned: number;
    xpEarned: number;
    scannedAt: string;
  };
  rewards?: {
    points: number;
    xp: number;
  };
  user?: {
    level: number;
    totalPoints: number;
    experiencePoints: number;
  };
  poi?: {
    id: string;
    nameEs: string;
    nameEn: string;
    nameFr: string;
    nameDe: string;
    nameIt: string;
    category: string;
  };
}

export default function ScanPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const { language } = useTranslation();
  const { addExperience, addPoints } = useGamificationStore();
  const { markAsVisited } = usePOIStore();
  const nfcUid = params.nfcUid as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Helper function to get POI name in current language
  const getPoiName = () => {
    if (!result?.poi) return 'POI';
    switch (language) {
      case 'en': return result.poi.nameEn;
      case 'fr': return result.poi.nameFr;
      case 'de': return result.poi.nameDe;
      case 'it': return result.poi.nameIt;
      default: return result.poi.nameEs;
    }
  };

  // No redirigir automáticamente, dejar que el usuario vea la pantalla
  // Si no está autenticado, mostraremos un botón de login

  const handleScan = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener ubicación del usuario con fallback a coordenadas de Estepona
      console.log('📍 Solicitando ubicación GPS...');
      let latitude = 36.4273; // Estepona por defecto
      let longitude = -5.1483;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // Cambiar a false para que sea más rápido
            timeout: 10000, // 10 segundos
            maximumAge: 60000, // Aceptar posición de hasta 1 minuto de antigüedad
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('✅ Ubicación GPS obtenida:', latitude, longitude);
      } catch (gpsError) {
        console.log('⚠️ GPS no disponible, usando ubicación de Estepona por defecto');
      }

      // Enviar escaneo
      const res = await fetch(`/api/scan/${nfcUid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setResult(data);
        
        // Actualizar stores locales con los datos del escaneo
        console.log('📊 Actualizando progreso del usuario:', data.rewards, data.poi?.id);
        console.log('📊 Datos completos del servidor:', data);
        
        if (data.rewards) {
          console.log('💰 Agregando puntos:', data.rewards.points);
          addPoints(data.rewards.points);
          console.log('⭐ Agregando XP:', data.rewards.xp);
          addExperience(data.rewards.xp);
        }
        if (data.poi?.id) {
          console.log('📍 Marcando POI como visitado:', data.poi.id);
          markAsVisited(data.poi.id);
        }
        
        // Log de verificación de stores después de actualizar
        setTimeout(() => {
          const gamification = useGamificationStore.getState();
          const poi = usePOIStore.getState();
          console.log('✅ Estado de stores después de actualizar:', {
            level: gamification.level,
            xp: gamification.experiencePoints,
            points: gamification.totalPoints,
            visitedCount: poi.visitedPOIs.size
          });
        }, 100);
      } else {
        if (data.alreadyVisited) {
          setError(translate('alreadyVisitedError', language));
        } else {
          setError(data.error || translate('scanProcessError', language));
        }
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      if (error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED) {
        setError(translate('locationPermissionError', language));
      } else {
        setError(translate('scanProcessError', language));
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
        <div className="text-center text-white">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>{translate('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (success && result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {translate('congratulations', language)}
          </h1>
          <p className="text-gray-600 mb-6">
            {translate('youVisited', language)} <span className="font-bold">{getPoiName()}</span>
          </p>

          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-3">{translate('youEarned', language)}</p>
            <div className="flex justify-center space-x-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  +{result?.rewards?.points ?? 0}
                </div>
                <div className="text-sm text-gray-600">💎 {translate('points', language)}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  +{result?.rewards?.xp ?? 0}
                </div>
                <div className="text-sm text-gray-600">⭐ XP</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{translate('level', language)}</span>
              <span className="text-lg font-bold text-primary-600">
                {result?.user?.level ?? 1}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">{translate('totalPoints', language)}</span>
              <span className="text-lg font-bold text-gray-800">
                {result?.user?.totalPoints ?? 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              console.log('🔄 Volviendo al mapa, estado actual de stores:', {
                level: useGamificationStore.getState().level,
                xp: useGamificationStore.getState().experiencePoints,
                points: useGamificationStore.getState().totalPoints,
                visited: usePOIStore.getState().visitedPOIs.size
              });
              router.push('/map');
            }}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition shadow-lg"
          >
            {translate('backToMap', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {translate('nfcScan', language)}
          </h1>
          <p className="text-gray-600">
            {translate('confirmVisitDescription', language)}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {status === 'unauthenticated' ? (
          <button
            onClick={() => router.push(`/api/auth/signin?callbackUrl=/scan/${nfcUid}`)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
          >
            🔐 {translate('loading', language) === 'Loading...' ? 'Iniciar Sesión' : 'Sign In'}
          </button>
        ) : (
          <button
            onClick={handleScan}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-primary-600 hover:to-primary-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {translate('processing', language)}
              </span>
            ) : (
              `🎯 ${translate('confirmVisit', language)}`
            )}
          </button>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {translate('locationPermissionNote', language)}
          </p>
        </div>
      </div>
    </div>
  );
}

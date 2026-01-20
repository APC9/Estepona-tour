'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGamificationStore } from '@/lib/stores/gamificationStore';
import { usePOIStore } from '@/lib/stores/poiStore';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';
import { translate } from '@/lib/translations';
import RewardsProgress from '@/components/rewards/RewardsProgress';

export default function UserProgress() {
  const router = useRouter();
  const { data: session } = useSession();
  const { level, experiencePoints, totalPoints } = useGamificationStore();
  const { visitedPOIs, pois } = usePOIStore();
  const { language, setLanguage } = useLanguageStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [userTier, setUserTier] = useState<string | null>(null);

  // Obtener el tier del usuario
  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const response = await fetch('/api/user/tier');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.tier);
        }
      } catch (error) {
        console.error('Error fetching user tier:', error);
      }
    };

    if (session?.user) {
      fetchUserTier();
    }
  }, [session]);

  // Calcular XP para siguiente nivel
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpProgress = (experiencePoints % xpForNextLevel) / xpForNextLevel * 100;

  const languages = [
    { code: 'es' as Language, flag: '🇪🇸', name: 'Español' },
    { code: 'en' as Language, flag: '🇬🇧', name: 'English' },
    { code: 'fr' as Language, flag: '🇫🇷', name: 'Français' },
    { code: 'de' as Language, flag: '🇩🇪', name: 'Deutsch' },
    { code: 'it' as Language, flag: '🇮🇹', name: 'Italiano' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-2 py-2 md:p-6">
        {/* Layout responsivo: compacto en móvil, espaciado en desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
          
          {/* Fila superior móvil: Usuario + Botones */}
          <div className="flex items-center justify-between lg:contents">
            {/* Info del usuario */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Usuario'}
                  width={36}
                  height={36}
                  className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-sm md:text-lg truncate max-w-[120px] md:max-w-none">
                  {session?.user?.name || 'Explorador'}
                </h3>
                <p className="text-[10px] md:text-xs text-primary-200">{translate('level', language)} {level}</p>
              </div>
            </div>

            {/* Botones (idioma + upgrade) en móvil */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Indicador de premios compacto */}
              <RewardsProgress compact />

              {/* Botón de upgrade - solo visible para usuarios FREE */}
              {userTier === 'FREE' && (
                <button
                  onClick={() => router.push('/upgrade')}
                  className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-md font-bold text-xs shadow-md whitespace-nowrap"
                  aria-label="Mejorar plan"
                >
                  ⭐ Premium
                </button>
              )}

              {/* Selector de idioma compacto */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="px-2 py-1.5 bg-white/95 text-primary-700 rounded-md shadow-md"
                  aria-label="Seleccionar idioma"
                >
                  <span className="text-lg">{currentLang.flag}</span>
                </button>

                {/* Menú desplegable móvil */}
                {showLangMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-20 min-w-[160px]">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                            language === lang.code ? 'bg-primary-50' : ''
                          }`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className={`text-sm font-medium ${
                            language === lang.code ? 'text-primary-600' : 'text-gray-700'
                          }`}>
                            {lang.name}
                          </span>
                          {language === lang.code && (
                            <span className="ml-auto text-primary-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progreso + Estadísticas en una sola fila compacta para móvil */}
          <div className="flex items-center gap-2 lg:contents">
            {/* Progreso */}
            <div className="flex-1 min-w-0 lg:max-w-md">
              <div className="w-full bg-primary-900 rounded-full h-2 md:h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-yellow-400 h-full transition-all duration-500 rounded-full shadow-sm"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] md:text-xs font-medium">Nv.{level}</span>
                <span className="text-[10px] md:text-xs font-medium">{experiencePoints} XP</span>
              </div>
            </div>

            {/* Estadísticas compactas */}
            <div className="flex gap-2 text-center flex-shrink-0">
              <div className="bg-primary-700/50 rounded px-2 py-1">
                <p className="text-sm md:text-xl font-bold">{visitedPOIs.size}</p>
                <p className="text-[9px] md:text-xs text-primary-200">POIs</p>
              </div>
              <div className="bg-primary-700/50 rounded px-2 py-1">
                <p className="text-sm md:text-xl font-bold">{totalPoints}</p>
                <p className="text-[9px] md:text-xs text-primary-200">Pts</p>
              </div>
              <div className="bg-primary-700/50 rounded px-2 py-1">
                <p className="text-sm md:text-xl font-bold">
                  {pois.length > 0 ? Math.round((visitedPOIs.size / pois.length) * 100) : 0}%
                </p>
                <p className="text-[9px] md:text-xs text-primary-200 whitespace-nowrap">Done</p>
              </div>
            </div>
          </div>

          {/* Botones desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Indicador de premios desktop */}
            <RewardsProgress compact />

            {/* Botón de upgrade - solo visible para usuarios FREE */}
            {userTier === 'FREE' && (
              <button
                onClick={() => router.push('/upgrade')}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg transition-all shadow-lg hover:shadow-xl font-bold text-sm flex-shrink-0"
                aria-label="Mejorar plan"
              >
                <span>{translate('upgradePlan', language)}</span>
              </button>
            )}

            {/* Selector de idioma desktop */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white/95 hover:bg-white text-primary-700 rounded-lg transition-all shadow-lg hover:shadow-xl border-2 border-white/50 hover:border-white"
                aria-label="Seleccionar idioma"
              >
                <span className="text-2xl">{currentLang.flag}</span>
                <span className="text-sm font-semibold">{currentLang.code.toUpperCase()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menú desplegable desktop */}
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-20 min-w-[160px]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                          language === lang.code ? 'bg-primary-50' : ''
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className={`text-sm font-medium ${
                          language === lang.code ? 'text-primary-600' : 'text-gray-700'
                        }`}>
                          {lang.name}
                        </span>
                        {language === lang.code && (
                          <span className="ml-auto text-primary-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

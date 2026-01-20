'use client';

import { useEffect, useState } from 'react';

interface RewardTier {
  id: string;
  name: string;
  emoji: string;
  pointsRequired: number;
  size: string;
  dimensions: string;
  color: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  features: string[];
}

interface RewardsShowcaseProps {
  language?: 'es' | 'en' | 'fr' | 'de' | 'it';
}

export default function RewardsShowcase({ language = 'es' }: RewardsShowcaseProps) {
  const [rewardsConfig, setRewardsConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/rewards/config');
        if (response.ok) {
          const data = await response.json();
          setRewardsConfig(data.config);
        }
      } catch (error) {
        console.error('Error fetching rewards config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const translations = {
    es: {
      title: '🏆 Premios Exclusivos',
      subtitle: 'Visita POIs, acumula puntos y gana postales sublimadas en aluminio con tu foto favorita de Estepona',
      pointsRequired: 'Puntos requeridos',
      size: 'Tamaño',
      premium: 'Exclusivo Premium',
      howItWorks: '¿Cómo funciona?',
      step1: 'Visita POIs y acumula puntos',
      step2: 'Alcanza el nivel de puntos requerido',
      step3: 'Envíanos tu foto favorita de Estepona',
      step4: 'Recibe tu postal sublimada en aluminio',
      claimReward: 'Reclamar premio',
      needsPremium: 'Requiere plan Premium',
    },
    en: {
      title: '🏆 Exclusive Rewards',
      subtitle: 'Visit POIs, accumulate points and win sublimated aluminum postcards with your favorite photo of Estepona',
      pointsRequired: 'Points required',
      size: 'Size',
      premium: 'Premium Exclusive',
      howItWorks: 'How it works?',
      step1: 'Visit POIs and accumulate points',
      step2: 'Reach the required points level',
      step3: 'Send us your favorite photo of Estepona',
      step4: 'Receive your sublimated aluminum postcard',
      claimReward: 'Claim reward',
      needsPremium: 'Requires Premium plan',
    },
    fr: {
      title: '🏆 Récompenses Exclusives',
      subtitle: 'Visitez les POI, accumulez des points et gagnez des cartes postales sublimées en aluminium avec votre photo préférée d\'Estepona',
      pointsRequired: 'Points requis',
      size: 'Taille',
      premium: 'Exclusif Premium',
      howItWorks: 'Comment ça marche?',
      step1: 'Visitez les POI et accumulez des points',
      step2: 'Atteignez le niveau de points requis',
      step3: 'Envoyez-nous votre photo préférée d\'Estepona',
      step4: 'Recevez votre carte postale sublimée en aluminium',
      claimReward: 'Réclamer la récompense',
      needsPremium: 'Nécessite un plan Premium',
    },
    de: {
      title: '🏆 Exklusive Belohnungen',
      subtitle: 'Besuchen Sie POIs, sammeln Sie Punkte und gewinnen Sie sublimierte Aluminium-Postkarten mit Ihrem Lieblingsfoto von Estepona',
      pointsRequired: 'Erforderliche Punkte',
      size: 'Größe',
      premium: 'Premium Exklusiv',
      howItWorks: 'Wie funktioniert es?',
      step1: 'Besuchen Sie POIs und sammeln Sie Punkte',
      step2: 'Erreichen Sie die erforderliche Punktzahl',
      step3: 'Senden Sie uns Ihr Lieblingsfoto von Estepona',
      step4: 'Erhalten Sie Ihre sublimierte Aluminium-Postkarte',
      claimReward: 'Belohnung einlösen',
      needsPremium: 'Erfordert Premium-Plan',
    },
    it: {
      title: '🏆 Premi Esclusivi',
      subtitle: 'Visita i POI, accumula punti e vinci cartoline sublimate in alluminio con la tua foto preferita di Estepona',
      pointsRequired: 'Punti richiesti',
      size: 'Dimensione',
      premium: 'Esclusivo Premium',
      howItWorks: 'Come funziona?',
      step1: 'Visita i POI e accumula punti',
      step2: 'Raggiungi il livello di punti richiesto',
      step3: 'Inviaci la tua foto preferita di Estepona',
      step4: 'Ricevi la tua cartolina sublimata in alluminio',
      claimReward: 'Reclama premio',
      needsPremium: 'Richiede piano Premium',
    },
  };

  const t = translations[language];

  if (loading || !rewardsConfig) {
    return (
      <div className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const rewards: RewardTier[] = [
    {
      id: 'bronze',
      name: rewardsConfig.BRONZE.name,
      emoji: rewardsConfig.BRONZE.emoji,
      pointsRequired: rewardsConfig.BRONZE.pointsRequired,
      size: rewardsConfig.BRONZE.size,
      dimensions: rewardsConfig.BRONZE.size,
      color: 'from-amber-700 to-amber-900',
      gradient: 'bg-gradient-to-br from-amber-700 to-amber-900',
      borderColor: 'border-amber-600',
      glowColor: 'shadow-amber-500/50',
      features: [
        'Postal 10x15 cm',
        'Sublimación en aluminio',
        'Tu foto personalizada',
        'Acabado mate',
      ],
    },
    {
      id: 'silver',
      name: rewardsConfig.SILVER.name,
      emoji: rewardsConfig.SILVER.emoji,
      pointsRequired: rewardsConfig.SILVER.pointsRequired,
      size: rewardsConfig.SILVER.size,
      dimensions: rewardsConfig.SILVER.size,
      color: 'from-gray-400 to-gray-600',
      gradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
      borderColor: 'border-gray-500',
      glowColor: 'shadow-gray-500/50',
      features: [
        'Postal 15x20 cm',
        'Sublimación en aluminio premium',
        'Tu foto personalizada',
        'Acabado brillante',
        'Marco incluido',
      ],
    },
    {
      id: 'gold',
      name: rewardsConfig.GOLD.name,
      emoji: rewardsConfig.GOLD.emoji,
      pointsRequired: rewardsConfig.GOLD.pointsRequired,
      size: rewardsConfig.GOLD.size,
      dimensions: rewardsConfig.GOLD.size,
      color: 'from-yellow-400 to-yellow-600',
      gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      borderColor: 'border-yellow-500',
      glowColor: 'shadow-yellow-500/50',
      features: [
        'Postal 20x30 cm',
        'Sublimación en aluminio de lujo',
        'Tu foto personalizada',
        'Acabado espejo',
        'Marco premium incluido',
        'Certificado de autenticidad',
        'Envío express gratuito',
      ],
    },
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-primary-100 text-primary-800 rounded-full font-semibold">
            <span className="text-2xl mr-2">⭐</span>
            {t.premium}
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {rewards.map((reward, index) => (
            <div
              key={reward.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${reward.glowColor}`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Badge en la esquina */}
              <div className={`absolute top-4 right-4 ${reward.gradient} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10`}>
                {reward.emoji} {reward.name}
              </div>

              {/* Header con gradiente */}
              <div className={`${reward.gradient} text-white p-8 relative overflow-hidden`}>
                {/* Patrón de fondo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`,
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 text-center">{reward.emoji}</div>
                  <h3 className="text-3xl font-bold text-center mb-2">{reward.name}</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{reward.pointsRequired}</div>
                    <div className="text-sm opacity-90">{t.pointsRequired}</div>
                  </div>
                </div>
              </div>

              {/* Imagen representativa de aluminio */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 ${reward.gradient} opacity-20`}></div>
                <div className="relative z-10 text-center p-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg inline-block">
                    <div className="text-5xl mb-2">📸</div>
                    <div className="text-gray-700 font-semibold">{t.size}</div>
                    <div className="text-sm text-gray-600">{reward.dimensions}</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {reward.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                          reward.id === 'gold' ? 'text-yellow-500' :
                          reward.id === 'silver' ? 'text-gray-500' :
                          'text-amber-700'
                        }`}
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
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual separator */}
              <div className={`h-1 ${reward.gradient}`}></div>
            </div>
          ))}
        </div>

        {/* How it works section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {t.howItWorks}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '🗺️', text: t.step1, color: 'bg-blue-100 text-blue-700' },
              { icon: '📈', text: t.step2, color: 'bg-green-100 text-green-700' },
              { icon: '📸', text: t.step3, color: 'bg-purple-100 text-purple-700' },
              { icon: '🎁', text: t.step4, color: 'bg-yellow-100 text-yellow-700' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} rounded-full text-3xl mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-gray-700 px-2">
                  {step.text}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <svg className="w-8 h-8 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Premium */}
        <div className="mt-12 text-center bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            ⭐ {t.needsPremium}
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Actualiza a Premium para desbloquear todos los POIs, acumular puntos más rápido y acceder a estos premios exclusivos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-2xl">🎯</span>
              <span className="font-semibold">POIs ilimitados</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-2xl">⚡</span>
              <span className="font-semibold">Puntos x2</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-2xl">🏆</span>
              <span className="font-semibold">Premios exclusivos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

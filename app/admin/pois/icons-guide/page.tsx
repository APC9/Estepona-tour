'use client';

import { useRouter } from 'next/navigation';

export default function IconsGuidePage() {
  const router = useRouter();

  const categories = [
    { 
      name: 'Restaurante', 
      value: 'RESTAURANT', 
      icon: '⭐', 
      color: 'border-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Para restaurantes, bares y cafeterías',
      defaultPoints: 10,
      defaultXP: 50
    },
    { 
      name: 'Monumento', 
      value: 'MONUMENT', 
      icon: '🏛️', 
      color: 'border-amber-600',
      bgColor: 'bg-amber-100',
      description: 'Edificios históricos y monumentos',
      defaultPoints: 20,
      defaultXP: 100
    },
    { 
      name: 'Museo', 
      value: 'MUSEUM', 
      icon: '🖼️', 
      color: 'border-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Museos y galerías de arte',
      defaultPoints: 25,
      defaultXP: 120
    },
    { 
      name: 'Mirador', 
      value: 'VIEWPOINT', 
      icon: '👁️', 
      color: 'border-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Puntos con vistas panorámicas',
      defaultPoints: 15,
      defaultXP: 75
    },
    { 
      name: 'Playa', 
      value: 'BEACH', 
      icon: '🏖️', 
      color: 'border-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'Playas y zonas costeras',
      defaultPoints: 10,
      defaultXP: 50
    },
    { 
      name: 'Parque', 
      value: 'PARK', 
      icon: '🌳', 
      color: 'border-green-600',
      bgColor: 'bg-green-100',
      description: 'Parques y jardines públicos',
      defaultPoints: 10,
      defaultXP: 50
    },
    { 
      name: 'Histórico', 
      value: 'HISTORIC', 
      icon: '🏰', 
      color: 'border-stone-600',
      bgColor: 'bg-stone-100',
      description: 'Lugares de interés histórico',
      defaultPoints: 30,
      defaultXP: 150
    },
    { 
      name: 'Cultural', 
      value: 'CULTURE', 
      icon: '🎭', 
      color: 'border-pink-600',
      bgColor: 'bg-pink-100',
      description: 'Teatros, espacios culturales',
      defaultPoints: 15,
      defaultXP: 75
    },
    { 
      name: 'Naturaleza', 
      value: 'NATURE', 
      icon: '🌿', 
      color: 'border-lime-600',
      bgColor: 'bg-lime-100',
      description: 'Espacios naturales y reservas',
      defaultPoints: 20,
      defaultXP: 100
    },
    { 
      name: 'Tienda', 
      value: 'SHOPPING', 
      icon: '🛍️', 
      color: 'border-rose-600',
      bgColor: 'bg-rose-100',
      description: 'Comercios y tiendas',
      defaultPoints: 5,
      defaultXP: 25
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🎨 Guía de Insignias
              </h1>
              <p className="text-gray-600 mt-2">
                Cada tipo de POI tiene su propia insignia y colores en el mapa
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/pois')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Información importante
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Restaurantes</strong> mantienen la insignia de estrella ⭐</li>
            <li>• <strong>Sitios públicos</strong> (monumentos, museos, miradores) tienen insignias específicas</li>
            <li>• Los colores cambian a <strong className="text-green-600">verde</strong> cuando el POI ha sido visitado</li>
            <li>• Puedes personalizar los puntos y XP de cada POI al crearlo o editarlo</li>
            <li>• Los valores sugeridos varían según la categoría del POI</li>
          </ul>
        </div>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.value}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow`}
            >
              <div className={`${category.bgColor} p-6 text-center`}>
                <div className="flex justify-center mb-4">
                  {/* Insignia simulada */}
                  <div className="relative">
                    <div className={`w-20 h-20 bg-white rounded-full border-4 ${category.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-4xl">{category.icon}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Código:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {category.value}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Color:</span>
                  <div className={`w-8 h-8 rounded border-4 ${category.color}`}></div>
                </div>
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Valores sugeridos:</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-semibold">💎 {category.defaultPoints} puntos</span>
                    <span className="text-purple-600 font-semibold">⭐ {category.defaultXP} XP</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de Estados */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            🎯 Estados del Marcador
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* No visitado */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute w-16 h-16 bg-yellow-300 rounded-full opacity-30 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-full border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">No Visitado</h4>
              <p className="text-sm text-gray-600">
                Brillo animado y colores vibrantes
              </p>
            </div>

            {/* Premium */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-lg">
                    👑
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Premium</h4>
              <p className="text-sm text-gray-600">
                Corona dorada indica contenido exclusivo
              </p>
            </div>

            {/* Visitado */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative opacity-60">
                  <div className="w-10 h-10 bg-white rounded-full border-4 border-green-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-lg">
                    ✓
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Visitado</h4>
              <p className="text-sm text-gray-600">
                Check verde y colores atenuados
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
          <h3 className="font-bold text-primary-800 mb-3 text-lg">
            ⚙️ Configuración de Puntos y XP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-700">
            <div>
              <h4 className="font-semibold mb-2">💎 Puntos (Points)</h4>
              <ul className="space-y-1 ml-4">
                <li>• 5-10: Lugares comunes o comerciales</li>
                <li>• 10-20: Lugares turísticos regulares</li>
                <li>• 20-30: Monumentos importantes</li>
                <li>• 30+: Lugares excepcionales o históricos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⭐ Experiencia (XP)</h4>
              <ul className="space-y-1 ml-4">
                <li>• 25-50: Visitas rápidas</li>
                <li>• 50-100: Experiencias estándar</li>
                <li>• 100-150: Lugares significativos</li>
                <li>• 150+: Experiencias premium</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePOIStore } from '@/lib/stores/poiStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { translate, translateNested } from '@/lib/translations';

// Configuración del mapa
const ESTEPONA_CENTER: [number, number] = [36.4273, -5.1483];
const DEFAULT_ZOOM = 17;
const MAX_ZOOM = 19;
const MIN_ZOOM = 13;

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/markers/marker-icon-2x.png',
  iconUrl: '/markers/marker-icon.png',
  shadowUrl: '/markers/marker-shadow.png',
});

interface GameMapProps {
  onPOIClick?: (poiId: string) => void;
}

export default function GameMap({ onPOIClick }: GameMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const poiMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const { pois, visitedPOIs, selectPOI } = usePOIStore();
  const { location } = useUserStore();
  const { language } = useLanguageStore();

  const [isClient, setIsClient] = useState(false);

  // Inicializar mapa
  useEffect(() => {
    setIsClient(true);

    if (!mapContainerRef.current || mapRef.current) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: ESTEPONA_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      zoomControl: true,
      attributionControl: false,
    });

    // Agregar tile layer con estilo personalizado
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      className: 'map-tiles',
      maxZoom: MAX_ZOOM,
      maxNativeZoom: 19, // OSM solo provee hasta nivel 19
    }).addTo(map);

    // Agregar control de atribución personalizado
    L.control
      .attribution({
        position: 'bottomright',
        prefix: false,
      })
      .addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar marcador del jugador
  useEffect(() => {
    if (!isClient || !mapRef.current || !location) {
      console.log('❌ No se puede crear avatar:', { isClient, hasMap: !!mapRef.current, hasLocation: !!location });
      return;
    }

    const { latitude, longitude } = location;
    console.log('🎯 Intentando crear avatar:', latitude, longitude);

    // Esperar a que el mapa esté completamente inicializado
    const createAvatar = () => {
      if (!mapRef.current) return;

      // Eliminar marcador anterior si existe
      if (playerMarkerRef.current) {
        console.log('🗑️ Eliminando avatar anterior');
        playerMarkerRef.current.remove();
        playerMarkerRef.current = null;
      }

      console.log('🎨 Creando nuevo avatar con Tailwind...');

      // Crear marcador del jugador usando el MISMO patrón que los POIs (que funcionan)
      const playerIcon = L.divIcon({
        className: 'player-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse-slow"></div>
            <div class="relative z-10 w-14 h-14 bg-blue-500 border-4 border-white rounded-full shadow-2xl flex items-center justify-center">
              <svg class="w-8 h-8 fill-white" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [64, 64],
        iconAnchor: [32, 32],
      });

      const marker = L.marker([latitude, longitude], {
        icon: playerIcon,
        zIndexOffset: 10000,
      });

      // Agregar al mapa
      marker.addTo(mapRef.current);
      playerMarkerRef.current = marker;

      console.log('✅ Avatar agregado al mapa');

      // Verificar renderizado en el DOM después de que Leaflet lo procese
      setTimeout(() => {
        const element = marker.getElement();
        console.log('🔍 Verificando elemento en DOM...');
        console.log('Elemento:', element);
        
        if (element) {
          console.log('✅ ¡Avatar encontrado en DOM!');
          console.log('HTML:', element.outerHTML);
          console.log('Clases:', element.className);
          console.log('Estilos inline:', element.style.cssText);
          
          // Forzar visibilidad
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.style.opacity = '1';
        } else {
          console.error('❌ Avatar NO está en DOM después de 200ms');
          console.error('Marker object:', marker);
          console.error('Has pane:', !!mapRef.current?.getPane('markerPane'));
        }
      }, 200);

      // NO centrar automáticamente - el usuario puede usar el botón si lo desea
      // mapRef.current.setView([latitude, longitude], DEFAULT_ZOOM);
    };

    // Crear avatar con un pequeño delay para asegurar que el mapa esté listo
    const timer = setTimeout(createAvatar, 100);
    
    return () => clearTimeout(timer);
  }, [location, isClient]);

  // Renderizar marcadores de POIs
  useEffect(() => {
    if (!mapRef.current || !isClient || !pois || pois.length === 0) return;

    // Limpiar marcadores antiguos
    poiMarkersRef.current.forEach((marker) => marker.remove());
    poiMarkersRef.current.clear();

    // Crear marcadores para cada POI
    pois.forEach((poi) => {
      if (!poi || !poi.id || !poi.lat || !poi.lng) return;
      
      const isVisited = visitedPOIs ? visitedPOIs.has(poi.id) : false;
      
      // Icono personalizado según categoría
      const categoryConfig = getCategoryConfig(poi.category);
      const markerIcon = L.divIcon({
        className: 'poi-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${
              !isVisited
                ? `<div class="absolute w-16 h-16 ${categoryConfig.glowColor} rounded-full opacity-30 animate-glow"></div>`
                : ''
            }
            <div class="relative z-10 ${
              isVisited ? 'opacity-60' : 'animate-pulse'
            }">
              <div class="${
                isVisited ? 'w-10 h-10' : 'w-12 h-12'
              } drop-shadow-2xl flex items-center justify-center text-3xl bg-white rounded-full border-4 ${
                isVisited ? categoryConfig.borderVisited : categoryConfig.border
              }">
                ${categoryConfig.icon}
              </div>
            </div>
            ${
              poi.premiumOnly
                ? '<div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-lg">👑</div>'
                : ''
            }
            ${
              isVisited
                ? '<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-lg">✓</div>'
                : ''
            }
          </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      // Helper para obtener texto en el idioma actual
      const getText = (field: any): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
          // Mapeo de códigos de idioma
          const langMap: Record<string, string> = {
            'es': 'es',
            'en': 'en', 
            'fr': 'fr',
            'de': 'de',
            'it': 'it'
          };
          const currentLang = langMap[language] || 'es';
          return field[currentLang] || field.es || field.en || '';
        }
        return '';
      };

      // Extraer datos del POI de forma segura usando el idioma actual
      const poiName = getText(poi.name) || 'POI';
      const poiDescription = getText(poi.description) || '';
      const poiAddress = poi.address || '';
      const poiCategory = poi.category || 'POI';
      const poiPoints = typeof poi.points === 'number' ? poi.points : 0;
      const poiXP = typeof poi.xpReward === 'number' ? poi.xpReward : 0;
      const poiPremium = poi.premiumOnly === true;
      
      const marker = L.marker([poi.lat, poi.lng], {
        icon: markerIcon,
        title: poiName,
      }).addTo(mapRef.current!);

      // Click handler
      marker.on('click', () => {
        selectPOI(poi);
        if (onPOIClick) {
          onPOIClick(poi.id);
        }
      });

      // Popup con información detallada
      marker.bindPopup(
        `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2 text-gray-800">${poiName}</h3>
          <div class="space-y-2">
            <div class="flex items-center text-sm">
              <span class="mr-2">${getCategoryIcon(poiCategory)}</span>
              <span class="text-gray-600">${translateNested('categories', poiCategory, language)}</span>
            </div>
            ${poiAddress ? `<p class="text-xs text-gray-500">📍 ${poiAddress}</p>` : ''}
            <div class="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
              <span class="text-blue-600 font-semibold">💎 ${poiPoints} ${translate('points', language)}</span>
              <span class="text-purple-600 font-semibold">⭐ ${poiXP} XP</span>
            </div>
            ${poiPremium ? `<p class="text-xs text-yellow-600 font-semibold">👑 ${translate('premium', language)}</p>` : ''}
            ${isVisited ? `<p class="text-green-600 text-sm font-semibold mt-2">✓ ${translate('alreadyVisited', language)}</p>` : `<p class="text-primary-600 text-sm font-semibold mt-2">👆 ${translate('clickForDetails', language)}</p>`}
          </div>
        </div>
      `,
        {
          className: 'poi-popup',
          maxWidth: 300,
        }
      );

      poiMarkersRef.current.set(poi.id, marker);
    });
  }, [pois, visitedPOIs, isClient, selectPOI, onPOIClick, language]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay de UI */}
      <div className="absolute bottom-32 right-4 z-[1100] space-y-2">
        <button
          onClick={() => {
            if (location && mapRef.current) {
              mapRef.current.setView([location.latitude, location.longitude], DEFAULT_ZOOM);
            }
          }}
          className="bg-blue-500 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 transition-all hover:scale-110 border-4 border-white"
          title="Ir a mi ubicación"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Contador de POIs */}
      <div className="absolute bottom-20 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">
          {translate('poisCounter', language)}: {visitedPOIs.size}/{pois.length}
        </p>
      </div>
    </div>
  );
}

// Configuración de insignias por categoría
function getCategoryConfig(category: string) {
  const configs: Record<string, { icon: string; border: string; borderVisited: string; glowColor: string }> = {
    MONUMENT: { 
      icon: '<img src="/monumentos.png" alt="Monument" class="w-8 h-8" />', 
      border: 'border-amber-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-amber-600' 
    },
    MUSEUM: { 
      icon: '<img src="/museo.png" alt="Museum" class="w-8 h-8" />', 
      border: 'border-purple-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-purple-600' 
    },
    VIEWPOINT: { 
      icon: '<img src="/mirador.png" alt="Viewpoint" class="w-8 h-8" />', 
      border: 'border-blue-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-blue-600' 
    },
    RESTAURANT: { 
      icon: '<img src="/restaurantes.png" alt="Restaurant" class="w-8 h-8" />', 
      border: 'border-yellow-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-yellow-600' 
    },
    BEACH: { 
      icon: '<img src="/playas.png" alt="Beach" class="w-8 h-8" />', 
      border: 'border-cyan-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-cyan-600' 
    },
    PARK: { 
      icon: '<img src="/parque.png" alt="Park" class="w-8 h-8" />', 
      border: 'border-green-600', 
      borderVisited: 'border-green-700',
      glowColor: 'bg-green-600' 
    },
    HISTORIC: { 
      icon: '<img src="/monumentos.png" alt="Historic" class="w-8 h-8" />', 
      border: 'border-stone-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-stone-600' 
    },
    CULTURE: { 
      icon: '<img src="/mural.png" alt="Culture" class="w-8 h-8" />', 
      border: 'border-pink-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-pink-600' 
    },
    NATURE: { 
      icon: '<img src="/parque.png" alt="Nature" class="w-8 h-8" />', 
      border: 'border-lime-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-lime-600' 
    },
    SHOPPING: { 
      icon: '<img src="/shopping.svg" alt="Shopping" class="w-8 h-8" />', 
      border: 'border-rose-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-rose-600' 
    },
    BAR: { 
      icon: '<img src="/bar.png" alt="Bar" class="w-8 h-8" />', 
      border: 'border-orange-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-orange-600' 
    },
    NIGHTCLUB: { 
      icon: '<img src="/discotecas.png" alt="Nightclub" class="w-8 h-8" />', 
      border: 'border-indigo-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-indigo-600' 
    },
    PORT: { 
      icon: '<img src="/puerto.svg" alt="Port" class="w-8 h-8" />', 
      border: 'border-teal-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-teal-600' 
    },
    ENTERTAINMENT: { 
      icon: '<img src="/diversion.svg" alt="Entertainment" class="w-8 h-8" />', 
      border: 'border-fuchsia-600', 
      borderVisited: 'border-green-600',
      glowColor: 'bg-fuchsia-600' 
    },
  };
  return configs[category] || { 
    icon: '<img src="/icon.svg" alt="POI" class="w-8 h-8" />', 
    border: 'border-gray-600', 
    borderVisited: 'border-green-600',
    glowColor: 'bg-gray-600' 
  };
}

// Helper para obtener icono según categoría
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    MONUMENT: '🏛️',
    MUSEUM: '🖼️',
    VIEWPOINT: '👁️',
    RESTAURANT: '🍽️',
    BEACH: '🏖️',
    PARK: '🌳',
    HISTORIC: '🏰',
    CULTURE: '🎭',
    NATURE: '🌿',
    SHOPPING: '🛍️',
    BAR: '🍺',
    NIGHTCLUB: '💃',
    PORT: '⚓',
    ENTERTAINMENT: '🎪',
  };
  return icons[category] || '📍';
}

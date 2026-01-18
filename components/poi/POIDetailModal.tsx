'use client';

import Image from 'next/image';
import { POI } from '@/lib/stores/poiStore';
import { useState } from 'react';
import { useTranslation } from '@/lib/stores/languageStore';
import { translate, translateNested } from '@/lib/translations';

interface POIDetailModalProps {
  poi: POI;
  isOpen: boolean;
  onClose: () => void;
  onScan: () => void;
}

export default function POIDetailModal({ poi, isOpen, onClose, onScan }: POIDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showExternalLink, setShowExternalLink] = useState(false);
  const { language, t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[1001] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header con imagen */}
        <div className="relative h-64">
          {poi.images && poi.images.length > 0 ? (
            <>
              <Image
                src={poi.images[currentImageIndex]}
                alt={t(poi.name)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              {poi.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {poi.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-6xl">{getCategoryIcon(poi.category)}</span>
            </div>
          )}
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
          >
            ✕
          </button>

          {/* Badge Premium */}
          {poi.premiumOnly && (
            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center">
              👑 {translate('premium', language)}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t(poi.name)}</h2>
              <p className="text-gray-500 flex items-center">
                <span className="mr-2">{getCategoryIcon(poi.category)}</span>
                {translateNested('categories', poi.category, language)}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mb-2">
                +{poi.points} {translate('points', language)}
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                +{poi.xpReward} XP
              </div>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-gray-700 mb-4 leading-relaxed">{t(poi.description)}</p>

          {/* Información adicional */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl mb-1">⏱️</p>
              <p className="text-xs text-gray-600">{poi.duration} min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">
                {poi.difficulty === 'EASY' ? '🟢' : poi.difficulty === 'MEDIUM' ? '🟡' : '🔴'}
              </p>
              <p className="text-xs text-gray-600">{translateNested('difficulty', poi.difficulty.toLowerCase(), language)}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1">📍</p>
              <p className="text-xs text-gray-600">{poi.address}</p>
            </div>
          </div>

          {/* Audio guide si existe */}
          {poi.audioGuide && t(poi.audioGuide) && (
            <div className="mb-6">
              <h3 className="font-bold mb-2 flex items-center">
                🎧 {translate('audioGuideAvailable', language)}
              </h3>
              <audio controls className="w-full">
                <source src={t(poi.audioGuide)} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* Enlace externo si existe */}
          {poi.externalLink && (
            <button
              onClick={() => setShowExternalLink(true)}
              className="mb-4 w-full bg-blue-50 border-2 border-blue-300 text-blue-700 py-3 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-blue-100 transition"
            >
              🔗 Ver más información
            </button>
          )}

          {/* Botón principal */}
          <button
            onClick={onScan}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition shadow-lg"
          >
            🎯 {translate('scanToUnlock', language)}
          </button>

          {/* Botón navegar */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-center block hover:bg-gray-50 transition"
          >
            🧭 {translate('navigateHere', language)}
          </a>
        </div>
      </div>

      {/* Modal iframe para enlace externo */}
      {showExternalLink && poi.externalLink && (
        <div className="absolute inset-0 z-[1002] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={() => setShowExternalLink(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg truncate">{t(poi.name)}</h3>
              <button
                onClick={() => setShowExternalLink(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0 ml-2"
              >
                ✕
              </button>
            </div>
            <iframe
              src={poi.externalLink}
              className="w-full flex-1 rounded-b-2xl"
              title={t(poi.name)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    MONUMENT: '🏛️',
    MUSEUM: '🏛️',
    VIEWPOINT: '👁️',
    RESTAURANT: '🍽️',
    BEACH: '🏖️',
    PARK: '🌳',
    HISTORIC: '🏰',
    CULTURE: '🎭',
    NATURE: '🌿',
    SHOPPING: '🛍️',
  };
  return icons[category] || '📍';
}

'use client';

import { useLanguageStore } from '@/lib/stores/languageStore';
import { translate } from '@/lib/translations';

export default function NotFound() {
  const { language } = useLanguageStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-9xl font-bold text-primary-600 mb-4">404</h2>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {translate('pageNotFound', language)}
        </h3>
        <p className="text-gray-600 mb-8">
          {translate('pageNotFoundDesc', language)}
        </p>
        <a 
          href="/map" 
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {translate('backToMap', language)}
        </a>
      </div>
    </div>
  );
}
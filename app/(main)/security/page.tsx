'use client';

import { useState } from 'react';
import ActiveSessions from '@/components/auth/ActiveSessions';

/**
 * Página de configuración de seguridad del usuario
 * 
 * Permite gestionar:
 * - Sesiones activas
 * - Configuración de 2FA (futuro)
 * - Historial de actividad
 */
export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'activity' | 'settings'>('sessions');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔒 Seguridad de la cuenta
          </h1>
          <p className="text-gray-600">
            Gestiona tus sesiones activas y configuración de seguridad
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'sessions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sesiones activas
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'activity'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Actividad reciente
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuración
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'sessions' && <ActiveSessions />}
        
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Actividad reciente</h2>
            <p className="text-gray-500">Próximamente...</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración de seguridad</h2>
            <p className="text-gray-500">Próximamente...</p>
          </div>
        )}

        {/* Security Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            💡 Consejos de seguridad
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Cierra sesión en dispositivos que ya no uses</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Revisa regularmente tus sesiones activas</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Si ves actividad sospechosa, cierra todas las sesiones</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>No compartas tu cuenta con otras personas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

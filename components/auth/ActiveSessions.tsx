'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Session {
  sessionToken: string;
  userId: string;
  deviceFingerprint: string;
  lastIp: string | null;
  lastUserAgent: string | null;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
  suspicious: boolean;
}

/**
 * Componente para gestionar sesiones activas del usuario
 * 
 * Características:
 * - Lista todas las sesiones activas
 * - Muestra información del dispositivo, IP, última actividad
 * - Permite revocar sesiones individuales
 * - Permite cerrar todas las sesiones excepto la actual
 * - Marca sesiones sospechosas
 */
export default function ActiveSessions() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Cargar sesiones al montar
  useEffect(() => {
    if (status === 'authenticated') {
      loadSessions();
    }
  }, [status]);

  /**
   * Carga sesiones activas desde API
   */
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/sessions');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar sesiones');
      }

      setSessions(data.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revoca una sesión específica
   */
  const revokeSession = async (sessionToken: string) => {
    if (!confirm('¿Estás seguro de que quieres cerrar esta sesión?')) {
      return;
    }

    try {
      setRevoking(sessionToken);

      const res = await fetch('/api/auth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          reason: 'Revocado manualmente por el usuario',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al revocar sesión');
      }

      // Recargar sesiones
      await loadSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al revocar sesión');
    } finally {
      setRevoking(null);
    }
  };

  /**
   * Revoca todas las sesiones excepto la actual
   */
  const revokeOtherSessions = async () => {
    const otherSessions = sessions.filter((s) => !s.isCurrent);
    if (otherSessions.length === 0) {
      alert('No hay otras sesiones activas');
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que quieres cerrar ${otherSessions.length} sesión(es)?`
      )
    ) {
      return;
    }

    try {
      setRevoking('all');

      // Revocar cada sesión excepto la actual
      for (const sess of otherSessions) {
        await fetch('/api/auth/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sess.sessionToken,
            reason: 'Cerrar otras sesiones',
          }),
        });
      }

      // Recargar sesiones
      await loadSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al revocar sesiones');
    } finally {
      setRevoking(null);
    }
  };

  /**
   * Formatea fecha relativa
   */
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  /**
   * Extrae nombre del dispositivo del User Agent
   */
  const getDeviceName = (userAgent: string | null): string => {
    if (!userAgent) return 'Dispositivo desconocido';

    if (userAgent.includes('Mobile')) return '📱 Móvil';
    if (userAgent.includes('Tablet')) return '📱 Tablet';
    if (userAgent.includes('Windows')) return '💻 Windows PC';
    if (userAgent.includes('Mac')) return '💻 Mac';
    if (userAgent.includes('Linux')) return '💻 Linux';
    return '🖥️ Computadora';
  };

  /**
   * Extrae navegador del User Agent
   */
  const getBrowserName = (userAgent: string | null): string => {
    if (!userAgent) return '';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Otro navegador';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Sesiones activas</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sesiones activas</h2>
        {sessions.length > 1 && (
          <button
            onClick={revokeOtherSessions}
            disabled={revoking === 'all'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {revoking === 'all' ? 'Cerrando...' : 'Cerrar otras sesiones'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay sesiones activas</p>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.sessionToken}
              className={`border rounded-lg p-4 ${
                sess.isCurrent
                  ? 'border-green-500 bg-green-50'
                  : sess.suspicious
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Dispositivo */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {getDeviceName(sess.lastUserAgent)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {getBrowserName(sess.lastUserAgent)}
                    </span>
                    {sess.isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Esta sesión
                      </span>
                    )}
                    {sess.suspicious && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        ⚠️ Sospechosa
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-semibold">IP:</span>{' '}
                      {sess.lastIp || 'Desconocida'}
                    </p>
                    <p>
                      <span className="font-semibold">Última actividad:</span>{' '}
                      {formatRelativeTime(sess.lastActivity)}
                    </p>
                    <p>
                      <span className="font-semibold">Sesión iniciada:</span>{' '}
                      {new Date(sess.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* Botón de revocar */}
                {!sess.isCurrent && (
                  <button
                    onClick={() => revokeSession(sess.sessionToken)}
                    disabled={revoking === sess.sessionToken}
                    className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {revoking === sess.sessionToken ? 'Cerrando...' : 'Cerrar'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip de seguridad:</strong> Si ves una sesión que no reconoces,
          ciérrala inmediatamente y cambia tu contraseña.
        </p>
      </div>
    </div>
  );
}

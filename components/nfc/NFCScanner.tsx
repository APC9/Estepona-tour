'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useVisitPOI } from '@/hooks/usePOIs';
import { useGamificationStore } from '@/lib/stores/gamificationStore';

interface VisitResult {
  success: boolean;
  poi?: {
    id: string;
    name: string;
  };
  rewards?: {
    points: number;
    xp: number;
  };
  message?: string;
}

interface NFCScannerProps {
  onSuccess?: (result: VisitResult) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export default function NFCScanner({ onSuccess, onError, onClose }: NFCScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [nfcSupported, setNfcSupported] = useState(false);
  
  const { location } = useUserStore();
  const { visitPOI } = useVisitPOI();
  const { addExperience, addPoints } = useGamificationStore();

  // Verificar soporte NFC
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
      setStatus('error');
      setMessage('Tu dispositivo no soporta NFC. Usa el escáner QR en su lugar.');
    }
  }, []);

  const startNFCScan = async () => {
    if (!nfcSupported) return;

    try {
      setIsScanning(true);
      setStatus('scanning');
      setMessage('Acerca tu dispositivo a la etiqueta NFC...');

      // @ts-expect-error - NDEFReader es experimental
      const ndef = new NDEFReader();
      
      // Solicitar permiso
      await ndef.scan();

      // Escuchar eventos de lectura
      ndef.addEventListener('reading', async ({ serialNumber }: { message: unknown; serialNumber: string }) => {
        
        setStatus('scanning');
        setMessage('Etiqueta detectada, procesando...');

        try {
          // Extraer datos del NFC
          const nfcUid = serialNumber;
          
          // Registrar visita
          const result = await visitPOI('', {
            nfcUid,
            latitude: location?.latitude,
            longitude: location?.longitude,
            deviceInfo: navigator.userAgent,
          });

          // Actualizar gamificación
          if (result.rewards) {
            addPoints(result.rewards.points);
            addExperience(result.rewards.xp);
          }

          setStatus('success');
          setMessage(`¡POI desbloqueado! +${result.rewards.points} pts, +${result.rewards.xp} XP`);
          
          if (onSuccess) {
            onSuccess(result);
          }

          // Auto-cerrar después de 3 segundos
          setTimeout(() => {
            if (onClose) onClose();
          }, 3000);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al procesar la etiqueta NFC';
          setStatus('error');
          setMessage(errorMessage);
          
          if (onError) {
            onError(errorMessage);
          }
        } finally {
          setIsScanning(false);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setStatus('error');
        setMessage('Error al leer la etiqueta NFC. Intenta de nuevo.');
        setIsScanning(false);
      });

    } catch (error) {
      setStatus('error');
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setMessage('Permiso denegado. Permite el acceso a NFC en la configuración.');
      } else {
        setMessage('Error al iniciar escaneo NFC');
      }
      
      setIsScanning(false);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const stopNFCScan = () => {
    setIsScanning(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Escáner NFC</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-primary-100 text-sm">
            Acerca tu dispositivo a la etiqueta NFC del punto de interés
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Animación de escaneo */}
          <div className="relative h-48 flex items-center justify-center mb-6">
            {status === 'idle' && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <p className="text-gray-600">Toca el botón para iniciar</p>
              </div>
            )}

            {status === 'scanning' && (
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-primary-600 font-semibold animate-pulse">Escaneando...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-semibold">¡Éxito!</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold">Error</p>
              </div>
            )}
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              status === 'success' ? 'bg-green-50 text-green-800' :
              status === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              <p className="text-sm text-center">{message}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            {!isScanning && nfcSupported && status !== 'success' && (
              <button
                onClick={startNFCScan}
                className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition shadow-lg"
              >
                🎯 Iniciar Escaneo NFC
              </button>
            )}

            {isScanning && (
              <button
                onClick={stopNFCScan}
                className="w-full bg-gray-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-600 transition"
              >
                ⏹️ Detener Escaneo
              </button>
            )}

            {!nfcSupported && (
              <button
                onClick={() => {
                  // Redirigir a escáner QR (implementar)
                  alert('Abriendo escáner QR...');
                }}
                className="w-full bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition shadow-lg"
              >
                📷 Usar Escáner QR
              </button>
            )}
          </div>

          {/* Info adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">💡 Consejos:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Mantén el dispositivo cerca de la etiqueta</li>
              <li>• Asegúrate de estar en el punto de interés</li>
              <li>• Verifica que NFC esté activado en ajustes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

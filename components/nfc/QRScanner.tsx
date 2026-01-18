'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/lib/stores/userStore';
import { useVisitPOI } from '@/hooks/usePOIs';
import { useGamificationStore } from '@/lib/stores/gamificationStore';

interface QRScannerProps {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export default function QRScanner({ onSuccess, onError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { location } = useUserStore();
  const { visitPOI } = useVisitPOI();
  const { addExperience, addPoints } = useGamificationStore();

  // Solicitar permiso de cámara
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraPermission('granted');
      setIsScanning(true);
      setStatus('scanning');
      setMessage('Apunta la cámara al código QR');
      
      // Iniciar detección de QR
      startQRDetection();
    } catch (err) {
      setCameraPermission('denied');
      setStatus('error');
      setMessage('No se pudo acceder a la cámara. Verifica los permisos o usa el código manual.');
      
      if (onError) {
        onError('Permiso de cámara denegado');
      }
    }
  };

  const startQRDetection = () => {
    // Usar BarcodeDetector API si está disponible
    if ('BarcodeDetector' in window) {
      detectQRWithBarcodeAPI();
    } else {
      // Fallback a detección manual simple
      detectQRManually();
    }
  };

  const detectQRWithBarcodeAPI = async () => {
    try {
      // @ts-expect-error - BarcodeDetector es experimental
      const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
      
      const detectFrame = async () => {
        if (!videoRef.current || !isScanning) return;
        
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            const qrCode = barcodes[0].rawValue;
            await processQRCode(qrCode);
          } else {
            requestAnimationFrame(detectFrame);
          }
        } catch (err) {
          requestAnimationFrame(detectFrame);
        }
      };
      
      detectFrame();
    } catch (err) {
      console.error('Error con BarcodeDetector:', err);
    }
  };

  const detectQRManually = () => {
    // Implementación simple sin librería externa
    // En producción, considera usar una librería como jsQR
    setMessage('Escaneo QR básico activo. Para mejor detección, usa un navegador compatible o ingresa el código manualmente.');
  };

  const processQRCode = async (code: string) => {
    setIsScanning(false);
    setStatus('scanning');
    setMessage('Procesando código QR...');

    try {
      // Extraer UID del código QR (formato: https://tudominio.com/scan/UID)
      const match = code.match(/\/scan\/([^/?]+)/);
      const nfcUid = match ? match[1] : code;

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
      setMessage(`¡POI desbloqueado! +${result.rewards?.points || 0} pts, +${result.rewards?.xp || 0} XP`);
      
      if (onSuccess) {
        onSuccess(result);
      }

      // Detener cámara
      stopCamera();

      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el código QR';
      setStatus('error');
      setMessage(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    await processQRCode(manualCode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Escáner QR</h2>
            {onClose && (
              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-orange-100 text-sm">
            Escanea el código QR del punto de interés
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Vista de cámara */}
          {cameraPermission === 'granted' && isScanning && (
            <div className="relative mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-black rounded-lg object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-yellow-400 rounded-lg shadow-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400"></div>
                </div>
              </div>
            </div>
          )}

          {/* Estados */}
          {status === 'idle' && (
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-600">Toca el botón para activar la cámara</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-semibold">¡Éxito!</p>
            </div>
          )}

          {status === 'error' && cameraPermission !== 'denied' && (
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold">Error</p>
            </div>
          )}

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
            {status === 'idle' && (
              <button
                onClick={requestCamera}
                className="w-full bg-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition shadow-lg"
              >
                📷 Activar Cámara
              </button>
            )}

            {isScanning && (
              <button
                onClick={stopCamera}
                className="w-full bg-gray-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-600 transition"
              >
                ⏹️ Detener Cámara
              </button>
            )}

            {/* Entrada manual */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">O ingresa el código manualmente:</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Código del POI"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
                >
                  ✓
                </button>
              </form>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">💡 Consejos:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Centra el código QR en el cuadro</li>
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén el dispositivo estable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

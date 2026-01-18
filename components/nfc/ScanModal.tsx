'use client';

import { useState } from 'react';
import NFCScanner from './NFCScanner';
import QRScanner from './QRScanner';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

export default function ScanModal({ isOpen, onClose, onSuccess }: ScanModalProps) {
  const [scanMode, setScanMode] = useState<'select' | 'nfc' | 'qr'>('select');

  if (!isOpen) return null;

  const handleSuccess = (result: any) => {
    if (onSuccess) {
      onSuccess(result);
    }
    // Resetear al cerrar
    setTimeout(() => {
      setScanMode('select');
    }, 500);
  };

  const handleClose = () => {
    setScanMode('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        {scanMode === 'select' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Escanear POI</h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-primary-100 text-sm">
                Elige tu método de escaneo preferido
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Opción NFC */}
              <button
                onClick={() => setScanMode('nfc')}
                className="w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Escaneo NFC</h3>
                    <p className="text-sm text-gray-600">Acerca tu dispositivo a la etiqueta NFC</p>
                  </div>
                  <svg className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Opción QR */}
              <button
                onClick={() => setScanMode('qr')}
                className="w-full p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl hover:border-yellow-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Código QR</h3>
                    <p className="text-sm text-gray-600">Usa tu cámara para escanear el código QR</p>
                  </div>
                  <svg className="w-6 h-6 text-yellow-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  ¿Cuál elegir?
                </h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>NFC:</strong> Más rápido, solo acerca tu teléfono</li>
                  <li>• <strong>QR:</strong> Compatible con todos los dispositivos</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {scanMode === 'nfc' && (
          <NFCScanner
            onSuccess={handleSuccess}
            onError={(error) => console.error('Error NFC:', error)}
            onClose={handleClose}
          />
        )}

        {scanMode === 'qr' && (
          <QRScanner
            onSuccess={handleSuccess}
            onError={(error) => console.error('Error QR:', error)}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}

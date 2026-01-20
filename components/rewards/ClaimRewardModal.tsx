'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { translations } from '@/lib/translations';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    tier: 'BRONZE' | 'SILVER' | 'GOLD';
    name: string;
    emoji: string;
    pointsRequired: number;
    size: string;
    description: string;
  };
  currentPoints: number;
  onSuccess: () => void;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  reward,
  currentPoints,
  onSuccess,
}: ClaimRewardModalProps) {
  const language = useLanguageStore((state) => state.language);
  const t = (key: keyof typeof translations) => translations[key][language];
  
  const [step, setStep] = useState<'warning' | 'upload'>('warning');
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [claiming, setClaiming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert(t('invalidImageFile'));
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(t('imageTooLarge'));
      return;
    }

    setPhotoFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || t('errorUploadingPhoto'));
    }

    const data = await response.json();
    return data.url;
  };

  const handleClaim = async () => {
    if (!photoFile) {
      alert(t('pleaseSelectPhoto'));
      return;
    }

    try {
      setClaiming(true);
      setUploading(true);

      // 1. Subir foto a Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(photoFile);
      
      setUploading(false);

      // 2. Reclamar premio con la URL de Cloudinary
      const response = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardTier: reward.tier,
          photoUrl: cloudinaryUrl,
          userMessage: userMessage.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorClaimingReward'));
      }

      // 3. Éxito
      alert(t('rewardClaimedSuccess'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      alert(error.message || t('errorClaimingReward'));
    } finally {
      setClaiming(false);
      setUploading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{reward.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold">{t('claimYourReward')}</h2>
                  <p className="text-sm opacity-90">{reward.size} • {reward.pointsRequired} {t('pts')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-lg transition"
                disabled={claiming}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'warning' ? (
              // Paso 1: Advertencia sobre reseteo de puntos
              <>
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-yellow-900 text-lg mb-3">
                        {t('pointsResetWarning')}
                      </h3>
                      <p className="text-yellow-800 mb-4">
                        {t('continueAccumulating')}
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-yellow-300">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>{t('currentPoints').replace('{points}', String(currentPoints))}</strong>
                        </p>
                        <p className="text-xs text-gray-600">
                          • {reward.name}: {reward.pointsRequired} {t('pts')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de decisión */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep('upload')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-xl font-bold text-lg shadow-lg transition"
                  >
                    ✅ {t('yesClaimNow')}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition"
                  >
                    🎯 {t('noKeepAccumulating')}
                  </button>
                </div>
              </>
            ) : (
              // Paso 2: Subir foto y confirmar
              <>
            {/* Descripción */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1">{t('uploadPhoto')}</h3>
                  <p className="text-sm text-blue-800">
                    {t('uploadPhotoDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Subir foto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📸 Tu Foto de Estepona *
              </label>
              
              {!photoUrl ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={claiming}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-500 hover:bg-primary-50 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-6xl mb-3">📷</div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {t('selectImage')}
                  </div>
                  <div className="text-sm text-gray-500">
                    JPG, PNG o WEBP • {t('imageTooLarge').split('.')[1].trim()}
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
                    <Image
                      src={photoUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setPhotoUrl(null);
                      setPhotoFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={claiming}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Mensaje opcional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💬 {t('addMessage')}
              </label>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={claiming}
                placeholder={t('yourMessageHere')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {userMessage.length}/200 caracteres
              </div>
            </div>

            {/* Detalles del premio */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">📦 Detalles del Premio</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>✓ {reward.description}</li>
                <li>✓ Tamaño: {reward.size}</li>
                <li>✓ Envío a domicilio incluido</li>
                <li>✓ Tiempo de producción: 7-10 días hábiles</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={claiming}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClaim}
                disabled={!photoFile || claiming}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    {t('uploading')}
                  </span>
                ) : claiming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    {t('claiming')}
                  </span>
                ) : (
                  `🎁 ${t('confirmClaim')}`
                )}
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

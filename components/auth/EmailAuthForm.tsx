'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface EmailAuthFormProps {
  callbackUrl?: string;
  className?: string;
}

export function EmailAuthForm({ callbackUrl = '/map', className = '' }: EmailAuthFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validar email básico
      if (!email || !email.includes('@')) {
        setError('Por favor, ingresa un email válido');
        setIsLoading(false);
        return;
      }

      // Iniciar sesión con NextAuth email provider
      const result = await signIn('email', {
        email: email.toLowerCase(),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Error al enviar el código. Intenta nuevamente.');
        console.error('Error en signIn:', result.error);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Error al enviar email:', err);
      setError('Error al enviar el código. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Has excedido el límite de intentos. Intenta en 1 hora.');
        } else {
          setError(data.error || 'Error al reenviar el código');
        }
      } else {
        alert('✅ Código reenviado correctamente. Revisa tu email.');
      }
    } catch (err) {
      console.error('Error al reenviar código:', err);
      setError('Error al reenviar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-900">
            📧 ¡Revisa tu email!
          </h3>
          <p className="mb-4 text-sm text-green-800">
            Hemos enviado un código de verificación a:
          </p>
          <p className="mb-4 font-mono text-base font-semibold text-green-900">
            {email}
          </p>
          <div className="mb-4 rounded-lg bg-white p-4 text-left">
            <p className="mb-2 text-sm text-gray-700">
              <strong>📱 Tienes dos opciones:</strong>
            </p>
            <ol className="ml-4 list-decimal space-y-1 text-sm text-gray-600">
              <li>Haz clic en el botón del email (verificación automática)</li>
              <li>Copia el código de 6 dígitos e ingrésalo manualmente</li>
            </ol>
          </div>
          <div className="space-y-2 text-xs text-green-700">
            <p>⏰ El código expira en 24 horas</p>
            <p>🔒 No compartas el código con nadie</p>
          </div>
          <div className="mt-6 space-y-2">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '⏳ Reenviando...' : '🔄 Reenviar código'}
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="w-full text-sm text-green-700 hover:text-green-900"
            >
              ← Cambiar email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
          📧 Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enviando código...
          </span>
        ) : (
          '🚀 Enviar código de verificación'
        )}
      </button>

      <div className="space-y-1 text-xs text-gray-500">
        <p>
          ✅ Te enviaremos un código de verificación por email
        </p>
        <p>
          🔒 Tu email está protegido y no será compartido
        </p>
      </div>
    </form>
  );
}

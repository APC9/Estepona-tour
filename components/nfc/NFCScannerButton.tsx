'use client';

interface NFCScannerButtonProps {
  onClick: () => void;
}

export default function NFCScannerButton({ onClick }: NFCScannerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform animate-bounce-slow"
      aria-label="Escanear NFC/QR"
    >
      <svg
        className="w-8 h-8 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
      <div className="absolute inset-0 rounded-full bg-yellow-300 animate-ping opacity-20"></div>
    </button>
  );
}

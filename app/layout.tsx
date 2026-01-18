import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Estepona Tours - Experiencia Turística Gamificada',
  description: 'Descubre Estepona de una forma única con nuestra app de tours interactivos gamificados',
  manifest: '/manifest.json',
  keywords: ['estepona', 'turismo', 'tours', 'málaga', 'españa', 'gamificación'],
  authors: [{ name: 'Estepona Tours' }],
  openGraph: {
    title: 'Estepona Tours',
    description: 'Experiencia turística gamificada en Estepona',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Estepona Tours',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estepona Tours',
    description: 'Experiencia turística gamificada en Estepona',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Estepona Tours',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

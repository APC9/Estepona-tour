'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          // 🔒 Verificar en servidor que el usuario existe y es admin
          const res = await fetch('/api/admin/check-access');
          
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.isAdmin);
          } else {
            // Usuario no existe o no es admin - cerrar sesión
            await signOut({ redirect: false });
            router.push('/api/auth/signin?error=UserDeleted');
          }
        } catch (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
        }
      }
      setChecking(false);
    }

    checkAdmin();
  }, [session, status, router]);

  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/api/auth/signin');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⛔ Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel administrativo.</p>
          <Link href="/map" className="btn-primary">
            Volver al Mapa
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/admin' },
    { icon: '📍', label: 'POIs/Comercios', href: '/admin/pois' },
    { icon: '🏷️', label: 'Etiquetas NFC', href: '/admin/nfc' },
    { icon: '📈', label: 'Analytics', href: '/admin/analytics' },
    { icon: '🏅', label: 'Badges', href: '/admin/badges' },
    { icon: '🏆', label: 'Premios', href: '/admin/rewards' },
    { icon: '🎁', label: 'Premios Usuarios', href: '/admin/user-rewards' },
    { icon: '👥', label: 'Usuarios', href: '/admin/users' },
    { icon: '💳', label: 'Suscripciones', href: '/admin/subscriptions' },
    { icon: '📖', label: 'Guía Admin', href: '/admin/guide' },
    { icon: '📱', label: 'Guía Usuario', href: '/admin/user-guide' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">Admin Panel</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/map"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
          >
            <span className="text-2xl">🗺️</span>
            {sidebarOpen && <span>Ver Mapa</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Panel Administrativo - Estepona Tours
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.email}
              </span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

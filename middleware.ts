import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * IMPORTANTE: Este middleware NO puede usar validateSession directamente
 * porque el Edge Runtime no soporta módulos de Node.js como 'crypto'.
 * 
 * La validación completa de sesión se hace en el backend via API decorators.
 */

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  '/',
  '/api/auth',
  '/api/webhooks',
  '/scan',
];

/**
 * Rutas protegidas que requieren autenticación
 */
const PROTECTED_ROUTES = [
  '/admin',
  '/map',
  '/upgrade',
  '/api/pois',
  '/api/visits',
  '/api/user',
  '/api/stripe',
];

/**
 * Middleware de Next.js para autenticación básica
 * 
 * NOTA: Validación avanzada (fingerprinting, anomalías) se hace en backend
 * porque Edge Runtime tiene limitaciones con módulos Node.js
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar si es ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Obtener JWT token de NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirigir a login si no hay token
    if (!token || !token.sub) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'SessionRequired');
      return NextResponse.redirect(url);
    }

    // Token válido - permitir request
    // La validación de sesión avanzada se hace en API routes via decorators
    const response = NextResponse.next();

    // Agregar headers de seguridad
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'geolocation=(self), camera=(), microphone=()'
    );

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // En caso de error, permitir request pero loggear
    return NextResponse.next();
  }
}

/**
 * Configuración del matcher
 * Ejecuta middleware en todas las rutas excepto static assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

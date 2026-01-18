import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { logSessionActivity, validateSession } from '@/lib/security/session-manager';
import { extractDeviceInfoFromHeaders } from '@/lib/security/device-fingerprint';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Comentado temporalmente hasta configurar credenciales SMTP correctas
    // EmailProvider({
    //   server: {
    //     host: process.env.SMTP_HOST,
    //     port: parseInt(process.env.SMTP_PORT || '587'),
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   },
    //   from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    //   // Personalizar el envío del email de verificación
    //   sendVerificationRequest: async ({ identifier: email, url, token }) => {
    //     try {
    //       await sendVerificationEmail({ email, token, url });
    //     } catch (error) {
    //       console.error('❌ Error al enviar email de verificación:', error);
    //       throw new Error('No se pudo enviar el email de verificación');
    //     }
    //   },
    //   // Configuración del token de verificación
    //   maxAge: 24 * 60 * 60, // 24 horas
    // }),
    // Apple provider se puede agregar cuando se tenga credenciales
    // AppleProvider({
    //   clientId: process.env.APPLE_ID!,
    //   clientSecret: process.env.APPLE_SECRET!,
    // }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: '/',
    error: '/', // Redirigir errores a la página principal
  },
  callbacks: {
    async session({ session, token, trigger }) {
      // Si no hay token (usuario eliminado), retornar sesión vacía
      if (!token?.email || !token?.sub) {
        return {} as any;
      }

      if (session.user) {
        // 🔒 SECURITY: Verificar que el usuario aún existe en BD
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            tier: true,
            level: true,
            experiencePoints: true,
            totalPoints: true,
            language: true,
            isAdmin: true,
            role: true,
          },
        });

        // Si el usuario fue eliminado, retornar sesión vacía para forzar logout
        if (!user) {
          return {} as any;
        }

        session.user.id = user.id;
        session.user.tier = user.tier;
        session.user.level = user.level;
        session.user.experiencePoints = user.experiencePoints;
        session.user.totalPoints = user.totalPoints;
        session.user.language = user.language;
        session.user.isAdmin = user.isAdmin;
        session.user.role = user.role;

        // 🔒 SECURITY: Agregar session fingerprinting al token
        if (token.sessionToken) {
          session.user.sessionToken = token.sessionToken as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }

      // Verificar que el usuario aún existe en cada refresh del token
      if (token.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        });

        // Si usuario eliminado, invalidar token
        if (!existingUser) {
          return {} as any;
        }
      }

      // 🔒 SECURITY: Agregar sessionToken al JWT para tracking
      if (account?.provider) {
        // En login, buscar o crear session token
        const existingSession = await prisma.session.findFirst({
          where: {
            userId: token.sub as string,
            expires: { gt: new Date() },
          },
          orderBy: { expires: 'desc' },
        });

        if (existingSession) {
          token.sessionToken = existingSession.sessionToken;
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      // 🔒 SECURITY: Log de actividad al hacer sign in
      if (user.id && account) {
        try {
          // Intentar obtener session para logging (se creará después por PrismaAdapter)
          // Este log se hace con información básica
          const deviceInfo = {
            userAgent: 'server-side-login',
            timezone: 'UTC',
            language: 'es',
            cookiesEnabled: true,
          };

          // Crear un log básico de LOGIN
          await prisma.sessionLog.create({
            data: {
              userId: user.id,
              sessionToken: 'pending', // Se actualizará después
              action: 'LOGIN',
              timestamp: new Date(),
              suspicious: false,
              flags: [`provider:${account.provider}`],
            },
          });
        } catch (error) {
          console.error('Error logging sign in:', error);
          // No fallar el login por esto
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // ⚠️ IMPORTANT: No asignar tier FREE automáticamente si hay un tier de pago pendiente
      // El tier se asignará desde el cliente o desde el webhook de Stripe

      // Solo asignar FREE si es definitivamente un registro gratuito
      // Esto se manejará mejor desde la aplicación cliente

      // Webhook para n8n cuando se registra un nuevo usuario
      if (process.env.N8N_WEBHOOK_URL) {
        try {
          await fetch(`${process.env.N8N_WEBHOOK_URL}/user-registered`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              name: user.name,
              createdAt: new Date().toISOString(),
            }),
          });
        } catch (error) {
          console.error('Error sending webhook:', error);
        }
      }
    },
  },
};

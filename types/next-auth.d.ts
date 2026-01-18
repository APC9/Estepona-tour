import 'next-auth';
import { Tier, Language, Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: Tier;
      level: number;
      experiencePoints: number;
      totalPoints: number;
      language: Language;
      isAdmin: boolean;
      role: Role;
      sessionToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    tier: Tier;
    level: number;
    experiencePoints: number;
    totalPoints: number;
    language: Language;
    isAdmin: boolean;
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
  }
}

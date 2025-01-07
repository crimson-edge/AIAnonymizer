import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserStatus } from '@prisma/client';
import './env'; // This will ensure NEXTAUTH_URL is set correctly

if (!process.env.NEXTAUTH_URL) {
  console.error('NEXTAUTH_URL is not set');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is not set');
}

console.log('Auth configuration:', {
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === 'development'
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Starting authorization for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          throw new Error('Missing credentials');
        }

        try {
          console.log('Looking up user in database...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              email: true,
              password: true,
              firstName: true,
              lastName: true,
              isAdmin: true,
              status: true,
            },
          });

          if (!user?.password) {
            console.error('User not found or no password');
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            console.error('Invalid password');
            throw new Error('Invalid credentials');
          }

          console.log('Authorization successful');
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            status: user.status,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isAdmin = user.isAdmin;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

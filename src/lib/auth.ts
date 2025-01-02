import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth attempt for email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim()
            },
            include: { subscription: true }
          });

          console.log('Found user:', user ? {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
          } : 'null');

          if (!user?.password) {
            console.error('User not found or no password set');
            return null;
          }

          console.log('Comparing passwords...');
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password valid:', isValid);

          if (!isValid) {
            console.error('Invalid password');
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.isAdmin ? 'admin' : 'user',
            subscription: user.subscription
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

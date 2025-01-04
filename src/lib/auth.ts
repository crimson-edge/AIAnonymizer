import { PrismaAdapter } from '@next-auth/prisma-adapter';
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
  adapter: PrismaAdapter(prisma),
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
            where: { 
              email: credentials.email.toLowerCase().trim()
            },
            include: { subscription: true }
          });

          if (!user) {
            console.error('User not found:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('User found, checking status...');
          
          // Check if user is pending verification
          if (user.status === UserStatus.PENDING_VERIFICATION) {
            console.error('User pending verification:', credentials.email);
            throw new Error('Please verify your email before signing in');
          }

          // Check if user is suspended
          if (user.status === UserStatus.SUSPENDED) {
            console.error('User is suspended:', credentials.email);
            throw new Error('Your account has been suspended. Please contact support.');
          }

          console.log('Checking password...');
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            console.error('Invalid password for user:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('Authorization successful for:', credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            status: user.status,
            subscription: user.subscription,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - these fields exist on our User type
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        // @ts-ignore - we added these fields to the token
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.password) {
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              // Add any other user properties you want to pass to the session
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // Add custom properties to the token
      if (account) {
        token.id = user.id;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Add custom properties to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as string; // Add provider to session
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // Optional: Custom sign-in page
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

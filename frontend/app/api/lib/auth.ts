// This file contains the NextAuth configuration for authentication in the application.
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from '@/prisma/generated/prisma'; // Adjust path if needed
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const NEXT_AUTH_OPTIONS = {
  providers: [
    // 🔐 Credentials login
    CredentialsProvider({
      name: 'Email',
      credentials: {
        username: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      async authorize(credentials: any) {
        const { username, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { email: username }
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    }),

    // 🌐 Google OAuth login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.sub;
      return session;
    }
  },

  pages: {
    signIn: '/signin',  // You can create a custom sign-in page at /app/signin/page.tsx
    // error: '/auth/error' // Optional custom error page
  }
};


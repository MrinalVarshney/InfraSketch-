// import  CredentialsProvider  from "next-auth/providers/credentials";

// export const NEXT_AUTH_OPTIONS = {
//     providers: [
//         // ...add more providers here
//         CredentialsProvider({
//             name: 'Email',
//             credentials: {
//                 username: { label: "Username", type: "text", placeholder: "Email" },
//                 password: { label: "Password", type: "password" , placeholder: "Password" }
//             },

//             async authorize(credentials:any) {
//                 console.log("Credentials: ", credentials);
//                 // const { username, password } = credentials;
//                 // Add logic here to look up the user from the credentials supplied
//                 // For example, you could fetch user data from a database
//                 // and check if the password is correct
//                 // For this example, we'll just return a dummy user object
//                 // In a real application, you would validate the credentials
//                 // and return the user object if valid, or null if invalid
//                 // Simulating a user lookup

//                 // const user = await prisma.user.findOne({
//                 //     where: {
//                 //         email: username,
//                 //         password: password
//                 //     }

//                 // });
//                 // If you return null, then an error will be displayed advising the user to check their details.
//                 // if(!user) {
//                 //     return null;
//                 // }

//                 // return {
//                 //     id: user.id,
//                 //     email: user.email,
//                 //     name: user.name
//                 // }

//                 return {
//                     id: "user1",
//                     name: "John Doe",
//                     email: "john@gmail.com"

//                 }
//             },

//         }),

//     ],
//     secret: process.env.NEXTAUTH_SECRET,

//     // blocking a specific user
//     callbacks: {
//         // signIn: ({user}) => {
//         //     if (user.email== "somerandom_user@gmail.com") {
//         //         return false
//         //     }
//         //     return true
//         // },

//         // // allow to add userId and show on frontend
//         // // this is the token that is passed to the client
//         // jwt: ({ token, user }) => {
//         //     console.log("JWT: ", token);
//         //     token.userId = token.sub;
//         //     return token
//         // },

//         session: ({ session, token,user }:any) => {
//             console.log("Session: ", session);
//             session.user.id = token.sub; //token.userId will also work
//             return session
//         }
//     }
// }

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
    signIn: '/signin', 
     // You can create a custom sign-in page at /app/signin/page.tsx
    // error: '/auth/error' // Optional custom error page
  }
};


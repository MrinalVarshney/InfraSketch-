
// import { NEXT_AUTH_OPTIONS } from "../lib/auth";
// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//     const session = await getServerSession(NEXT_AUTH_OPTIONS);

//     return NextResponse.json({
//         session,
//         message: "Hello from the API route",
//     });
    
// }


// app/api/user/route.ts
import { PrismaClient } from '@/prisma/generated/prisma'; // Adjust path if needed
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Missing fields' }), { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return new Response(JSON.stringify({ message: 'User created', user: { id: user.id, email: user.email } }), {
    status: 201,
  });
}

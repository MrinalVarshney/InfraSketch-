// app/api/auth/reset-password/route.ts

import bcrypt from "bcryptjs"
import { PrismaClient } from '@/prisma/generated/prisma'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()
  const { token, password } = body

  if (!token || !password) {
    return new Response(JSON.stringify({ error: "Token and password required" }), { status: 400 })
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 400 })
    }

    await prisma.user.update({
      where: { email: resetToken.email },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return new Response(JSON.stringify({ message: "Password updated." }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
}

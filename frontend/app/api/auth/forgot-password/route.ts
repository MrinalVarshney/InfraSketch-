import { PrismaClient } from '@/prisma/generated/prisma'
import { randomUUID } from "crypto"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: "Valid email is required" }), { status: 400 })
    }

    // Check user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    // Create token
    const token = randomUUID()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save to DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: expires,
      },
    })

    const resetLink = `http://localhost:3000/reset-password?token=${token}`

    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password (not your real password)
      },
    })

    // Send mail
    await transporter.sendMail({
      from: `"InfraGenX Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hi ${user.name || 'there'},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to proceed:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    })

    return new Response(JSON.stringify({ message: "Reset link sent to your email." }), { status: 200 })

  } catch (err) {
    console.error("Forgot Password Error:", err)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}

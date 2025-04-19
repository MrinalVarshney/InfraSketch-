'use client'
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setMessage(data.message || data.error)
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">🔒 Forgot your password?</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">No worries! Enter your email and we'll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-green-600 animate-fade-in">
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <a href="/signin" className="hover:text-blue-500 transition">Back to login</a>
        </div>
      </div>
    </div>
  )
}

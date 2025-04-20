'use client'

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()

    if (res.ok) {
      setMessage("✅ Password updated. Redirecting...")
      setTimeout(() => router.push("/signin"), 2000)
    } else {
      setMessage(data.error || "❌ Error resetting password.")
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200 transition-all">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🔒 Reset Password</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Enter and confirm your new password.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 text-center text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            } animate-fade-in`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <a href="/signin" className="hover:text-green-600 transition">Back to login</a>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { user, login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If already logged in, send the user to the root page
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // Call login without passing a role; backend determines role
      const ok = await login(email.trim(), password)
      if (ok) {
        // Root page renders the proper dashboard by role
        router.replace("/")
      } else {
        setError("Invalid username or password.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#111827] text-white">
      {/* Left: Hero image */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/60 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6">
          <div className="h-2 w-28 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow md:text-5xl">
              AsiaApp
            </h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="bg-transparent border-gray-500/70 focus:border-white/80 text-white placeholder:text-gray-400"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-gray-500/70 focus:border-white/80 text-white placeholder:text-gray-400 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#4f5fa3] hover:bg-[#435593]"
              disabled={submitting || isLoading}
            >
              {submitting || isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>

            {/* Demo credentials for local testing */}
            <div className="text-xs text-gray-400 mt-2 space-y-1">
              <p>Client: ahmad@company.com / 123456</p>
              <p>Technician: ali@company.com / 123456</p>
              <p>Admin: admin@company.com / 123456</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


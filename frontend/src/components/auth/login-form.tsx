import * as React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm as LoginFormType } from "@/types"
import { cn } from "@/utils/cn"
import toast from "react-hot-toast"

const GOOGLE_CLIENT_ID = "330231369557-rj55225m1k4i7jeg2pc55kkaag7a5c1p.apps.googleusercontent.com"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const { login, isLoading, error, clearError, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  // Clear errors when component mounts
  React.useEffect(() => {
    clearError()
  }, [clearError])

  // Show message if redirected from profile completion
  React.useEffect(() => {
    const state = location.state as any
    if (state?.message) {
      toast.success(state.message, { duration: 4000 })
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Handle server errors
  React.useEffect(() => {
    if (error) {
      // Check for specific error messages from backend
      if (error.includes("verify your email") || error.includes("verification")) {
        toast.error(error, { duration: 6000 })
      } else if (error.includes("No account found") || error.includes("email")) {
        setError("email", { message: "No account found with this email address" })
      } else if (error.includes("Incorrect password") || error.includes("password")) {
        setError("password", { message: "Incorrect password. Please try again" })
      } else if (error.includes("pending approval")) {
        toast.error(error, { duration: 6000 })
      } else {
        toast.error(error)
      }
    }
  }, [error, setError])

  const onSubmit = async (data: LoginFormType) => {
    try {
      clearError()
      const response = await login(data)
      toast.success("Welcome back!")

      // Redirect based on from location or user role
      const from = (location.state as any)?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
        return
      }

      // Get the user role from auth store after login
      const authStore = await import('@/store/auth').then(m => m.useAuthStore.getState())
      const userRole = authStore.user?.role

      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === 'instructor') {
        navigate('/instructor/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      // Error handling is done in the useEffect above
      console.error("Login error:", err)
      console.error("Error response:", err.response?.data)
      console.error("Error message:", err.message)
    }
  }

  const handleGoogleLogin = () => {
    const loadGsi = () => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              const res = await fetch('/api/v1/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.detail || 'Google login failed')
              // Store token same way as normal login
              const existing = JSON.parse(localStorage.getItem("auth-storage") || "{\"state\":{}}")
              existing.state.accessToken = data.access_token
              existing.state.refreshToken = data.refresh_token || null
              existing.state.isAuthenticated = true
              existing.state.user = data.user || null
              localStorage.setItem("auth-storage", JSON.stringify(existing))
              window.location.href = "/dashboard"
            } catch (err: any) {
              toast.error(err.message || 'Google login failed')
            }
          }
        })
        ;(window as any).google.accounts.id.prompt()
      }
      document.head.appendChild(script)
    }
    if ((window as any).google?.accounts) {
      (window as any).google.accounts.id.prompt()
    } else {
      loadGsi()
    }
  }

  const handleLinkedInLogin = () => {
    const clientId = '869qrsv3ufb6x5'
    const redirectUri = encodeURIComponent('https://sashainfinity.com/auth/linkedin/callback')
    const scope = encodeURIComponent('openid profile email')
    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('linkedin_state', state)
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  {...register("remember")}
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  disabled={isSubmitting || isLoading}
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
              loading={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleLinkedInLogin}
                disabled={isSubmitting || isLoading}
              >
                <svg className="w-4 h-4 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
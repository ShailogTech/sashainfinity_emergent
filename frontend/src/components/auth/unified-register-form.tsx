import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, GraduationCap, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'

export const UnifiedRegisterForm = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'student' | 'instructor'>('student')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    bio: '',
    agreeToTerms: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    if (userType === 'instructor' && (!formData.designation || !formData.bio)) {
      toast.error('Please fill in your designation and bio')
      return
    }

    try {
      setLoading(true)

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        user_type: userType,
        ...(userType === 'instructor' && {
          designation: formData.designation,
          bio: formData.bio
        })
      }

      const response = await api.post(`/auth/register`, payload)

      setShowSuccess(true)

      toast.success(
        userType === 'instructor'
          ? 'Registration successful! Please check your email to verify your account. Your instructor account is pending admin approval.'
          : 'Registration successful! Please check your email to verify your account.',
        { duration: 7000 }
      )

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)

    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                📧 <strong>Check your email!</strong>
              </p>
              <p className="text-sm text-blue-800 mt-2">
                We've sent a verification link to <strong>{formData.email}</strong>
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Please verify your email address to complete registration.
              </p>
            </div>
            {userType === 'instructor' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  ⏳ <strong>Pending Approval</strong>
                </p>
                <p className="text-xs text-yellow-800 mt-1">
                  Your instructor account will be reviewed by our admin team.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Redirecting to login page...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Create your account</CardTitle>
        <CardDescription>Join thousands of learners and start your journey today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">I want to join as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={cn(
                  "p-4 border-2 rounded-lg transition-all text-left",
                  userType === 'student'
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <User className={cn("w-6 h-6 mb-2", userType === 'student' ? "text-blue-600" : "text-gray-400")} />
                <div className="font-semibold text-sm">Student</div>
                <div className="text-xs text-gray-600">Learn from experts</div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('instructor')}
                className={cn(
                  "p-4 border-2 rounded-lg transition-all text-left",
                  userType === 'instructor'
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <GraduationCap className={cn("w-6 h-6 mb-2", userType === 'instructor' ? "text-purple-600" : "text-gray-400")} />
                <div className="font-semibold text-sm">Instructor</div>
                <div className="text-xs text-gray-600">Teach & earn</div>
              </button>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium block mb-1">First name</label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-medium block mb-1">Last name</label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-1">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          {/* Instructor-specific fields */}
          {userType === 'instructor' && (
            <>
              <div>
                <label htmlFor="designation" className="text-sm font-medium block mb-1">Designation *</label>
                <Input
                  id="designation"
                  name="designation"
                  type="text"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="bio" className="text-sm font-medium block mb-1">Bio *</label>
                <textarea
                  id="bio"
                  name="bio"
                  required
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your teaching experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Password Fields */}
          <div>
            <label htmlFor="password" className="text-sm font-medium block mb-1">Create a password</label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium block mb-1">Confirm your password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
              I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

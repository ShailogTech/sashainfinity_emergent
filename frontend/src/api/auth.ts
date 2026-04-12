import { api } from './axios'
import { User, UserProfile, InstructorProfile, LoginForm, RegisterForm, ApiResponse } from '@/types'

interface AuthResponse {
  user: User
  profile: UserProfile
  instructorProfile?: InstructorProfile
  accessToken: string
  refreshToken: string
}

interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export const authAPI = {
  // Login user
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post(`/auth/login`, credentials)
    const data = response.data

    return {
      user: data.user,
      profile: data.profile || {} as UserProfile,
      instructorProfile: data.instructorProfile || undefined,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  },

  // Register user
  register: async (data: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post(`/auth/register`, {
      username: data.email.split('@')[0],
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone
    })
    const result = response.data

    return {
      user: result,
      profile: {} as UserProfile,
      instructorProfile: undefined,
      accessToken: '', // Will need to login after registration
      refreshToken: '',
    }
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post(`/auth/logout`, { refreshToken })
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post(`/auth/refresh`, { refresh_token: refreshToken })
    const data = response.data

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  },

  // Get current user
  getCurrentUser: async (accessToken: string): Promise<{
    user: User
    profile: UserProfile
    instructorProfile?: InstructorProfile
  }> => {
    const [userResponse, profileResponse] = await Promise.all([
      api.get(`/auth/me`),
      api.get(`/users/profile`),
    ])

    return {
      user: userResponse.data.user || userResponse.data,
      profile: profileResponse.data.profile || profileResponse.data,
      instructorProfile: profileResponse.data.instructorProfile || undefined,
    }
  },

  // Update user profile
  updateProfile: async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const response = await api.put(`/auth/profile`, profileData)
    return response.data.data || response.data
  },

  // Change password
  changePassword: async (
    data: { currentPassword: string; newPassword: string }
  ): Promise<void> => {
    await api.put(`/auth/change-password`, data)
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post(`/auth/forgot-password`, { email })
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(`/auth/reset-password`, {
      token,
      newPassword,
    })
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await api.post(`/auth/verify-email`, { token })
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post(`/auth/resend-verification`, { email })
  },

  // Social login (Google, Facebook, etc.)
  socialLogin: async (provider: string, token: string): Promise<AuthResponse> => {
    const response = await api.post(`/auth/social/${provider}`, { token })
    return response.data.data
  },

  // Check if email exists
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await api.post(`/auth/check-email`, { email })
    return response.data.data
  },

  // Get user roles
  getUserRoles: async (): Promise<string[]> => {
    const response = await api.get(`/auth/roles`)
    return response.data.data
  },

  // Update instructor profile
  updateInstructorProfile: async (
    profileData: Partial<InstructorProfile>
  ): Promise<InstructorProfile> => {
    const response = await api.put(`/auth/instructor-profile`, profileData)
    return response.data.data
  },
}
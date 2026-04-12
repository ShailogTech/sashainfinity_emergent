import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserProfile, InstructorProfile, LoginForm, RegisterForm } from '@/types'
import { authAPI } from '@/api/auth'

interface AuthState {
  // State
  user: User | null
  profile: UserProfile | null
  instructorProfile: InstructorProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginForm) => Promise<void>
  register: (data: RegisterForm) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  setProfile: (profile: Partial<UserProfile>) => void
  checkAuth: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      instructorProfile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginForm) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.login(credentials)

          set({
            user: response.user,
            profile: response.profile,
            instructorProfile: response.instructorProfile,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          // Extract error message from axios response
          const errorMessage = error.response?.data?.detail || error.message || 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          throw error
        }
      },

      register: async (data: RegisterForm) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.register(data)

          set({
            user: response.user,
            profile: response.profile,
            instructorProfile: response.instructorProfile,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          // Extract error message from axios response
          const errorMessage = error.response?.data?.detail || error.message || 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        try {
          // Call logout API to invalidate tokens on server
          const { refreshToken } = get()
          if (refreshToken) {
            authAPI.logout(refreshToken).catch(console.error)
          }
        } catch (error) {
          console.error('Logout API error:', error)
        }

        set({
          user: null,
          profile: null,
          instructorProfile: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await authAPI.refreshToken(refreshToken)

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      updateProfile: async (profileData: Partial<UserProfile>) => {
        try {
          set({ isLoading: true, error: null })

          const { accessToken } = get()
          if (!accessToken) {
            throw new Error('Not authenticated')
          }

          const updatedProfile = await authAPI.updateProfile(profileData, accessToken)

          set({
            profile: updatedProfile,
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || 'Profile update failed',
            isLoading: false,
          })
          throw error
        }
      },

      setProfile: (profileData: Partial<UserProfile>) => {
        const currentProfile = get().profile
        const currentUser = get().user
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...profileData }

          // Create NEW user object so Zustand detects the change
          const updatedUser = profileData.profile_completed !== undefined && currentUser
            ? { ...currentUser, profile_completed: profileData.profile_completed }
            : currentUser

          set({
            profile: updatedProfile,
            user: updatedUser
          })
        }
      },

      checkAuth: async () => {
        try {
          const { accessToken, refreshToken } = get()

          if (!accessToken || !refreshToken) {
            return
          }

          set({ isLoading: true })

          try {
            // Try to get current user with access token
            const response = await authAPI.getCurrentUser(accessToken)

            set({
              user: response.user,
              profile: response.profile,
              instructorProfile: response.instructorProfile,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error: any) {
            if (error.status === 401) {
              // Access token expired, try refresh
              try {
                await get().refreshAccessToken()
                // Retry getting user data
                const response = await authAPI.getCurrentUser(get().accessToken!)

                set({
                  user: response.user,
                  profile: response.profile,
                  instructorProfile: response.instructorProfile,
                  isAuthenticated: true,
                  isLoading: false,
                })
              } catch (refreshError) {
                // Refresh failed, logout
                get().logout()
                set({ isLoading: false })
              }
            } else {
              throw error
            }
          }
        } catch (error: any) {
          set({
            error: error.message || 'Authentication check failed',
            isLoading: false,
          })
          get().logout()
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        instructorProfile: state.instructorProfile,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
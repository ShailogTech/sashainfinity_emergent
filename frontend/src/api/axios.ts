import axios, { AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth'

// Use environment variable for backend URL, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Build-Timestamp': new Date().toISOString(),
  },
})

// Request interceptor to add auth token and handle trailing slashes
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Handle trailing slashes intelligently based on endpoint patterns
    if (config.url && !config.url.endsWith('/')) {

      // Comprehensive list of endpoints that don't need trailing slashes
      const noSlashEndpoints = [
        // User endpoints
        '/users/profile', '/users/stats', '/users/avatar',

        // Dashboard endpoints
        '/dashboard/student', '/dashboard/instructor', '/dashboard/admin',

        // Admin endpoints
        '/admin/stats', '/admin/courses', '/admin/users',

        // Auth endpoints
        '/auth/logout', '/auth/refresh', '/auth/me', '/auth/profile',
        '/auth/change-password', '/auth/forgot-password', '/auth/reset-password',
        '/auth/verify-email', '/auth/resend-verification', '/auth/check-email',
        '/auth/roles', '/auth/instructor-profile',

        // Upload endpoints
        '/upload/image', '/upload/video', '/upload/document', '/upload/file', '/upload/info',
        '/upload/chunked/init', '/upload/chunked',

        // Nested course endpoints (no trailing slashes)
        '/courses/publish', '/courses/unpublish', '/courses/featured', '/courses/popular',
        '/courses/search', '/courses/my-courses', '/courses/pending', '/wishlist',

        // Certificate endpoints (no trailing slashes)
        '/certificates/generate', '/certificates/regenerate', '/certificates/verify',
        '/certificates/download', '/certificates/templates',

        // Content endpoints
        '/categories', '/tags', '/instructors',

        // Static files and other endpoints
        '/payments', '/quizzes', '/assignments', '/coupons',

        // Video extraction endpoint
        '/stream/extract',
        '/bunny/video', '/bunny'
      ]

      // Endpoints that MUST have trailing slashes (based on backend FastAPI schema)
      const trailingSlashEndpoints = [
        '/blog',
        '/courses',
        '/auth/login',
        '/auth/register',
        '/auth/register-instructor'
      ]

      // Check if this is a static no-slash endpoint
      const isStaticNoSlashEndpoint = noSlashEndpoints.some(endpoint => config.url?.includes(endpoint))

      // Check if this endpoint requires a trailing slash
      const isTrailingSlashEndpoint = trailingSlashEndpoints.some(endpoint =>
        config.url === endpoint || (config.url?.startsWith(endpoint + '?'))
      )

      // Dynamic endpoints that shouldn't have trailing slashes
      const isDynamicNoSlashEndpoint =
        // All admin operations
        config.url?.includes('/admin/') ||
        // All course operations with IDs (excluding /courses/ exact match)
        (config.url?.includes('/courses/') && config.url !== '/courses/') ||
        // All certificate operations with IDs
        (config.url?.includes('/certificates/') && config.url !== '/certificates') ||
        // All blog operations with slugs (excluding /blog/ exact match)
        (config.url?.includes('/blog/') && config.url !== '/blog/') ||
        // All user operations (including nested)
        config.url?.includes('/users/') ||
        // All instructor operations
        config.url?.includes('/instructor/') ||
        // All auth operations
        config.url?.includes('/auth/') ||
        // All upload operations
        config.url?.includes('/upload/') ||
        // Resource ID patterns: /resource/123 or /resource/123/action
        config.url?.match(/^\/\w+\/\d+($|\/\w+$)/) ||
        // Hyphenated resource patterns: /chunked-upload/init
        config.url?.match(/^\/\w+-\w+\/\w+/)

      // Explicit check for admin endpoints that should never have trailing slashes
      const isAdminNoSlashEndpoint = [
        '/admin/stats',
        '/admin/courses',
        '/admin/users',
        '/admin/revenue',
        '/admin/instructor-applications',
        '/admin/enrollments',
        '/admin/categories',
        '/admin/tags',
        '/admin/certificates',
        '/admin/orders'
      ].some(endpoint => config.url === endpoint)

      if (isTrailingSlashEndpoint) {
        // Always add trailing slash for these endpoints
        // Check if URL has query parameters
        const hasQueryParams = config.url.includes('?')
        if (hasQueryParams) {
          // Insert trailing slash before query parameters
          const [basePath, queryString] = config.url.split('?')
          config.url = basePath + '/?' + queryString
        } else {
          // Simply add trailing slash
          config.url = config.url + '/'
        }
      } else if (!isStaticNoSlashEndpoint && !isDynamicNoSlashEndpoint && !isAdminNoSlashEndpoint) {
        // Check if URL has query parameters
        const hasQueryParams = config.url.includes('?')
        if (hasQueryParams) {
          // Insert trailing slash before query parameters
          const [basePath, queryString] = config.url.split('?')
          config.url = basePath + '/?' + queryString
        } else {
          // Simply add trailing slash
          config.url = config.url + '/'
        }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Production-grade response interceptor with enhanced error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Production-grade error logging
    const errorInfo = {
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      pathname: window.location.pathname
    }

    // Log errors in development and production (with different levels)
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', errorInfo)
      console.error('Full error:', error)
    } else {
      // Production logging - send to monitoring service (can be integrated with Sentry, etc.)
      console.error('Production API Error:', JSON.stringify(errorInfo))

      // Optional: Send to error monitoring service
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, { extra: errorInfo })
      // }
    }

    // Only attempt token refresh for non-auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/register')) {

      originalRequest._retry = true

      try {
        // Try to refresh token
        await useAuthStore.getState().refreshAccessToken()

        // Retry original request with new token
        const token = useAuthStore.getState().accessToken
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError)
        useAuthStore.getState().logout()

        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError = {
        ...errorInfo,
        type: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.'
      }

      if (import.meta.env.DEV) {
        console.error('Network Error:', networkError)
      }

      return Promise.reject({
        ...error,
        message: 'Network connection failed. Please check your internet connection.',
        type: 'NETWORK_ERROR'
      })
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || error.response.statusText
    return new Error(message)
  } else if (error.request) {
    // Request made but no response received
    return new Error('Network error. Please check your connection.')
  } else {
    // Something else happened
    return new Error('An unexpected error occurred.')
  }
}

// API response wrapper
export const apiRequest = async <T>(
  request: Promise<AxiosResponse<any>>
): Promise<T> => {
  try {
    const response = await request
    return response.data.success ? response.data.data : response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

export default api
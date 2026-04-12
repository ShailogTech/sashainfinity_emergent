/**
 * Utility functions for handling media URLs (images, videos, etc.)
 */
import { getBackendUrl, getCertificateUrl, BACKEND_URL, API_BASE_URL } from '@/config/urls'

/**
 * Get the full URL for a media file
 * In development, Vite proxy handles /uploads requests
 * In production, we need the full backend URL
 */
export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return ''

  // Handle streaming endpoints (YouTube proxy)
  if (url.startsWith('stream/')) {
    // YouTube streaming proxy endpoint - nginx routes /api/v1/stream/ to streaming service
    const streamingUrl = `${API_BASE_URL}/${url}`
    return streamingUrl
  }

  // If it's already a full URL (http/https), check if it needs rewriting
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Rewrite hardcoded production URLs to use current BACKEND_URL
    const productionBackendUrl = 'https://backend.sashainfinity.com'
    if (url.startsWith(productionBackendUrl) && BACKEND_URL !== productionBackendUrl) {
      const relativePath = url.replace(productionBackendUrl, '')
      return `${BACKEND_URL}${relativePath}`
    }
    return url
  }

  // If it's a relative path starting with /uploads or /certificate-files
  // In development: Vite proxy handles these, so use relative path
  // In production: Need to prepend backend URL
  if (url.startsWith('/uploads') || url.startsWith('/certificate-files')) {
    // In development with Vite, just return the relative path (proxy will handle it)
    if (import.meta.env.DEV) {
      return url
    }
    // In production, use centralized URL config
    if (url.startsWith('/certificate-files')) {
      return getCertificateUrl(url)
    }
    return getBackendUrl(url)
  }

  // For other paths, return as-is (might be external CDN or other)
  return url
}

/**
 * Get avatar URL with fallback
 */
export const getAvatarUrl = (profile: any): string => {
  return getMediaUrl(profile?.avatar_url || profile?.profile_photo)
}

/**
 * Get course thumbnail URL with fallback to placeholder
 */
export const getCourseThumbnailUrl = (thumbnail: string | null | undefined): string => {
  const url = getMediaUrl(thumbnail)
  return url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
}

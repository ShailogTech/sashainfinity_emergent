/**
 * Centralized URL Configuration
 * All backend and frontend URLs should be referenced from here
 */

// Backend API URL
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://sashainfinity.com';

// Frontend URL
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://sashainfinity.com';

// API Base URL (for axios)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Helper function to construct full backend URL
 * @param path - Relative path (e.g., '/uploads/file.pdf')
 * @returns Full URL (e.g., 'http://localhost:8000/uploads/file.pdf')
 */
export const getBackendUrl = (path: string): string => {
  if (!path) return BACKEND_URL;

  // If path already has protocol (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${BACKEND_URL}${normalizedPath}`;
};

/**
 * Helper function to construct full frontend URL
 * @param path - Relative path (e.g., '/courses/1')
 * @returns Full URL (e.g., 'http://localhost:3000/courses/1')
 */
export const getFrontendUrl = (path: string): string => {
  if (!path) return FRONTEND_URL;

  // If path already has protocol (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${FRONTEND_URL}${normalizedPath}`;
};

/**
 * Normalize certificate URL path
 * Handles both /certificates/ and /certificate-files/ paths
 */
export const getCertificateUrl = (path: string): string => {
  if (!path) return '';

  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Certificate files are served from /certificate-files/ endpoint
  // Normalize any /certificates/ references to /certificate-files/
  let normalizedPath = path;
  if (normalizedPath.includes('/certificates/')) {
    normalizedPath = normalizedPath.replace('/certificates/', '/certificate-files/');
  }

  return getBackendUrl(normalizedPath);
};

export function fixImageUrl(url: string): string {
  if (!url) return url
  return url.replace('http://lms.sashainfinity.com', 'https://sashainfinity.com')
            .replace('https://lms.sashainfinity.com', 'https://sashainfinity.com')
}

/**
 * Upload API - File upload service
 */
import { api } from './axios'

export interface UploadResponse {
  success: boolean
  file_url: string
  filename: string
  original_filename: string
  size: number
  content_type: string
}

export interface UploadInfo {
  max_image_size_mb: number
  max_video_size_mb: number
  max_document_size_mb: number
  allowed_image_types: string[]
  allowed_video_types: string[]
  allowed_document_types: string[]
}

/**
 * Upload image file
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<UploadResponse>(
    `/upload/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  return response.data
}

/**
 * Upload video file
 */
export const uploadVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<UploadResponse>(
    `/upload/video`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }
  )

  return response.data
}

/**
 * Upload document file
 */
export const uploadDocument = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<UploadResponse>(
    `/upload/document`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }
  )

  return response.data
}

/**
 * Delete uploaded file
 */
export const deleteFile = async (fileUrl: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(
    `/upload/file`,
    {
      params: { file_url: fileUrl }
    }
  )

  return response.data
}

/**
 * Get upload configuration info
 */
export const getUploadInfo = async (): Promise<UploadInfo> => {
  const response = await api.get<UploadInfo>(`/upload/info`)
  return response.data
}

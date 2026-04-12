import { api } from './axios'

export interface Certificate {
  id: number
  course_id: number
  course_title: string
  student_name: string
  instructor_name: string
  completion_date: string
  certificate_url: string
  verification_code: string
  issued_at: string
}

export const certificatesAPI = {
  // Get all user certificates
  getUserCertificates: async (): Promise<Certificate[]> => {
    const response = await api.get('/certificates')
    const certificates = response.data

    // Fix old certificate URLs that use /certificates/ instead of /certificate-files/
    certificates.forEach((cert: Certificate) => {
      if (cert.certificate_url) {
        cert.certificate_url = cert.certificate_url.replace('/certificates/', '/certificate-files/')
      }
    })

    return certificates
  },

  // Get specific certificate
  getCertificate: async (certificateId: number): Promise<Certificate> => {
    const response = await api.get(`/certificates/${certificateId}`)
    const cert = response.data

    // Fix old certificate URLs that use /certificates/ instead of /certificate-files/
    if (cert.certificate_url) {
      cert.certificate_url = cert.certificate_url.replace('/certificates/', '/certificate-files/')
    }

    return cert
  },

  // Generate certificate for a course
  generateCertificate: async (courseId: number): Promise<{
    certificate_id: number
    message: string
    certificate_url: string
  }> => {
    const response = await api.post(`/certificates/generate/${courseId}`, {}, {
      timeout: 30000  // 30 second timeout for certificate generation
    })
    return response.data
  },

  // Regenerate certificate for a course (deletes old and creates new)
  regenerateCertificate: async (courseId: number): Promise<{
    certificate_id: number
    message: string
    certificate_url: string
  }> => {
    const response = await api.post(`/certificates/regenerate/${courseId}`, {}, {
      timeout: 30000  // 30 second timeout for certificate regeneration
    })
    return response.data
  },

  // Get certificate by course ID
  getCertificateByCourse: async (courseId: number): Promise<Certificate | null> => {
    try {
      const certificates = await certificatesAPI.getUserCertificates()
      const cert = certificates.find(cert => cert.course_id === courseId) || null

      // Fix old certificate URLs that use /certificates/ instead of /certificate-files/
      if (cert && cert.certificate_url) {
        cert.certificate_url = cert.certificate_url.replace('/certificates/', '/certificate-files/')
      }

      return cert
    } catch (error) {
      console.error('Error fetching certificate:', error)
      return null
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId: number): Promise<void> => {
    const response = await api.get(`/certificates/download/${certificateId}`, {
      responseType: 'blob'
    })

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `certificate-${certificateId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // Verify certificate
  verifyCertificate: async (verificationCode: string): Promise<{
    valid: boolean
    student_name: string
    course_title: string
    instructor_name: string
    completion_date: string
    issued_at: string
    verification_code: string
  }> => {
    const response = await api.get(`/certificates/verify/${verificationCode}`)
    return response.data
  }
}

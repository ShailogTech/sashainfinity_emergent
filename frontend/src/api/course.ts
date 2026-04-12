import { api, apiRequest } from './axios'
import { Course, CourseFilters, PaginatedResponse, CourseCategory, CourseTag } from '@/types'

export const courseAPI = {
  // Get all courses with filters
  getCourses: async (filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return apiRequest(
      api.get(`/courses/?${params.toString()}`)
    )
  },

  // Get single course by ID
  getCourse: async (id: number): Promise<Course> => {
    return apiRequest(
      api.get(`/courses/${id}`)
    )
  },

  // Get featured courses
  getFeaturedCourses: async (): Promise<Course[]> => {
    return apiRequest(
      api.get('/courses/featured')
    )
  },

  // Get popular courses
  getPopularCourses: async (): Promise<Course[]> => {
    return apiRequest(
      api.get('/courses/popular')
    )
  },

  // Get enrolled courses for current user
  getEnrolledCourses: async (): Promise<Course[]> => {
    return apiRequest(
      api.get('/users/my-courses')
    )
  },

  // Get course progress for enrolled course
  getCourseProgress: async (courseId: number): Promise<{
    course_progress_percentage: number
    completed_lessons: number
    total_lessons: number
    completed_quizzes: number
    total_quizzes: number
  }> => {
    return apiRequest(
      api.get(`/courses/${courseId}/progress`)
    )
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<void> => {
    return apiRequest(
      api.post(`/courses/${courseId}/enroll`)
    )
  },

  // Get course categories
  getCategories: async (): Promise<CourseCategory[]> => {
    return apiRequest(
      api.get('/categories')
    )
  },

  // Get course tags
  getTags: async (): Promise<CourseTag[]> => {
    return apiRequest(
      api.get('/tags')
    )
  },

  // Get courses by category
  getCoursesByCategory: async (categoryId: number): Promise<Course[]> => {
    return apiRequest(
      api.get(`/categories/${categoryId}/courses`)
    )
  },

  // Get courses by instructor
  getCoursesByInstructor: async (instructorId: number): Promise<Course[]> => {
    return apiRequest(
      api.get(`/instructors/${instructorId}/courses`)
    )
  },

  // Search courses
  searchCourses: async (query: string, filters: Partial<CourseFilters> = {}): Promise<PaginatedResponse<Course>> => {
    const params = new URLSearchParams({ search: query })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return apiRequest(
      api.get(`/courses/search/?${params.toString()}`)
    )
  },

  // Wishlist operations
  getWishlist: async (): Promise<Course[]> => {
    return apiRequest(
      api.get('/wishlist')
    )
  },

  addToWishlist: async (courseId: number): Promise<void> => {
    return apiRequest(
      api.post('/wishlist', { course_id: courseId })
    )
  },

  removeFromWishlist: async (courseId: number): Promise<void> => {
    return apiRequest(
      api.delete(`/wishlist/${courseId}`)
    )
  },

  // Course reviews
  getCourseReviews: async (courseId: number): Promise<{
    reviews: any[]
    average_rating: number
    total_reviews: number
    rating_breakdown: Record<number, number>
  }> => {
    return apiRequest(
      api.get(`/courses/${courseId}/reviews`)
    )
  },

  addCourseReview: async (courseId: number, review: {
    rating: number
    review_title: string
    review_content: string
  }): Promise<void> => {
    return apiRequest(
      api.post(`/courses/${courseId}/reviews`, review)
    )
  },

  // Course curriculum
  getCourseCurriculum: async (courseId: number): Promise<{
    lessons: any[]
    quizzes: any[]
    total_duration: string
  }> => {
    return apiRequest(
      api.get(`/courses/${courseId}/curriculum`)
    )
  },

  // Course announcements
  getCourseAnnouncements: async (courseId: number): Promise<any[]> => {
    return apiRequest(
      api.get(`/courses/${courseId}/announcements`)
    )
  },

  // Course certificates
  getCourseCertificate: async (courseId: number): Promise<{
    certificate_url: string
    completion_date: string
    certificate_id: string
  }> => {
    return apiRequest(
      api.get(`/courses/${courseId}/certificate`)
    )
  },

  // Create course
  createCourse: async (courseData: any): Promise<Course> => {
    return apiRequest(
      api.post('/courses', courseData)
    )
  },

  // Update course
  updateCourse: async (courseId: number, courseData: any): Promise<Course> => {
    return apiRequest(
      api.put(`/courses/${courseId}`, courseData)
    )
  },

  // Delete course
  deleteCourse: async (courseId: number): Promise<{ message: string }> => {
    return apiRequest(
      api.delete(`/courses/${courseId}`)
    )
  },

  // Publish course
  publishCourse: async (courseId: number): Promise<{ message: string; course_id: number; status: string }> => {
    return apiRequest(
      api.patch(`/courses/${courseId}/publish`)
    )
  },

  // Unpublish course (set to draft)
  unpublishCourse: async (courseId: number): Promise<{ message: string; course_id: number; status: string }> => {
    return apiRequest(
      api.patch(`/courses/${courseId}/unpublish`)
    )
  },

  // Create lesson for a course
  createLesson: async (courseId: number, lessonData: {
    title: string
    content?: string
    video_url?: string
    video_duration?: number
    is_preview?: boolean
    youtube_url?: string
  }): Promise<any> => {
    return apiRequest(
      api.post(`/courses/${courseId}/lessons`, lessonData)
    )
  },

  // Instructor-specific endpoints
  instructor: {
    // Get instructor courses
    getCourses: async (): Promise<Course[]> => {
      return apiRequest(
        api.get('/instructor/courses')
      )
    },

    // Get course students
    getCourseStudents: async (courseId: number): Promise<any[]> => {
      return apiRequest(
        api.get(`/instructor/courses/${courseId}/students`)
      )
    },

    // Get course analytics
    getCourseAnalytics: async (courseId: number): Promise<{
      total_enrollments: number
      completion_rate: number
      average_rating: number
      revenue: number
      student_activity: any[]
    }> => {
      return apiRequest(
        api.get(`/instructor/courses/${courseId}/analytics`)
      )
    },

    // Upload course materials
    uploadCourseMaterial: async (courseId: number, file: File, type: string): Promise<{
      url: string
      filename: string
    }> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      return apiRequest(
        api.post(`/instructor/courses/${courseId}/materials`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )
    },
  },
}
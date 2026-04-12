import { api } from './axios'

export interface DashboardStats {
  enrolled_courses?: number
  completed_courses?: number
  total_hours?: number
  certificates?: number
  total_courses?: number
  total_students?: number
  total_earnings?: string
  average_rating?: number
  total_revenue?: string
  active_enrollments?: number
}

export interface EnrolledCourse {
  id: number
  title: string
  thumbnail: string
  progress: number
  totalLessons: number
  completedLessons: number
  instructor: string
  rating: number
  nextLesson?: string | null
}

export interface InstructorCourse {
  id: number
  title: string
  students: number
  total_enrollments: number
  rating: number
  average_rating: number
  earnings: number
  course_price: number
  course_sale_price: number
  course_duration: string
  status: string
}

export interface AdminCourse {
  id: number
  title: string
  students: number
  revenue: string
  rating: number
  status: string
}

export interface Enrollment {
  student: string
  course: string
  date: string
  status: string
}

export interface StudentDashboardData {
  stats: DashboardStats
  enrolled_courses: EnrolledCourse[]
  recent_activity: any[]
  weekly_goal?: {
    goal_hours: number
    completed_hours: number
    progress_percentage: number
    lessons_completed: number
  }
}

export interface InstructorDashboardData {
  stats: DashboardStats
  courses: InstructorCourse[]
  recent_activity: any[]
}

export interface AdminDashboardData {
  user_stats: {
    total_users: number
    active_users: number
    students: number
    instructors: number
    new_users_30d: number
  }
  course_stats: {
    total_courses: number
    published_courses: number
    draft_courses: number
    avg_rating: number
  }
  enrollment_stats: {
    total_enrollments: number
    completed_enrollments: number
    completion_rate: number
    new_enrollments_30d: number
  }
  revenue_stats: {
    total_revenue: number
    avg_course_price: number
    revenue_30d: number
  }
}

export const dashboardAPI = {
  // Get student dashboard data
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await api.get('/dashboard/student')
    return response.data
  },

  // Get instructor dashboard data
  getInstructorDashboard: async (): Promise<InstructorDashboardData> => {
    const response = await api.get('/dashboard/instructor')
    return response.data
  },

  // Get admin dashboard data
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await api.get('/admin/stats')
    return response.data
  },
}

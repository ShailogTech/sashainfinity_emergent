import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  UserPlus,
  ShoppingCart,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { dashboardAPI, AdminDashboardData } from '@/api/dashboard'

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = React.useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const data = await dashboardAPI.getAdminDashboard()
        setDashboardData(data)
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err)
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const stats = [
    {
      title: 'Total Courses',
      value: dashboardData?.course_stats?.total_courses?.toString() || '0',
      change: '+2',
      changeType: 'increase',
      icon: BookOpen,
      color: 'blue',
      link: '/admin/courses'
    },
    {
      title: 'Total Students',
      value: dashboardData?.user_stats?.students?.toString() || '0',
      change: `+${dashboardData?.user_stats?.new_users_30d || 0}`,
      changeType: 'increase',
      icon: Users,
      color: 'green',
      link: '/admin/students'
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardData?.revenue_stats?.total_revenue?.toLocaleString() || '0'}`,
      change: '+12%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'purple',
      link: '/admin/orders'
    },
    {
      title: 'Active Enrollments',
      value: dashboardData?.enrollment_stats?.total_enrollments?.toString() || '0',
      change: `+${dashboardData?.enrollment_stats?.new_enrollments_30d || 0}`,
      changeType: 'increase',
      icon: TrendingUp,
      color: 'orange',
      link: '/admin/enrollments'
    }
  ]

  const recentCourses: any[] = dashboardData?.course_stats?.recent_courses || []
  const recentEnrollments: any[] = dashboardData?.enrollment_stats?.recent_enrollments || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SashaInfinity LMS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to SashaInfinity LMS Admin Panel</p>
        </div>
      </div>

      {/* Stats Grid - SashaInfinity Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              {stat.changeType === 'increase' ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              ) : (
                <span className="flex items-center text-red-600 text-sm font-medium">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Top Performing Courses</h2>
              <Link to="/admin/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <Link
                      to={`/admin/courses/${course.id}/edit`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.students} students
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {course.revenue}
                      </span>
                      <span className="flex items-center">
                        ⭐ {course.rating}
                      </span>
                    </div>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Enrollments</h2>
              <Link to="/admin/enrollments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentEnrollments.map((enrollment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {enrollment.student.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.student}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{enrollment.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {enrollment.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - SashaInfinity LMS Style */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/students"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <UserPlus className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Manage Students</p>
                <p className="text-sm text-gray-600">View all students</p>
              </div>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Check performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

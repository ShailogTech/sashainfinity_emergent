import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  Activity,
  PenSquare,
  User,
  Edit3,
  Settings
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { dashboardAPI, InstructorDashboardData } from '@/api/dashboard'
import { api } from '@/api/axios'
import { useAuth } from '@/hooks/use-auth'

interface AssignmentWithSubmissions {
  id: number
  title: string
  course_title: string
  course_id: number
  total_submissions: number
  ungraded_submissions: number
  graded_submissions: number
  due_date?: string
}

export function InstructorDashboard() {
  const navigate = useNavigate()
  const { user, fullName } = useAuth()
  const [dashboardData, setDashboardData] = React.useState<InstructorDashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [assignments, setAssignments] = React.useState<AssignmentWithSubmissions[]>([])
  const [loadingAssignments, setLoadingAssignments] = React.useState(true)
  const [profile, setProfile] = React.useState<any>(null)
  const [loadingProfile, setLoadingProfile] = React.useState(true)

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const data = await dashboardAPI.getInstructorDashboard()
        setDashboardData(data)
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err)
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile')
        setProfile(response.data)
      } catch (err: any) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchDashboard()
    fetchProfile()
  }, [])

  React.useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true)
        // Use dashboard endpoint to get courses
        const dashboardResponse = await dashboardAPI.getInstructorDashboard()
        const courses = dashboardResponse.courses || []

        const assignmentsData: AssignmentWithSubmissions[] = []

        for (const course of courses) {
          try {
            const assignmentsResponse = await api.get(`/courses/${course.id}/assignments`)
            const courseAssignments = assignmentsResponse.data || []

            for (const assignment of courseAssignments) {
              try {
                const submissionsResponse = await api.get(`/assignments/${assignment.id}/submissions`)
                const submissions = submissionsResponse.data.submissions || []

                assignmentsData.push({
                  id: assignment.id,
                  title: assignment.title,
                  course_title: course.title,
                  course_id: course.id,
                  total_submissions: submissions.length,
                  ungraded_submissions: submissions.filter((s: any) => s.status === 'submitted').length,
                  graded_submissions: submissions.filter((s: any) => s.status === 'graded').length,
                  due_date: assignment.dueDate
                })
              } catch (err) {
                console.error(`Failed to fetch submissions for assignment ${assignment.id}:`, err)
              }
            }
          } catch (err) {
            console.error(`Failed to fetch assignments for course ${course.id}:`, err)
          }
        }

        setAssignments(assignmentsData)
      } catch (err: any) {
        console.error('Failed to fetch assignments:', err)
      } finally {
        setLoadingAssignments(false)
      }
    }

    fetchAssignments()
  }, [])

  const pendingCount = assignments.filter(a => a.ungraded_submissions > 0).length
  const totalPendingSubmissions = assignments.reduce((sum, a) => sum + a.ungraded_submissions, 0)

  const stats = [
    {
      icon: BookOpen,
      label: 'Active Courses',
      value: dashboardData?.stats?.total_courses?.toString() || '0',
      change: `${dashboardData?.stats?.total_courses || 0} published`,
      changeType: 'neutral' as const,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      icon: Users,
      label: 'Total Students',
      value: dashboardData?.stats?.total_students?.toString() || '0',
      change: 'across all courses',
      changeType: 'positive' as const,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      icon: FileText,
      label: 'Pending Reviews',
      value: totalPendingSubmissions.toString(),
      change: `${pendingCount} assignments`,
      changeType: totalPendingSubmissions > 0 ? 'warning' as const : 'neutral' as const,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: dashboardData?.stats?.average_rating?.toFixed(1) || '0.0',
      change: 'overall rating',
      changeType: (dashboardData?.stats?.average_rating || 0) >= 4.0 ? 'positive' as const : 'neutral' as const,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    }
  ]

  const courses = dashboardData?.courses || []
  const recentActivity = dashboardData?.recent_activity || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Instructor Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Manage your courses and review submissions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/instructor/blog">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 flex items-center gap-2 font-semibold">
                  <PenSquare className="w-5 h-5" />
                  Manage Blog
                </button>
              </Link>
              <Link to="/instructor/courses/create">
                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 flex items-center gap-2 font-semibold">
                  <BookOpen className="w-5 h-5" />
                  Create New Course
                </button>
              </Link>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    {profile?.profile_photo ? (
                      <img
                        src={profile.profile_photo}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary-100 text-primary-600 text-lg font-bold">
                        {fullName?.charAt(0) || 'I'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-1 border-2 border-white">
                    <User className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {fullName || 'Instructor'}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {profile?.designation && (
                    <p className="text-sm text-primary-600 font-medium">{profile.designation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/instructor/profile')}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Instructor Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`}
              />

              <div className={`relative bg-white border-2 ${stat.borderColor} rounded-2xl p-6 hover:border-opacity-100 border-opacity-50 transition-all hover:transform hover:scale-105 hover:shadow-xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  {stat.changeType === 'positive' && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                  {stat.changeType === 'warning' && (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'warning' ? 'text-orange-600' :
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assignment Review Queue - Light Modern Design */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Assignment Review Queue</h2>
                  <p className="text-gray-600 mt-1">
                    {pendingCount > 0 ? (
                      <>
                        <span className="text-orange-600 font-semibold">{pendingCount}</span> assignments with{' '}
                        <span className="text-orange-600 font-semibold">{totalPendingSubmissions}</span> pending submissions
                      </>
                    ) : (
                      'All submissions reviewed! 🎉'
                    )}
                  </p>
                </div>
              </div>
              <Activity className="h-6 w-6 text-gray-300" />
            </div>

            <div className="space-y-3">
              {loadingAssignments ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : assignments.length > 0 ? (
                assignments
                  .sort((a, b) => b.ungraded_submissions - a.ungraded_submissions)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="group bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-primary-300 rounded-xl p-5 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {assignment.title}
                            </h3>
                            {assignment.ungraded_submissions > 0 && (
                              <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-lg shadow-md">
                                {assignment.ungraded_submissions} Pending
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {assignment.course_title}
                          </p>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{assignment.total_submissions} total</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>{assignment.graded_submissions} graded</span>
                            </div>
                            {assignment.due_date && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/instructor/assignments/${assignment.id}/grade`}
                          className="ml-6"
                        >
                          <button className={`group/btn px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                            assignment.ungraded_submissions > 0
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                            {assignment.ungraded_submissions > 0 ? 'Review Now' : 'View All'}
                            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-16">
                  <div className="p-6 bg-gray-50 rounded-2xl inline-block mb-4">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto" />
                  </div>
                  <p className="text-xl font-semibold text-gray-600 mb-2">No assignments yet</p>
                  <p className="text-gray-500">Create assignments in your courses to see them here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
                </div>
                <Link to="/instructor/courses" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 transition-colors">
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : courses.length > 0 ? (
                  courses.slice(0, 3).map((course: any) => (
                    <div key={course.id} className="bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-primary-200 rounded-xl p-4 transition-all group hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.total_enrollments}</span>
                            </div>
                            {course.average_rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-gray-900 font-medium">{course.average_rating}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{course.course_sale_price || course.course_price}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200 border">
                          Published
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600">No courses found</p>
                    {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                </div>
              </div>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'enrollment' ? 'bg-green-50' :
                        activity.type === 'review' ? 'bg-yellow-50' :
                        activity.type === 'question' ? 'bg-blue-50' :
                        'bg-purple-50'
                      }`}>
                        {activity.type === 'enrollment' && <Users className="h-4 w-4 text-green-600" />}
                        {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-600" />}
                        {activity.type === 'question' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'completion' && <Award className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard

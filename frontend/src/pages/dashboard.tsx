import * as React from "react"
import { Link } from "react-router-dom"
import { BookOpen, Clock, Award, TrendingUp, Play, Calendar, Star, Users, Download, Eye, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CourseCard } from "@/components/course/course-card"
import { useAuth } from "@/hooks/use-auth"
import { dashboardAPI, StudentDashboardData } from "@/api/dashboard"
import { certificatesAPI } from "@/api/certificates"
import toast from "react-hot-toast"
import { getCertificateUrl } from "@/config/urls"

export const DashboardPage = () => {
  const { user, fullName } = useAuth()
  const [dashboardData, setDashboardData] = React.useState<StudentDashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const data = await dashboardAPI.getStudentDashboard()
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
      title: "Enrolled Courses",
      value: dashboardData?.stats?.enrolled_courses || 0,
      icon: BookOpen,
      color: "text-primary-600",
      bgColor: "bg-primary-100",
    },
    {
      title: "Completed Courses",
      value: dashboardData?.stats?.completed_courses || 0,
      icon: Award,
      color: "text-success-600",
      bgColor: "bg-success-100",
    },
    {
      title: "Total Hours",
      value: dashboardData?.stats?.total_hours || 0,
      icon: Clock,
      color: "text-warning-600",
      bgColor: "bg-warning-100",
    },
    {
      title: "Certificates",
      value: dashboardData?.stats?.certificates || 0,
      icon: Award,
      color: "text-secondary-600",
      bgColor: "bg-secondary-100",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const enrolledCourses = dashboardData?.enrolled_courses || []

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {fullName}! 👋
          </h1>
          <p className="text-neutral-600">
            Continue your learning journey and achieve your goals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-600" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-neutral-500 mt-2">Loading courses...</p>
                  </div>
                ) : enrolledCourses.filter(c => c.progress < 100).length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-600 mb-4">No courses in progress</p>
                    <Button asChild>
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {enrolledCourses.filter(c => c.progress < 100).map((course) => (
                    <div key={course.id} className="flex gap-4 p-4 border border-neutral-200 rounded-lg hover:shadow-soft transition-shadow">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 mb-1 truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          by {course.instructor}
                        </p>
                        <div className="space-y-2">
                          <Progress value={course.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-neutral-500">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>{course.progress}% complete</span>
                          </div>
                        </div>
                        {course.nextLesson && (
                          <p className="text-xs text-primary-600 mt-2">
                            Next: {course.nextLesson}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{course.rating}</span>
                        </div>
                        <Button size="sm" asChild>
                          <Link to={`/courses/${course.id}`}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-success-600" />
                    Completed Courses
                  </CardTitle>
                  <Badge variant="success">
                    {enrolledCourses.filter(c => c.progress === 100).length} completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-success-600 mx-auto"></div>
                    <p className="text-neutral-500 mt-2">Loading completed courses...</p>
                  </div>
                ) : enrolledCourses.filter(c => c.progress === 100).length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-600 mb-2">No completed courses yet</p>
                    <p className="text-sm text-neutral-500">Complete a course to earn your certificate!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCourses.filter(c => c.progress === 100).map((course) => (
                    <div key={course.id} className="flex gap-4 p-4 border border-neutral-200 rounded-lg">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          by {course.instructor}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="success" size="sm">Completed</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const cert = await certificatesAPI.getCertificateByCourse(course.id)
                                if (cert) {
                                  // Open certificate with backend URL
                                  const certificateUrl = getCertificateUrl(cert.certificate_url)
                                  window.open(certificateUrl, '_blank')
                                } else {
                                  toast.error('Certificate not found')
                                }
                              } catch (error) {
                                toast.error('Failed to view certificate')
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const cert = await certificatesAPI.getCertificateByCourse(course.id)
                                if (cert) {
                                  await certificatesAPI.downloadCertificate(cert.id)
                                  toast.success('Certificate downloaded')
                                } else {
                                  toast.error('Certificate not found')
                                }
                              } catch (error) {
                                toast.error('Failed to download certificate')
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              toast.loading('Regenerating certificate...')
                              const result = await certificatesAPI.regenerateCertificate(course.id)
                              toast.dismiss()
                              toast.success('Certificate regenerated successfully!')
                              // Refresh the page to show new certificate
                              window.location.reload()
                            } catch (error) {
                              toast.dismiss()
                              toast.error('Failed to regenerate certificate')
                            }
                          }}
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Learning Streak */}

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  This Week's Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-neutral-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary-600"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${dashboardData?.weekly_goal?.progress_percentage || 0}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">
                        {dashboardData?.weekly_goal?.progress_percentage || 0}%
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Study {dashboardData?.weekly_goal?.goal_hours || 5} hours
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    {dashboardData?.weekly_goal?.completed_hours || 0} / {dashboardData?.weekly_goal?.goal_hours || 5} hours completed
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    {dashboardData?.weekly_goal?.lessons_completed || 0} lessons completed this week
                  </p>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/courses">
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.recent_activity || []).length > 0 ? (
                    dashboardData?.recent_activity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 w-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900">
                            {activity.title || activity.action}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {activity.course || activity.description} • {activity.time || activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-sm text-neutral-600 font-medium mb-1">No recent activity yet</p>
                      <p className="text-xs text-neutral-500">
                        Start learning to see your activity here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/wishlist">
                    <Star className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/profile">
                    <Users className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
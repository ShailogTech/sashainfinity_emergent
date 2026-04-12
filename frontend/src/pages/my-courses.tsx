import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, Award, BookOpen, MoreVertical, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { courseAPI } from '@/api/course'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { getCourseThumbnailUrl } from '@/utils/media'

interface EnrolledCourse {
  id: number
  title: string
  thumbnail: string
  progress: number
  enrolled_at: string
  last_accessed: string
  completion_date: string | null
  status: string
}

const filters = ['All Courses', 'In Progress', 'Completed', 'Not Started']

export function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All Courses')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true)
      const data = await courseAPI.getEnrolledCourses()
      setEnrolledCourses(data)
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error)
      toast.error('Failed to load enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const getCourseStatus = (course: EnrolledCourse) => {
    if (course.completion_date) return 'completed'
    if (course.progress > 0) return 'in-progress'
    return 'not-started'
  }

  const formatLastAccessed = (dateString: string) => {
    if (!dateString) return 'Never'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const filteredCourses = enrolledCourses.filter(course => {
    const courseStatus = getCourseStatus(course)
    const statusMatch = activeFilter === 'All Courses' ||
      (activeFilter === 'In Progress' && courseStatus === 'in-progress') ||
      (activeFilter === 'Completed' && courseStatus === 'completed') ||
      (activeFilter === 'Not Started' && courseStatus === 'not-started')

    return statusMatch
  })

  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter(c => getCourseStatus(c) === 'in-progress').length,
    completed: enrolledCourses.filter(c => getCourseStatus(c) === 'completed').length,
    certificates: enrolledCourses.filter(c => c.completion_date !== null).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Courses</p>
          </Card>
          <Card className="p-4 text-center">
            <h3 className="text-2xl font-bold text-blue-600">{stats.inProgress}</h3>
            <p className="text-sm text-gray-600">In Progress</p>
          </Card>
          <Card className="p-4 text-center">
            <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>
          <Card className="p-4 text-center">
            <h3 className="text-2xl font-bold text-purple-600">{stats.certificates}</h3>
            <p className="text-sm text-gray-600">Certificates</p>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const courseStatus = getCourseStatus(course)
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getCourseThumbnailUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    {courseStatus === 'completed' && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <Progress value={course.progress || 0} className="h-2" />

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="capitalize">{course.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/courses/${course.id}/learn`}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {courseStatus === 'not-started' ? 'Start Course' : 'Continue'}
                        </span>
                      </Link>

                      {course.completion_date && (
                        <Link to={`/certificates/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Certificate
                          </Button>
                        </Link>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Last accessed: {formatLastAccessed(course.last_accessed)}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => {
              const courseStatus = getCourseStatus(course)
              return (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-6">
                    <img
                      src={getCourseThumbnailUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">{course.status}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {courseStatus === 'completed' && (
                            <Badge className="bg-green-600">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{course.progress || 0}%</span>
                          </div>
                          <Progress value={course.progress || 0} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Link
                            to={`/courses/${course.id}/learn`}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <Play className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {courseStatus === 'not-started' ? 'Start Course' : 'Continue'}
                            </span>
                          </Link>

                          {course.completion_date && (
                            <Link to={`/certificates/${course.id}`}>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Certificate
                              </Button>
                            </Link>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Last accessed: {formatLastAccessed(course.last_accessed)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'All Courses'
                ? "You haven't enrolled in any courses yet."
                : `No courses match the "${activeFilter}" filter.`}
            </p>
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
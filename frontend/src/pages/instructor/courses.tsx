import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Star, DollarSign, Eye, Edit, Trash2, Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { api } from '@/api/axios'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'


interface Course {
  id: number
  title: string
  post_title?: string
  description: string
  post_excerpt?: string
  thumbnail: string
  course_thumbnail?: string
  status: 'published' | 'draft' | 'pending'
  post_status?: string
  students: number
  total_enrollments?: number
  rating: number
  average_rating?: number
  reviews: number
  price: number
  course_price?: number
  earnings: number
  createdAt: string
  created_at?: string
  lastUpdated: string
  updated_at?: string
  category: string
  course_category?: string
  duration: string
  course_duration?: string
  instructor?: {
    id: number
    name: string
    avatar?: string
  }
}

export function InstructorCourses() {
  const accessToken = useAuthStore(state => state.accessToken)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 12

  const getAuthHeader = () => {
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` }
    }
    return {}
  }

  useEffect(() => {
    fetchCourses()
  }, [currentPage])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses/my-courses', {
        params: {
          page: currentPage,
          page_size: pageSize
        }
      })

      // Set pagination data
      setTotalPages(response.data.total_pages || 1)
      setTotalItems(response.data.total || 0)

      // Transform backend data to match frontend interface
      const transformedCourses = (response.data.courses || []).map((course: any) => ({
        id: course.id,
        title: course.post_title || course.title,
        description: course.post_excerpt || course.description || '',
        thumbnail: course.course_thumbnail || course.thumbnail || '/api/placeholder/300/200',
        status: course.post_status === 'publish' ? 'published' : course.post_status || 'draft',
        students: course.total_enrollments || 0,
        rating: course.average_rating || 0,
        reviews: 0, // TODO: Add reviews count from backend
        price: parseFloat(course.course_price || course.price || 0),
        earnings: 0, // TODO: Calculate earnings from backend
        createdAt: course.created_at || course.createdAt || new Date().toISOString(),
        lastUpdated: course.updated_at || course.lastUpdated || 'Recently',
        category: course.course_category || course.category || 'Uncategorized',
        duration: course.course_duration || course.duration || 'N/A',
        instructor: course.instructor || {
          id: 0,
          name: 'Unknown',
          avatar: undefined
        }
      }))

      setCourses(transformedCourses)
    } catch (error: any) {
      console.error('Failed to fetch courses:', error)
      toast.error('Failed to load your courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleRequestApproval = async (courseId: number, courseTitle: string) => {
    try {
      const response = await api.patch(`/courses/${courseId}/publish`)

      if (response.status === 200) {
        toast.success(`"${courseTitle}" submitted for approval`)
        // Refresh courses to update the status
        fetchCourses()
      } else {
        throw new Error(response.data?.detail || 'Failed to submit for approval')
      }
    } catch (error: any) {
      console.error('Failed to submit for approval:', error)
      toast.error(error.message || 'Failed to submit for approval')
    }
  }

  const handleDeleteCourse = async (courseId: number, courseTitle: string, hasEnrollments: boolean = false) => {
    const user = useAuthStore.getState().user
    console.log('Delete course called:', { courseId, courseTitle, hasEnrollments, userRole: user?.role, isAdmin: user?.role === 'admin' })

    // If course has enrollments and user is admin, offer force delete
    if (hasEnrollments && user?.role === 'admin') {
      console.log('Admin force delete path triggered')
      const forceDelete = window.confirm(
        `⚠️ ADMIN FORCE DELETE\n\n` +
        `"${courseTitle}" has active enrollments.\n\n` +
        `If you proceed:\n` +
        `• All enrolled students will be unenrolled\n` +
        `• Students will receive email notifications\n` +
        `• All course content will be permanently deleted\n\n` +
        `Do you want to FORCE DELETE this course?`
      )

      if (!forceDelete) return

      try {
        const response = await api.delete(`/courses/${courseId}?force=true`)

        // Remove from local state
        setCourses(prev => prev.filter(course => course.id !== courseId))

        const data = response.data
        toast.success(
          `Course deleted successfully!\n` +
          `${data.enrollments_removed} enrollment(s) removed\n` +
          `${data.students_notified} student(s) notified`,
          { duration: 6000 }
        )
      } catch (error: any) {
        console.error('Failed to force delete course:', error)
        const errorMessage = error.response?.data?.detail || 'Failed to delete course'
        toast.error(errorMessage, { duration: 5000 })
      }
      return
    }

    // Regular deletion (no enrollments or non-admin)
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone and will delete all lessons, quizzes, and assignments.\n\nNote: Courses with active enrollments cannot be deleted.`)) {
      return
    }

    try {
      await api.delete(`/courses/${courseId}`)

      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== courseId))
      toast.success(`Course "${courseTitle}" deleted successfully`)
    } catch (error: any) {
      console.error('Failed to delete course:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to delete course'
      toast.error(errorMessage, {
        duration: 5000  // Show error longer so users can read the full message
      })
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'students':
        return b.students - a.students
      case 'earnings':
        return b.earnings - a.earnings
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-600'
      case 'draft':
        return 'bg-gray-600'
      case 'pending':
        return 'bg-yellow-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage and track your course performance</p>
          </div>
          <Link to="/instructor/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="students">Most Students</option>
                <option value="earnings">Highest Earnings</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={getStatusColor(course.status)}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {course.duration}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{course.category}</span>
                  <span className="ml-auto">Updated {course.lastUpdated}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{course.students} students</span>
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>{course.rating} ({course.reviews})</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>₹{course.price}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-green-600 font-medium">₹{course.earnings}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Link to={`/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {(() => {
                      const currentUser = useAuthStore.getState().user
                      const isInstructorOwnCourse = course.instructor?.id === currentUser?.id
                      const isDraftStatus = course.status === 'draft' || course.post_status === 'draft'

                      // If course is draft and instructor ID doesn't match current user, show Approve Now button
                      if (isDraftStatus && !isInstructorOwnCourse) {
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:text-green-700 hover:border-green-400"
                            onClick={() => handleRequestApproval(course.id, course.title)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Approve Now
                          </Button>
                        )
                      }

                      // Otherwise show normal Edit button
                      return (
                        <Link to={`/instructor/courses/${course.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                  <div className="relative group">
                    {(() => {
                      const hasEnrollments = course.students > 0 || (course.total_enrollments && course.total_enrollments > 0)
                      const user = useAuthStore.getState().user
                      const isAdmin = user?.role === 'admin'

                      return (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              hasEnrollments && !isAdmin
                                ? 'text-gray-400 cursor-not-allowed opacity-50'
                                : hasEnrollments && isAdmin
                                ? 'text-orange-600 hover:text-orange-700 border-orange-300'
                                : 'text-red-600 hover:text-red-700'
                            }`}
                            onClick={() => {
                              console.log('Button clicked:', { hasEnrollments, isAdmin, userId: user?.id, userRole: user?.role })
                              handleDeleteCourse(course.id, course.title, hasEnrollments)
                            }}
                            disabled={hasEnrollments && !isAdmin}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {hasEnrollments && (
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                              {isAdmin ? (
                                <>
                                  <div className="font-semibold text-orange-400 mb-1">⚠️ ADMIN FORCE DELETE</div>
                                  <div>Click to force delete course with {course.students || course.total_enrollments} enrollment(s).</div>
                                  <div className="mt-1 text-gray-300">Students will be notified via email.</div>
                                </>
                              ) : (
                                <>Cannot delete course with {course.students || course.total_enrollments} active enrollment(s)</>
                              )}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Loading your courses...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && sortedCourses.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first course to get started'}
            </p>
            <Link to="/instructor/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </Link>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            showPageInfo={true}
          />
        )}
      </div>
    </div>
  )
}
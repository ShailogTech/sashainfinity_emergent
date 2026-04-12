import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Users, Clock, Trash2, ShoppingCart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { api } from '@/api/axios'
import { useAuthStore } from '@/store/auth'

interface WishlistCourse {
  id: number
  title: string
  instructor: {
    id: number
    name: string
  }
  rating: number
  stats?: {
    students: number
    duration: number
  }
  price: number
  level: string
  thumbnail: string
  wishlist_item_id?: number
}

export function WishlistPage() {
  const accessToken = useAuthStore(state => state.accessToken)
  const [courses, setCourses] = useState<WishlistCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/wishlist/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      setCourses(response.data.courses || [])
    } catch (error: any) {
      console.error('Failed to fetch wishlist:', error)
      toast.error('Failed to load wishlist')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (courseId: number, courseTitle: string) => {
    if (!window.confirm(`Remove "${courseTitle}" from your wishlist?`)) {
      return
    }

    try {
      await api.delete(`/wishlist/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== courseId))
      toast.success('Course removed from wishlist')
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to remove from wishlist'
      toast.error(errorMessage)
    }
  }

  const handleAddToCart = (courseId: number) => {
    // Handle add to cart
    toast.success('Added to cart!')
    console.log('Add to cart:', courseId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Keep track of courses you want to take</p>
        </div>

        {loading ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </Card>
        ) : courses.length > 0 ? (
          <div className="space-y-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-6">
                  <img
                    src={course.thumbnail || '/api/placeholder/300/200'}
                    alt={course.title}
                    className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 mb-3">By {course.instructor?.name || 'Unknown Instructor'}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{course.rating || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{(course.stats?.students || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{course.stats?.duration || 0} hours</span>
                          </div>
                        </div>

                        <Badge variant="outline">{course.level || 'All Levels'}</Badge>
                      </div>

                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-gray-900">${course.price || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button onClick={() => handleAddToCart(course.id)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Link to={`/courses/${course.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(course.id, course.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Browse courses and add them to your wishlist to keep track</p>
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
function ShowMoreContent({ content }: { content: string }) {
  const [expanded, setExpanded] = React.useState(false)
  if (!content) return null
  const isLong = content.length > 400
  return (
    <div>
      <div
        className={['prose max-w-none overflow-hidden transition-all duration-300 text-justify font-[Inter] leading-relaxed text-gray-700', !expanded && isLong ? 'max-h-32 relative' : ''].join(' ')}
        style={!expanded && isLong ? {maskImage:'linear-gradient(to bottom, black 60%, transparent 100%)',WebkitMaskImage:'linear-gradient(to bottom, black 60%, transparent 100%)'} : {}}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-orange-500 font-semibold text-sm hover:text-orange-600 flex items-center gap-1"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  )
}

import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  Play,
  Clock,
  Users,
  Star,
  Globe,
  Award,
  Share2,
  Heart,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Lock,
  MessageSquare,
  Eye,
  ShoppingCart,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/ui/star-rating"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import * as Tabs from "@radix-ui/react-tabs"
import * as Accordion from "@radix-ui/react-accordion"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/contexts/CartContext"
import { useCourseStore } from "@/store/course"
import { Course } from "@/types"
import { api } from "@/api/axios"
import { VideoPlayer } from "@/components/video/video-player"

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToCart, isInCart } = useCart()
  const [isEnrolled, setIsEnrolled] = React.useState(false)
  const [isInWishlist, setIsInWishlist] = React.useState(false)
  const [course, setCourse] = React.useState<Course | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [courseStatus, setCourseStatus] = React.useState<string>('')
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [isAdminPreview, setIsAdminPreview] = React.useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false)
  const [previewVideoUrl, setPreviewVideoUrl] = React.useState('')
  const [previewVideoTitle, setPreviewVideoTitle] = React.useState('')
  const [relatedCourses, setRelatedCourses] = React.useState<any[]>([])

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)

        const response = await api.get(`/courses/${id}`)
        const data = response.data

        // Debug instructor data
        console.log('Course API Response:', data)
        console.log('Instructor Data from API:', data.instructor)
        console.log('Instructor ID being used:', data.instructor?.id || 0)

        // Transform API response to match Course interface
        const transformedCourse: Course = {
          id: data.id,
          post_title: data.title,
          post_content: data.content,
          post_excerpt: data.excerpt,
          course_price: data.price,
          course_sale_price: data.sale_price || 0,
          course_price_type: data.price === 0 ? 'free' : 'paid',
          course_level: data.level,
          course_duration: (() => {
            const totalMins = data.stats?.duration || data.duration || 0
            if (totalMins === 0) return '0 hours'
            const hrs = Math.floor(totalMins / 60)
            const mins = totalMins % 60
            if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
            if (hrs > 0) return `${hrs} hour${hrs>1?'s':''}`
            return `${totalMins} min`
          })(),
          course_benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : '',
          course_requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : '',
          course_target_audience: '',
          course_material_includes: '',
          course_thumbnail: data.thumbnail,
          course_intro_video: data.intro_video || '',
          average_rating: data.rating,
          total_reviews: 0, // API doesn't provide review count in stats
          total_enrollments: data.stats?.students || 0,
          instructor: {
            id: data.instructor?.id || 0,
            display_name: data.instructor?.name || 'Unknown',
            user_email: '',
            user_login: '',
            user_nicename: '',
            user_registered: '',
            user_status: 0,
            is_active: true,
            is_verified: true,
            created_at: '',
            updated_at: '',
            last_login: ''
          },
          categories: [],
          lessons: data.lessons || [],
          slug: data.slug || String(data.id),
          created_at: data.created_at,
          updated_at: data.updated_at
        }

        setCourse(transformedCourse)
        // Set OG meta tags for social sharing
        const thumbnail = data.featured_image || data.thumbnail || ''
        const title = data.title || ''
        const desc = (data.description || '').slice(0, 200)
        document.title = title + ' | SashaInfinity'
        const setMeta = (prop: string, content: string) => {
          let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement
          if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
          el.setAttribute('content', content)
        }
        const setMetaN = (name: string, content: string) => {
          let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
          if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
          el.setAttribute('content', content)
        }
        const slug = data.slug || String(data.id)
        const url = `https://sashainfinity.com/courses/${slug}`
        setMeta('og:title', title)
        setMeta('og:description', desc)
        setMeta('og:image', thumbnail)
        setMeta('og:url', url)
        setMeta('og:type', 'website')
        setMeta('twitter:card', 'summary_large_image')
        setMeta('twitter:title', title)
        setMeta('twitter:description', desc)
        setMeta('twitter:image', thumbnail)
        setMetaN('description', desc)
        setIsEnrolled(data.is_enrolled || false)
        setCourseStatus(data.status || 'publish')

        // Check if admin is previewing unpublished course
        if (user?.role === 'admin' && data.status !== 'publish' && data.status !== 'published') {
          setIsAdminPreview(true)
        }

        // Fetch progress if enrolled
        if (data.is_enrolled && isAuthenticated) {
          try {
            const progressResponse = await api.get(`/courses/${id}/progress`)
            const progressData = progressResponse.data
            setProgress(progressData.progress_percentage || 0)

            // Check if course is completed (100% progress or completion_date exists)
            setIsCompleted(progressData.overall_progress >= 100 || !!progressData.completion_date)
          } catch (err) {
            console.error('Error fetching progress:', err)
          }
        } else {
          // Reset completion status if not enrolled
          setIsCompleted(false)
        }
      // Fetch related courses by same instructor
    try {
      const allRes = await api.get('/courses?limit=10')
      const allCourses = allRes.data?.courses || allRes.data || []
      const filtered = allCourses
        .filter((c: any) => c.id !== parseInt(id || courseId || '0'))
        .slice(0, 3)
      setRelatedCourses(filtered)
    } catch {}
    } catch (error) {
        console.error('Error fetching course:', error)
        setCourse(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCourse()
    }
  }, [id])

  const handleEnroll = async () => {
    try {
      if (!isAuthenticated) {
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
        return
      }
      console.log('Price check:', course?.course_price, course?.course_price_type)
      // Free course - direct enroll
      if (!course || course.course_price_type === 'free' || !course.course_price || Number(course.course_price) === 0) {
        await api.post(`/courses/${id}/enroll`)
        setIsEnrolled(true)
        alert('Successfully enrolled in the course!')
        window.location.reload()
        return
      }
      // Paid course - Razorpay checkout
      const orderResp = await api.post('/payments/create-order', {
        course_id: id,
        amount: course.course_price
      })
      const orderData = orderResp.data
      // Load Razorpay script
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }
      const options = {
        key: orderData.key_id || 'rzp_test_SWEFy9IXwQw7aF',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SashaInfinity LMS',
        description: course.post_title,
        order_id: orderData.order_id,
        handler: async (paymentResponse: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              course_id: id
            })
            setIsEnrolled(true)
            alert('Payment successful! You are now enrolled.')
            navigate(`/courses/${id}/learn`)
          } catch (err) {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: { name: '', email: '' },
        theme: { color: '#f97316' }
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Error enrolling:', error)
      alert(error.response?.data?.detail?.message || error.message || 'Failed to enroll')
    }
  }

  const handleWishlist = async () => {
    // TODO: Implement wishlist logic
    setIsInWishlist(!isInWishlist)
  }

  const handleAddToCart = () => {
    if (!course) return

    addToCart({
      courseId: course.id,
      title: course.post_title,
      instructor: course.instructor.display_name,
      price: course.course_price,
      salePrice: course.course_sale_price > 0 ? course.course_sale_price : undefined,
      thumbnail: (course.course_thumbnail || '').replace('http://lms.sashainfinity.com','https://sashainfinity.com').replace('https://lms.sashainfinity.com','https://sashainfinity.com'),
      level: course.course_level,
      rating: course.average_rating
    })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="text-brand-600 hover:underline">Browse all courses</Link>
        </div>
      </div>
    )
  }

  const hasDiscount = course.course_sale_price > 0 && course.course_sale_price < course.course_price
  const displayPrice = hasDiscount ? course.course_sale_price : course.course_price

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Admin Preview Banner */}
      {isAdminPreview && (
        <div className="bg-yellow-500 border-b-4 border-yellow-600">
          <div className="container-custom py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ADMIN PREVIEW
                </div>
                <div className="text-yellow-900 font-medium">
                  This course is currently <span className="font-bold uppercase">{courseStatus}</span> and not visible to students.
                </div>
              </div>
              <Link
                to="/admin/courses"
                className="bg-white text-yellow-700 hover:bg-yellow-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section with Gradient */}
      <div className="relative bg-white border-b border-gray-200 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-success-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom py-12 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Link to="/" className="hover:text-white">Home</Link>
                  <span>/</span>
                  <Link to="/courses" className="hover:text-white">Courses</Link>
                  <span>/</span>
                  <span className="text-white">React Development</span>
                </div>
              </nav>

              {/* Enhanced Course Info */}
              <div className="space-y-6">
                <div>
                  {/* Badge for course level */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 border border-primary-400/30 rounded-full mb-4">
                    <Award className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-primary-300">{course.course_level} Level</span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900 leading-tight tracking-tight font-[Lexend Deca]">
                    {course.post_title}
                  </h1>
                  <p className="text-base text-gray-600 mb-6 leading-relaxed text-justify">
                    {course.post_excerpt}
                  </p>
                </div>

                {/* Enhanced Meta Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-orange-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <StarRating rating={course.average_rating} size="sm" />
                        </div>
                        <p className="text-xs text-neutral-400">{course.total_reviews} reviews</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-orange-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{course.total_enrollments.toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">Students</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-orange-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5 text-success-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{course.course_duration}</p>
                        <p className="text-xs text-neutral-400">Duration</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-orange-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Globe className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">English</p>
                        <p className="text-xs text-neutral-400">Language</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Instructor Card */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-neutral-400 mb-3 uppercase tracking-wide">Taught by</p>
                  <div className="flex items-center gap-4">
                    <Avatar size="lg" className="ring-2 ring-primary-500/50">
                      <AvatarImage src="/api/placeholder/48/48" />
                      <AvatarFallback className="bg-primary-600 text-white text-lg font-bold">
                        {course.instructor?.display_name?.charAt(0) || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">
                        {course.instructor?.display_name}
                      </p>
                      <p className="text-sm text-neutral-400">Expert Instructor</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                      <Link to={`/instructor/${course.instructor?.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Enhanced Categories */}
                {course.categories && course.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-neutral-400 mr-2">Topics:</span>
                    {course.categories.map((category) => (
                      <Badge key={category.id} className="bg-primary-500/20 text-primary-300 border-primary-400/30 hover:bg-primary-500/30">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Course Preview Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 shadow-2xl border-primary-200 overflow-hidden">
                <div className="aspect-video relative overflow-hidden group">
                  <img
                    src={(course.course_thumbnail || '').replace('http://lms.sashainfinity.com','https://sashainfinity.com').replace('https://lms.sashainfinity.com','https://sashainfinity.com')}
                    alt={course.post_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.course_intro_video && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center group-hover:bg-black/60 transition-all">
                      <Button
                        size="lg"
                        className="bg-white text-primary-600 hover:bg-white/90 shadow-xl hover:scale-110 transition-all"
                        onClick={() => {
                          setPreviewVideoUrl(course.course_intro_video || '')
                          setPreviewVideoTitle(`Preview: ${course.post_title}`)
                          setIsVideoModalOpen(true)
                        }}
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Preview Course
                      </Button>
                    </div>
                  )}
                  {/* Enrolled badge */}
                  {isEnrolled && !isAdminPreview && (
                    <div className="absolute top-4 right-4 bg-success-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                      Enrolled
                    </div>
                  )}
                  {/* Admin Preview badge on thumbnail */}
                  {isAdminPreview && (
                    <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                      <Eye className="w-4 h-4" />
                      Preview Mode
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Enhanced Price Display */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border-2 border-primary-200">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-black text-primary-600">
                        {formatPrice(displayPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xl text-neutral-500 line-through">
                          {formatPrice(course.course_price)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <Badge className="bg-danger-600 text-white">
                        Save {Math.round(((course.course_price - course.course_sale_price) / course.course_price) * 100)}%
                      </Badge>
                    )}
                    {course.course_price_type === 'free' && (
                      <p className="text-sm text-primary-700 mt-2 font-medium">Limited time offer!</p>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-3">
                    {(isEnrolled || isAdminPreview) ? (
                      <>
                        {progress > 0 && !isAdminPreview && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-neutral-600 font-medium">Your Progress</span>
                              <span className="text-primary-600 font-bold">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {isCompleted ? (
                          <>
                            <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-success-600" />
                                <span className="font-semibold text-success-800">Course Completed!</span>
                              </div>
                              <p className="text-sm text-success-700">
                                Congratulations! You have successfully completed this course.
                              </p>
                            </div>
                            <Button size="lg" className="w-full bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" asChild>
                              <Link to={`/courses/${course.id}/learn`}>
                                <Award className="w-5 h-5 mr-2" />
                                Start Again
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <Button size="lg" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" asChild>
                            <Link to={`/courses/${course.id}/learn`}>
                              <PlayCircle className="w-5 h-5 mr-2" />
                              {isAdminPreview ? "Preview Course Content" : (progress > 0 ? "Continue Learning" : "Start Learning")}
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {course.course_price_type === "free" ? (
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-lg font-bold"
                            onClick={handleEnroll}
                          >
                            <Award className="w-5 h-5 mr-2" />
                            Enroll for Free
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            {isInCart(course.id) ? (
                              <Button
                                size="lg"
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/cart')}
                              >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Go to Cart
                              </Button>
                            ) : (
                              <Button
                                size="lg"
                                variant="outline"
                                className="w-full"
                                onClick={handleAddToCart}
                              >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-lg font-bold"
                              onClick={handleEnroll}
                            >
                              <Play className="w-5 h-5 mr-2" />
                              Buy Now
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                        onClick={handleWishlist}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
                        Wishlist
                      </Button>
                      <Button variant="outline" size="icon" className="hover:bg-primary-50 hover:border-primary-200 transition-all" onClick={() => {
                        const slug = (course as any)?.slug || course?.id;
                        const url = `${window.location.origin}/courses/${slug}`;
                        if (navigator.share) {
                          navigator.share({ title: course?.title || 'Course', url });
                        } else {
                          navigator.clipboard.writeText(url).then(() => {
                            alert('Link copied to clipboard!');
                          });
                        }
                      }}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Course Includes */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-base">This course includes:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">{course.course_duration || 'Self-paced'} of content</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">{course.lessons?.length || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium text-sm">{course.total_enrollments} students enrolled</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs.Root defaultValue="overview" className="w-full">
              <Tabs.List className="grid w-full grid-cols-4 bg-white rounded-lg p-1 shadow-soft">
                <Tabs.Trigger
                  value="overview"
                  className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-primary-600 data-[state=active]:text-white"
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="curriculum"
                  className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-primary-600 data-[state=active]:text-white"
                >
                  Curriculum
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="instructor"
                  className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-primary-600 data-[state=active]:text-white"
                >
                  Instructor
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="reviews"
                  className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-primary-600 data-[state=active]:text-white"
                >
                  Reviews
                </Tabs.Trigger>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ShowMoreContent content={course.post_content} />

                    {/* What You'll Learn */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">What you'll learn</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.course_benefits?.split('\n').map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {course.course_requirements?.split('\n').map((requirement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Audience */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Who this course is for</h3>
                      <ul className="space-y-2">
                        {course.course_target_audience?.split('\n').map((audience, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{audience}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Content>

              {/* Curriculum Tab */}
              <Tabs.Content value="curriculum" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <p className="text-neutral-600">
                      {course.lessons?.length || 0} lessons
                    </p>
                  </CardHeader>
                  <CardContent>
                    {!course.lessons || course.lessons.length === 0 ? (
                      <div className="text-center py-8 text-neutral-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                        <p>No lessons available yet.</p>
                        <p className="text-sm">The instructor is still building this course.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {course.lessons.map((lesson: any, index: number) => (
                          <div key={lesson.id || index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                                <PlayCircle className="w-4 h-4 text-neutral-600" />
                              </div>
                              <span className="font-medium">{lesson.lesson_title || lesson.title || `Lesson ${index + 1}`}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {(lesson.duration || lesson.lesson_duration) && (
                                <span className="text-sm text-neutral-600">{lesson.duration || lesson.lesson_duration} minute{(lesson.duration || lesson.lesson_duration) !== 1 ? 's' : ''}</span>
                              )}
                              {lesson.is_preview && !isEnrolled && !isAdminPreview ? (
                                <button
                                  className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const videoUrl = lesson.lesson_video || lesson.youtube_url || lesson.video_url || '';
                                    if (!videoUrl) {
                                      toast.error("Video URL is missing for this preview.");
                                      return;
                                    }
                                    setPreviewVideoUrl(videoUrl);
                                    setPreviewVideoTitle(`Preview: ${lesson.lesson_title || lesson.title}`);
                                    setIsVideoModalOpen(true);
                                  }}
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  Preview
                                </button>
                              ) : !isEnrolled && !isAdminPreview ? (
                                <Lock className="w-4 h-4 text-neutral-400 cursor-not-allowed" title="Enroll to unlock" />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Tabs.Content>

              {/* Instructor Tab */}
              <Tabs.Content value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar size="xl">
                        <AvatarImage src={course.instructor?.avatar || "/api/placeholder/80/80"} />
                        <AvatarFallback>
                          {course.instructor?.display_name?.substring(0, 2).toUpperCase() || 'IN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {course.instructor?.display_name || 'Unknown Instructor'}
                        </h3>
                        <p className="text-neutral-600 mb-4">
                          Course Instructor
                        </p>

                        <div className="py-4">
                          <p className="text-neutral-700 leading-relaxed">
                            Instructor profile information will be available soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Content>

              {/* Reviews Tab */}
              <Tabs.Content value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Student Reviews</CardTitle>
                      <div className="flex items-center gap-2">
                        <StarRating rating={course.average_rating} />
                        <span className="font-semibold">{course.average_rating}</span>
                        <span className="text-neutral-600">({course.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-neutral-600">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                      <p>No reviews yet.</p>
                      <p className="text-sm">Be the first to review this course!</p>
                    </div>
                  </CardContent>
                </Card>
              </Tabs.Content>
            </Tabs.Root>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Skill Level</span>
                  <Badge variant="secondary">{course.course_level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Students</span>
                  <span>{course.total_enrollments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Languages</span>
                  <span>English</span>
                </div>
                <div className="flex justify-between">
                  <span>Captions</span>
                  <span>Yes</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#082A5E]">More Courses by {course.instructor?.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedCourses.length > 0 ? relatedCourses.map((rc) => (
                    <Link key={rc.id} to={`/courses/${rc.id}`} className="flex gap-3 group hover:bg-orange-50 rounded-lg p-2 transition-all duration-200">
                      <img
                        src={rc.featured_image || rc.course_thumbnail || '/assets/images/course-placeholder.jpg'}
                        alt={rc.title || rc.post_title}
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90 transition-opacity"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/course-placeholder.jpg' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[#082A5E] mb-1 line-clamp-2 group-hover:text-[#f4911a] transition-colors">{rc.title || rc.post_title}</h4>
                        <div className="flex items-center gap-1 mb-1">
                          <StarRating rating={rc.average_rating || 0} size="sm" />
                          <span className="text-xs text-gray-500">({rc.total_reviews || 0})</span>
                        </div>
                        <p className="text-sm font-bold text-[#f4911a]">
                          {rc.course_price_type === 'free' ? 'Free' : `₹${rc.course_sale_price || rc.course_price || 0}`}
                        </p>
                      </div>
                    </Link>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">No other courses available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 rounded-full bg-black/50"
            onClick={() => {
              setIsVideoModalOpen(false)
              setPreviewVideoUrl('')
            }}
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
            <VideoPlayer
              src={previewVideoUrl}
              title={previewVideoTitle}
              onComplete={() => { }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
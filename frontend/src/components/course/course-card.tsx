import * as React from "react"
import { Link } from "react-router-dom"
import { Clock, Users, Star, BookOpen, Play } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/ui/star-rating"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Course } from "@/types"
import { cn } from "@/utils/cn"

interface CourseCardProps {
  course: Course
  variant?: "default" | "enrolled" | "compact"
  showProgress?: boolean
  progress?: number
  className?: string
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = "default",
  showProgress = false,
  progress = 0,
  className,
}) => {
  const isPaid = course.course_price_type === "paid"
  const hasDiscount = course.course_sale_price > 0 && course.course_sale_price < course.course_price
  const displayPrice = hasDiscount ? course.course_sale_price : course.course_price

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "success"
      case "intermediate":
        return "warning"
      case "advanced":
        return "danger"
      default:
        return "default"
    }
  }

  const getInstructorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (variant === "compact") {
    return (
      <Link to={`/courses/${course.id}`}>
        <Card className={cn("hover:shadow-medium transition-all duration-300", className)} hover>
          <div className="flex gap-4 p-4">
            <div className="relative w-24 h-16 flex-shrink-0">
              <img
                src={course.course_thumbnail || "/placeholder-course.jpg"}
                alt={course.post_title}
                className="w-full h-full object-cover rounded-md"
              />
              {course.course_intro_video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                {course.post_title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                <StarRating rating={course.average_rating} size="sm" showValue />
                <span>({course.total_reviews})</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Users className="w-3 h-3" />
                  <span>{course.total_enrollments}</span>
                </div>
                <div className="flex flex-col items-end">
                  {hasDiscount && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(course.course_price)}
                    </span>
                  )}
                  <div className="font-bold text-primary-600 text-sm">
                    {formatPrice(displayPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/courses/${course.id}`}>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 group",
          className
        )}
        hover
      >
        <div className="relative">
          <div className="aspect-video overflow-hidden">
            <img
              src={course.course_thumbnail || "/placeholder-course.jpg"}
              alt={course.post_title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Video overlay */}
          {course.course_intro_video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-neutral-800 ml-0.5" />
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={getLevelBadgeVariant(course.course_level)}>
              {course.course_level}
            </Badge>
            {!isPaid && (
              <Badge variant="success">Free</Badge>
            )}
            {hasDiscount && (
              <Badge variant="danger">
                {Math.round(((course.course_price - course.course_sale_price) / course.course_price) * 100)}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="ghost"
              className="bg-white/90 hover:bg-white"
              aria-label="Add to wishlist"
            >
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar size="sm">
              <AvatarImage src={course.instructor?.profile?.profile_photo} />
              <AvatarFallback>
                {getInstructorInitials(course.instructor?.display_name || "Instructor")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-neutral-600">
              {course.instructor?.display_name || "Instructor"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.post_title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
            {course.post_excerpt || course.post_content.replace(/<[^>]*>/g, "").slice(0, 100)}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-sm text-neutral-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessons?.length || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.course_duration || "Self-paced"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.total_enrollments}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StarRating rating={course.average_rating} size="sm" />
              <span className="text-sm text-neutral-600">
                {course.average_rating.toFixed(1)} ({course.total_reviews} reviews)
              </span>
            </div>
          </div>

          {/* Progress (if enrolled) */}
          {showProgress && variant === "enrolled" && (
            <div className="mb-3">
              <Progress
                value={progress}
                showLabel
                label="Progress"
                variant={progress === 100 ? "success" : "default"}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            {!course.is_enrolled && (
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-sm text-neutral-500 line-through">
                    {formatPrice(course.course_price)}
                  </span>
                )}
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(displayPrice)}
                </span>
              </div>
            )}

            {course.is_enrolled ? (
              <Button size="sm" variant="outline" className="ml-auto">
                {progress > 0 ? "Continue Learning" : "Start Learning"}
              </Button>
            ) : variant === "enrolled" ? (
              <Button size="sm" variant="outline">
                Continue Learning
              </Button>
            ) : (
              <Button size="sm">
                {isPaid ? "Enroll Now" : "Enroll for Free"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
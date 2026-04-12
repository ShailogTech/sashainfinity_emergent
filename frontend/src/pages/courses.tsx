import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Filter, Search, Grid, List, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CourseCard } from "@/components/course/course-card"
import { Pagination } from "@/components/ui/pagination"
import * as Select from "@radix-ui/react-select"
import * as Dialog from "@radix-ui/react-dialog"
import { useCourseStore } from "@/store/course"
import { Course } from "@/types"
import { api } from "@/api/axios"

// API Configuration now uses the configured axios instance

// Updated Course interface to match API response
interface APICourse {
  id: number
  title: string
  description: string
  post_excerpt: string
  post_content: string
  course_price: number
  course_sale_price: number
  course_price_type: string
  course_level: string
  course_duration: string
  course_thumbnail: string
  course_intro_video?: string
  average_rating: number
  total_reviews: number
  total_enrollments: number
  instructor: {
    id: number
    display_name: string
    user_email: string
    profile: {
      profile_photo: string
      bio: string
      qualifications: string[]
      experience_years: number
    }
  }
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  lessons: Array<{
    id: number
    title: string
    duration: string
    lesson_type: string
  }>
}

// Function to convert API course to local Course interface
const convertAPICourseToLocal = (apiCourse: APICourse): Course => {
  console.log('Courses API - Instructor ID:', apiCourse.instructor.id, 'Instructor Name:', apiCourse.instructor.display_name)

  return {
    id: apiCourse.id,
    post_title: apiCourse.title,
    post_excerpt: apiCourse.post_excerpt,
    post_content: apiCourse.post_content,
    course_price: apiCourse.course_price,
    course_sale_price: apiCourse.course_sale_price,
    course_price_type: apiCourse.course_price_type,
    course_level: apiCourse.course_level,
    course_duration: apiCourse.course_duration,
    course_thumbnail: apiCourse.course_thumbnail,
    course_intro_video: apiCourse.course_intro_video,
    average_rating: apiCourse.average_rating,
    total_reviews: apiCourse.total_reviews,
    total_enrollments: apiCourse.total_enrollments,
    instructor: {
      id: apiCourse.instructor.id,
      display_name: apiCourse.instructor.display_name,
      user_email: apiCourse.instructor.user_email,
      user_login: apiCourse.instructor.display_name.toLowerCase(),
      user_nicename: apiCourse.instructor.display_name.toLowerCase(),
      user_registered: "2024-01-01",
      user_status: 0,
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      last_login: "2024-01-01",
      profile: apiCourse.instructor.profile
    },
    categories: apiCourse.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: `Learn ${cat.name}`,
      created_at: "2024-01-01"
    })),
    lessons: apiCourse.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      lesson_type: lesson.lesson_type
    })),
    created_at: "2024-01-01",
    updated_at: "2024-06-01"
  }
}

// Fallback courses data (in case API fails)
const fallbackCoursesData: Course[] = [
  {
    id: 1,
    post_title: "Data Analytics Using Microsoft Excel - Beginner",
    post_excerpt: "Master Excel from basics to advanced data analytics. Learn formulas, pivot tables, charts, conditional formatting, and real-time projects with assured internship assistance.",
    post_content: "Complete Excel course covering basics, formulas, VLOOKUP, pivot tables, data validation, conditional formatting, text functions, and charts. Includes real-time projects and internship support to kickstart your career.",
    course_price: 299,
    course_sale_price: 199,
    course_price_type: "paid",
    course_level: "beginner",
    course_duration: "25 hours",
    course_thumbnail: "/api/placeholder/600/350",
    course_intro_video: "https://example.com/intro-video",
    average_rating: 4.9,
    total_reviews: 847,
    total_enrollments: 2341,
    instructor: {
      id: 1,
      display_name: "Sasha",
      user_email: "sasha@sashainfinity.com",
      user_login: "sasha",
      user_nicename: "sasha",
      user_registered: "2024-01-01",
      user_status: 0,
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      last_login: "2024-01-01",
      profile: {
        profile_photo: "/api/placeholder/150/150",
        bio: "Excel Expert & Data Analytics Instructor. Helping students democratize education through practical Excel skills.",
        qualifications: ["Excel Certified Expert", "Data Analytics Professional"],
        experience_years: 8
      }
    },
    categories: [{ id: 1, name: "Data Analytics", slug: "data-analytics", description: "Learn data analysis with Excel", created_at: "2024-01-01" }],
    lessons: [
      { id: 1, title: "Excel Basics", duration: "2 hours", lesson_type: "video" },
      { id: 2, title: "Basic Formulas", duration: "2.5 hours", lesson_type: "video" },
      { id: 3, title: "Cell References", duration: "1.5 hours", lesson_type: "video" },
      { id: 4, title: "IF Conditions", duration: "2 hours", lesson_type: "video" },
      { id: 5, title: "VLOOKUP Functions", duration: "3 hours", lesson_type: "video" },
      { id: 6, title: "Sort & Filter", duration: "1.5 hours", lesson_type: "video" },
      { id: 7, title: "Data Validation", duration: "1.5 hours", lesson_type: "video" },
      { id: 8, title: "Conditional Formatting", duration: "2 hours", lesson_type: "video" },
      { id: 9, title: "Text Functions", duration: "2 hours", lesson_type: "video" },
      { id: 10, title: "Pivot Tables", duration: "3.5 hours", lesson_type: "video" },
      { id: 11, title: "Charts & Graphs", duration: "2.5 hours", lesson_type: "video" },
      { id: 12, title: "Real-time Project", duration: "2 hours", lesson_type: "project" }
    ],
    created_at: "2024-01-01",
    updated_at: "2024-06-01"
  },
  {
    id: 2,
    post_title: "Advanced Excel for Business Analytics",
    post_excerpt: "Take your Excel skills to the next level with advanced functions, Power Query, dashboard creation, and business intelligence techniques.",
    post_content: "Advanced Excel course covering Power Query, advanced pivot tables, dashboard creation, macro basics, and business intelligence techniques for professional data analysis.",
    course_price: 499,
    course_sale_price: 349,
    course_price_type: "paid",
    course_level: "advanced",
    course_duration: "35 hours",
    course_thumbnail: "/api/placeholder/600/350",
    course_intro_video: "https://example.com/advanced-intro",
    average_rating: 4.8,
    total_reviews: 523,
    total_enrollments: 1287,
    instructor: {
      id: 1,
      display_name: "Sasha",
      user_email: "sasha@sashainfinity.com",
      user_login: "sasha",
      user_nicename: "sasha",
      user_registered: "2024-01-01",
      user_status: 0,
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      last_login: "2024-01-01",
      profile: {
        profile_photo: "/api/placeholder/150/150",
        bio: "Excel Expert & Data Analytics Instructor",
        qualifications: ["Excel Certified Expert", "Data Analytics Professional"],
        experience_years: 8
      }
    },
    categories: [{ id: 2, name: "Business Analytics", slug: "business-analytics", description: "Advanced Excel for business", created_at: "2024-01-01" }],
    lessons: [],
    created_at: "2024-01-01",
    updated_at: "2024-06-01"
  },
  {
    id: 3,
    post_title: "Excel Dashboard Design Masterclass",
    post_excerpt: "Create stunning, interactive Excel dashboards. Learn design principles, advanced charts, slicers, and professional dashboard techniques.",
    post_content: "Master Excel dashboard creation with design principles, advanced charting, interactive elements, and professional presentation techniques.",
    course_price: 399,
    course_sale_price: 299,
    course_price_type: "paid",
    course_level: "intermediate",
    course_duration: "28 hours",
    course_thumbnail: "/api/placeholder/600/350",
    average_rating: 4.7,
    total_reviews: 324,
    total_enrollments: 891,
    instructor: {
      id: 1,
      display_name: "Sasha",
      user_email: "sasha@sashainfinity.com",
      user_login: "sasha",
      user_nicename: "sasha",
      user_registered: "2024-01-01",
      user_status: 0,
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      last_login: "2024-01-01",
      profile: {
        profile_photo: "/api/placeholder/150/150",
        bio: "Excel Expert & Data Analytics Instructor",
        qualifications: ["Excel Certified Expert", "Data Analytics Professional"],
        experience_years: 8
      }
    },
    categories: [{ id: 3, name: "Dashboard Design", slug: "dashboard-design", description: "Excel dashboard creation", created_at: "2024-01-01" }],
    lessons: [],
    created_at: "2024-01-01",
    updated_at: "2024-06-01"
  }
]

// Categories loaded dynamically from API below
const categoriesStatic: any[] = []

const levels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const priceTypes = [
  { value: "all", label: "All Courses" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
]

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
]

export const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = React.useState<{id:string,name:string,count:number}[]>([])
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchParams.get("search") || "")

  // API State
  const [apiCourses, setApiCourses] = React.useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(true)
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const pageSize = 12 // Courses per page

  const { courses, isLoading, filters, setFilters } = useCourseStore()

  // Fetch courses from API
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true)
        setApiError(null)

        // Use axios which automatically handles auth tokens
        const search = searchParams.get('search') || ''
        const category = searchParams.get('category') || ''
        const level = searchParams.get('level') || ''
        const price_type = searchParams.get('price_type') || ''
        const sort = searchParams.get('sort') || 'latest'
        const params = new URLSearchParams()
        params.set('page', String(currentPage))
        params.set('page_size', String(pageSize))
        if (search) params.set('search', search)
        if (category) params.set('category', category)
        if (level) params.set('level', level)
        if (price_type) params.set('price_type', price_type)
        if (sort) params.set('sort', sort)
        const response = await api.get(`/courses/?${params.toString()}`)
        const data = response.data
        // API now returns paginated response
        const coursesArray = data.courses || []
        setTotalPages(data.total_pages || 1)
        setTotalItems(data.total || 0)

        // Convert API response to local format
        // Note: API returns simplified structure, so we need to adapt
        const courses = coursesArray.map((course: any) => ({
          id: course.id,
          post_title: course.title,
          post_excerpt: course.description,
          post_content: course.description,
          course_price: course.price,
          course_sale_price: course.sale_price || 0,
          course_price_type: course.price > 0 ? "paid" : "free",
          course_level: course.level,
          course_duration: `${course.stats?.duration || 0} minutes`,
          course_thumbnail: course.featured_image || "/api/placeholder/600/350",
          course_intro_video: "",
          average_rating: course.rating || 0,
          total_reviews: 0,
          total_enrollments: course.stats?.students || 0,
          is_enrolled: course.is_enrolled || false,
          instructor: {
            id: course.instructor.id,
            display_name: course.instructor.name,
            user_email: "",
            user_login: course.instructor.name.toLowerCase(),
            user_nicename: course.instructor.name.toLowerCase(),
            user_registered: course.created_at,
            user_status: 0,
            is_active: true,
            is_verified: true,
            created_at: course.created_at,
            updated_at: course.updated_at,
            last_login: course.updated_at,
            profile: {
              profile_photo: course.instructor.avatar || "/api/placeholder/150/150",
              bio: "",
              qualifications: [],
              experience_years: 0
            }
          },
          categories: course.category ? [{ id: 1, name: course.category, slug: course.category.toLowerCase(), description: "", created_at: course.created_at }] : [],
          lessons: [],
          created_at: course.created_at,
          updated_at: course.updated_at
        }))
        setApiCourses(courses)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
        setApiError(error instanceof Error ? error.message : 'Failed to load courses')
        // Use fallback data
        setApiCourses(fallbackCoursesData)
      } finally {
        setIsLoadingCourses(false)
      }
    }

    fetchCourses()
    // Build categories from real API data
    api.get('/courses?limit=100').then(res => {
      const courses = res.data?.courses || res.data || []
      const catMap: Record<string, number> = {}
      courses.forEach((c: any) => {
        if (c.category) {
          const key = c.category.toLowerCase().replace(/\s+/g, '-')
          catMap[key] = (catMap[key] || 0) + 1
        }
      })
      setCategories(Object.entries(catMap).map(([id, count]) => ({
        id,
        name: id.replace(/-/g, ' ').replace(/\w/g, l => l.toUpperCase()),
        count
      })))
    }).catch(() => {})
  }, [currentPage, searchParams])

  // Initialize filters from URL params
  React.useEffect(() => {
    const urlFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      level: searchParams.get("level") || "",
      price_type: searchParams.get("price_type") || "",
      sort: searchParams.get("sort") || "latest",
    }
    setFilters(urlFilters)
  }, [searchParams, setFilters])

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange("search", localSearchQuery)
  }

  const clearFilters = () => {
    setSearchParams({})
    setLocalSearchQuery("")
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            All Courses
          </h1>
          <p className="text-neutral-600">
            Discover thousands of courses from expert instructors
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12"
                />
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLocalSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Filter Toggle (Mobile) */}
            <Dialog.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <Dialog.Trigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="primary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-lg font-semibold">
                      Filters
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon">
                        <X className="w-4 h-4" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  {/* Mobile Filter Content */}
                  <FilterContent
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    categories={categories}
                    levels={levels}
                    priceTypes={priceTypes}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <FilterDropdown
                placeholder="Category"
                options={categories}
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
              />

              <FilterDropdown
                placeholder="Level"
                options={levels}
                value={filters.level}
                onChange={(value) => handleFilterChange("level", value)}
              />

              <FilterDropdown
                placeholder="Price"
                options={priceTypes}
                value={filters.price_type}
                onChange={(value) => handleFilterChange("price_type", value)}
              />

              <FilterDropdown
                placeholder="Sort by"
                options={sortOptions}
                value={filters.sort}
                onChange={(value) => handleFilterChange("sort", value)}
              />

              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-neutral-200 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200">
              <span className="text-sm text-neutral-600">Active filters:</span>
              {filters.search && (
                <Badge variant="outline">
                  Search: {filters.search}
                  <button
                    onClick={() => handleFilterChange("search", "")}
                    className="ml-1 hover:text-danger-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="outline">
                  Category: {categories.find(c => c.id === filters.category)?.name}
                  <button
                    onClick={() => handleFilterChange("category", "")}
                    className="ml-1 hover:text-danger-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.level && (
                <Badge variant="outline">
                  Level: {levels.find(l => l.value === filters.level)?.label}
                  <button
                    onClick={() => handleFilterChange("level", "")}
                    className="ml-1 hover:text-danger-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-neutral-600">
            {isLoadingCourses ? "Loading..." : `${totalItems} courses found`}
          </p>
          {apiError && (
            <p className="text-warning-600 text-sm">
              Using offline data: {apiError}
            </p>
          )}
        </div>

        {/* Course Grid/List */}
        {isLoadingCourses ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-neutral-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }>
            {apiCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingCourses && apiCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No courses found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or browse our available categories
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!isLoadingCourses && totalPages > 1 && (
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

// Filter Components
interface FilterDropdownProps {
  placeholder: string
  options: Array<{ value: string; label: string } | { id: string; name: string; count?: number }>
  value: string
  onChange: (value: string) => void
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  placeholder,
  options,
  value,
  onChange,
}) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger asChild>
        <Button variant="outline" className="w-32 justify-between">
          <span className="truncate">
            {value
              ? (() => {
                  const option = options.find(opt =>
                    ('value' in opt ? opt.value : opt.id) === value
                  );
                  return option ? ('label' in option ? option.label : option.name) : placeholder;
                })()
              : placeholder
            }
          </span>
          <Select.Icon />
        </Button>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-white border border-neutral-200 rounded-lg shadow-lg p-1 overflow-hidden min-w-[150px] max-h-[300px]"
          style={{ zIndex: 9999 }}
          position="popper"
          sideOffset={5}
          align="start"
        >
          <Select.Viewport className="p-1">
            <Select.Item value="all" className="px-3 py-2 hover:bg-neutral-100 rounded cursor-pointer">
              <Select.ItemText>All {placeholder}</Select.ItemText>
            </Select.Item>
            {options.map((option) => (
              <Select.Item
                key={'value' in option ? option.value : option.id}
                value={'value' in option ? option.value : option.id}
                className="px-3 py-2 hover:bg-neutral-100 rounded cursor-pointer"
              >
                <Select.ItemText>
                  {'label' in option ? option.label : option.name}
                  {'count' in option && option.count && (
                    <span className="text-neutral-500 ml-1">({option.count})</span>
                  )}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

interface FilterContentProps {
  filters: any
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  categories: {id:string,name:string,count:number}[]
  levels: {value:string,label:string}[]
  priceTypes: {value:string,label:string}[]
}

const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  levels,
  priceTypes,
}) => {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={filters.category === category.id}
                onChange={(e) => onFilterChange("category", e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{category.name} ({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Level</h3>
        <div className="space-y-2">
          {levels.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="radio"
                name="level"
                value={level.value}
                checked={filters.level === level.value}
                onChange={(e) => onFilterChange("level", e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Price</h3>
        <div className="space-y-2">
          {priceTypes.map((price) => (
            <label key={price.value} className="flex items-center">
              <input
                type="radio"
                name="price_type"
                value={price.value}
                checked={filters.price_type === price.value}
                onChange={(e) => onFilterChange("price_type", e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{price.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={onClearFilters} variant="outline" className="w-full">
        Clear All Filters
      </Button>
    </div>
  )
}
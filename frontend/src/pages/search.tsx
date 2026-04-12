import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Clock, Star, Users } from 'lucide-react'
import { CourseCard } from '@/components/course/course-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SearchFilters {
  category: string
  level: string
  duration: string
  price: string
  rating: string
  language: string
}

const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Design',
  'Business',
  'Photography',
  'Marketing',
  'DevOps'
]

const levels = ['Beginner', 'Intermediate', 'Advanced']
const durations = ['0-3 hours', '3-6 hours', '6-12 hours', '12+ hours']
const prices = ['Free', '$0-50', '$50-100', '$100+']
const ratings = ['4.5+', '4.0+', '3.5+', '3.0+']
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese']

// Mock search results
const searchResults = [
  {
    id: 1,
    title: "Complete React Developer Course",
    instructor: "John Smith",
    rating: 4.8,
    students: 12500,
    price: 89.99,
    duration: "15 hours",
    level: "Intermediate",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"
  },
  {
    id: 2,
    title: "Python for Data Science",
    instructor: "Sarah Johnson",
    rating: 4.9,
    students: 8300,
    price: 79.99,
    duration: "12 hours",
    level: "Beginner",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop"
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    instructor: "Mike Chen",
    rating: 4.7,
    students: 15200,
    price: 0,
    duration: "8 hours",
    level: "Beginner",
    category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop"
  }
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    duration: searchParams.get('duration') || '',
    price: searchParams.get('price') || '',
    rating: searchParams.get('rating') || '',
    language: searchParams.get('language') || ''
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const newParams = new URLSearchParams(searchParams)
    if (term) {
      newParams.set('q', term)
    } else {
      newParams.delete('q')
    }
    setSearchParams(newParams)
  }

  const handleFilterChange = (filterType: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)

    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(filterType, value)
    } else {
      newParams.delete(filterType)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      duration: '',
      price: '',
      rating: '',
      language: ''
    })
    setSearchParams(new URLSearchParams(searchTerm ? { q: searchTerm } : {}))
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>

          {/* Search Info */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {searchResults.length} results found
              {searchTerm && (
                <span> for "<strong>{searchTerm}</strong>"</span>
              )}
            </p>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="relevance">Sort by Relevance</option>
              <option value="rating">Sort by Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Level</h4>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="level"
                          value={level}
                          checked={filters.level === level}
                          onChange={(e) => handleFilterChange('level', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Duration</h4>
                  <div className="space-y-2">
                    {durations.map((duration) => (
                      <label key={duration} className="flex items-center">
                        <input
                          type="radio"
                          name="duration"
                          value={duration}
                          checked={filters.duration === duration}
                          onChange={(e) => handleFilterChange('duration', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Price</h4>
                  <div className="space-y-2">
                    {prices.map((price) => (
                      <label key={price} className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value={price}
                          checked={filters.price === price}
                          onChange={(e) => handleFilterChange('price', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                  <div className="space-y-2">
                    {ratings.map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.rating === rating}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-700">{rating} & up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Language</h4>
                  <div className="space-y-2">
                    {languages.map((language) => (
                      <label key={language} className="flex items-center">
                        <input
                          type="radio"
                          name="language"
                          value={language}
                          checked={filters.language === language}
                          onChange={(e) => handleFilterChange('language', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) =>
                    value && (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                      >
                        {key}: {value} ×
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="space-y-6">
              {searchResults.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.title}
                        </h3>
                        <div className="text-right">
                          {course.price === 0 ? (
                            <span className="text-lg font-bold text-green-600">Free</span>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">${course.price}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">By {course.instructor}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{course.students.toLocaleString()} students</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <Badge variant="secondary">{course.level}</Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        Master the fundamentals and advanced concepts with hands-on projects and real-world examples.
                      </p>

                      <div className="flex items-center space-x-3">
                        <Button className="px-6">
                          Enroll Now
                        </Button>
                        <Button variant="outline">
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
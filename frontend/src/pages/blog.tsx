import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Calendar, User, Eye, MessageCircle, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { api } from "@/api/axios"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  status: string
  category: string | null
  tags: string | null
  view_count: number
  comment_count: number
  post_date: string
  post_modified: string
  author: {
    id: number
    name: string
    email: string
  }
}

export const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchParams.get("search") || "")
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [categories, setCategories] = React.useState<string[]>([])

  // Fetch blog posts from API
  React.useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (searchParams.get("search")) {
          params.append("search", searchParams.get("search")!)
        }
        if (searchParams.get("category")) {
          params.append("category", searchParams.get("category")!)
        }

        const response = await api.get(`/blog/?${params.toString()}`)
        const posts = response.data
        setBlogPosts(posts)

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(posts.filter((p: BlogPost) => p.category).map((p: BlogPost) => p.category))
        ) as string[]
        setCategories(uniqueCategories)
      } catch (err) {
        console.error("Failed to fetch blog posts:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog posts")
        setBlogPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPosts()
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (localSearchQuery) {
      newParams.set("search", localSearchQuery)
    } else {
      newParams.delete("search")
    }
    setSearchParams(newParams)
  }

  const handleCategoryFilter = (category: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (category) {
      newParams.set("category", category)
    } else {
      newParams.delete("category")
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
    setLocalSearchQuery("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const selectedCategory = searchParams.get("category")
  const searchQuery = searchParams.get("search")
  const hasFilters = selectedCategory || searchQuery

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-primary-50 max-w-2xl">
            Insights, tutorials, and tips from our expert instructors on data analytics, Excel, and professional development
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search blog posts..."
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

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  onClick={() => handleCategoryFilter("")}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-neutral-600">
            {isLoading ? "Loading..." : `${blogPosts.length} posts found`}
          </p>
          {error && (
            <p className="text-danger-600 text-sm mt-2">
              Error: {error}
            </p>
          )}
        </div>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-soft animate-pulse">
                <div className="aspect-video bg-neutral-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No blog posts found
            </h3>
            <p className="text-neutral-600 mb-6">
              {hasFilters
                ? "Try adjusting your search criteria or browse all posts"
                : "Be the first to create a blog post!"}
            </p>
            {hasFilters && (
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-soft hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/blog/${post.slug}`}>
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-4xl text-primary-600 font-bold">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  {/* Category Badge */}
                  {post.category && (
                    <Badge variant="primary" className="mb-3">
                      {post.category}
                    </Badge>
                  )}

                  {/* Title */}
                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-neutral-900 mb-3 hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-neutral-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.post_date)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-neutral-500 pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

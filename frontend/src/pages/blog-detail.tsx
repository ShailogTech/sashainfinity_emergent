import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Calendar, User, Eye, MessageCircle, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/api/axios"
import { useAuthStore } from "@/store/auth"
import toast from "react-hot-toast"

interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
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

interface Comment {
  id: number
  content: string
  status: string
  created_at: string
  user: {
    id: number
    name: string
  }
}

export const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [post, setPost] = React.useState<BlogPost | null>(null)
  const [comments, setComments] = React.useState<Comment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [newComment, setNewComment] = React.useState("")
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)

  // Fetch blog post
  React.useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        setError(null)

        const response = await api.get(`/blog/${slug}`)
        setPost(response.data)
      } catch (err) {
        console.error("Failed to fetch blog post:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog post")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPost()
  }, [slug])

  // Fetch comments
  React.useEffect(() => {
    const fetchComments = async () => {
      if (!post) return

      try {
        const response = await api.get(`/blog/${post.id}/comments`)
        setComments(response.data)
      } catch (err) {
        console.error("Failed to fetch comments:", err)
      }
    }

    fetchComments()
  }, [post])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    if (!post) return

    try {
      setIsSubmittingComment(true)

      const response = await api.post(`/blog/${post.id}/comments`, {
        content: newComment
      })

      setComments([response.data, ...comments])
      setNewComment("")
      toast.success("Comment posted successfully")

      // Update comment count
      setPost({
        ...post,
        comment_count: post.comment_count + 1
      })
    } catch (err) {
      console.error("Failed to post comment:", err)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-lg shadow-soft p-8 animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
            <div className="aspect-video bg-neutral-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom max-w-4xl">
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Blog Post Not Found
            </h2>
            <p className="text-neutral-600 mb-6">
              {error || "The blog post you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate("/blog")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Back Button */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom max-w-4xl py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/blog")}
            className="text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>

      <div className="container-custom max-w-4xl py-12">
        <article className="bg-white rounded-lg shadow-soft overflow-hidden">
          {/* Featured Image */}
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-6xl text-primary-600 font-bold">
                {post.title.charAt(0)}
              </span>
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Category Badge */}
            {post.category && (
              <Badge variant="primary" className="mb-4">
                {post.category}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 mb-8 pb-8 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.post_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.view_count} views</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comment_count} comments</span>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-h1:text-2xl prose-h2:text-xl prose-strong:text-gray-900 max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-neutral-200">
                {post.tags.split(",").map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* Author Info */}
            <div className="bg-neutral-50 rounded-lg p-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {post.author.name}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {post.author.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-neutral-900">
                Comments ({post.comment_count})
              </h2>

              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="bg-neutral-50 rounded-lg p-6 text-center">
                  <p className="text-neutral-600 mb-4">
                    Please login to leave a comment
                  </p>
                  <Link to="/login">
                    <Button>Login to Comment</Button>
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-neutral-50 rounded-lg p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                          {comment.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-neutral-900">
                              {comment.user.name}
                            </span>
                            <span className="text-sm text-neutral-500">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-neutral-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

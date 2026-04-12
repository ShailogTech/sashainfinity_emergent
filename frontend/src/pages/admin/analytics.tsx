import { getAuthToken } from '@/utils/auth-helper'
import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react'

const API_BASE_URL = "/api/v1"

interface AdminStats {
  user_stats: {
    total_users: number
    active_users: number
    students: number
    instructors: number
    new_users_30d: number
  }
  course_stats: {
    total_courses: number
    published_courses: number
    draft_courses: number
    avg_rating: number
  }
  enrollment_stats: {
    total_enrollments: number
    completed_enrollments: number
    completion_rate: number
    new_enrollments_30d: number
  }
  revenue_stats: {
    total_revenue: number
    avg_course_price: number
    revenue_30d: number
  }
}

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      // Validate that the response has the expected structure
      if (data && data.user_stats && data.course_stats && data.enrollment_stats && data.revenue_stats) {
        setStats(data)
      } else {
        setStats(null)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of your LMS performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          User Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.user_stats.total_users}</p>
            <p className="text-xs text-green-600 mt-2">+{stats.user_stats.new_users_30d} this month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.user_stats.active_users}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.user_stats.active_users / stats.user_stats.total_users) * 100)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.user_stats.students}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.user_stats.students / stats.user_stats.total_users) * 100)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Instructors</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.user_stats.instructors}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.user_stats.instructors / stats.user_stats.total_users) * 100)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Course Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.course_stats.total_courses}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.course_stats.published_courses}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.course_stats.published_courses / stats.course_stats.total_courses) * 100)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.course_stats.draft_courses}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.course_stats.draft_courses / stats.course_stats.total_courses) * 100)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.course_stats.avg_rating.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-2">Out of 5.0</p>
          </div>
        </div>
      </div>

      {/* Enrollment Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Enrollment Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Enrollments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrollment_stats.total_enrollments}</p>
            <p className="text-xs text-green-600 mt-2">+{stats.enrollment_stats.new_enrollments_30d} this month</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrollment_stats.completed_enrollments}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrollment_stats.completion_rate.toFixed(1)}%</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">New (30 days)</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enrollment_stats.new_enrollments_30d}</p>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Revenue Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.revenue_stats.total_revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Revenue (30 days)</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.revenue_stats.revenue_30d.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Course Price</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{Math.round(stats.revenue_stats.avg_course_price)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

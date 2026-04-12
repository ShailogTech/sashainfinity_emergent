import React, { useState } from 'react'
import { TrendingUp, Users, BookOpen, DollarSign, Eye, BarChart3, PieChart, Calendar, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  overview: {
    totalStudents: number
    totalCourses: number
    totalRevenue: number
    averageRating: number
    studentsGrowth: number
    revenueGrowth: number
    coursesGrowth: number
    ratingChange: number
  }
  coursePerformance: CourseAnalytics[]
  studentEngagement: {
    dailyActiveUsers: number[]
    completionRates: number[]
    averageSessionTime: number
    totalWatchTime: number
  }
  revenueMetrics: {
    monthlyRevenue: number[]
    courseRevenue: { course: string; revenue: number }[]
    conversionRate: number
    refundRate: number
  }
}

interface CourseAnalytics {
  courseId: number
  title: string
  enrollments: number
  completions: number
  revenue: number
  rating: number
  reviews: number
  avgWatchTime: number
  dropoffRate: number
  completionRate: number
}

const analyticsData: AnalyticsData = {
  overview: {
    totalStudents: 1247,
    totalCourses: 8,
    totalRevenue: 45600,
    averageRating: 4.7,
    studentsGrowth: 23.5,
    revenueGrowth: 18.2,
    coursesGrowth: 12.5,
    ratingChange: 0.3
  },
  coursePerformance: [
    {
      courseId: 1,
      title: 'Complete React Developer Course',
      enrollments: 456,
      completions: 342,
      revenue: 18500,
      rating: 4.9,
      reviews: 89,
      avgWatchTime: 75,
      dropoffRate: 25,
      completionRate: 75
    },
    {
      courseId: 2,
      title: 'Advanced JavaScript Concepts',
      enrollments: 321,
      completions: 245,
      revenue: 12800,
      rating: 4.7,
      reviews: 67,
      avgWatchTime: 68,
      dropoffRate: 24,
      completionRate: 76
    },
    {
      courseId: 3,
      title: 'Python Data Science',
      enrollments: 198,
      completions: 134,
      revenue: 8900,
      rating: 4.8,
      reviews: 45,
      avgWatchTime: 82,
      dropoffRate: 32,
      completionRate: 68
    }
  ],
  studentEngagement: {
    dailyActiveUsers: [120, 135, 98, 156, 178, 145, 167],
    completionRates: [72, 75, 68, 78, 74, 76, 73],
    averageSessionTime: 45,
    totalWatchTime: 15600
  },
  revenueMetrics: {
    monthlyRevenue: [2800, 3200, 2950, 3800, 4200, 3900, 4500],
    courseRevenue: [
      { course: 'React Course', revenue: 18500 },
      { course: 'JavaScript', revenue: 12800 },
      { course: 'Python', revenue: 8900 },
      { course: 'Node.js', revenue: 5400 }
    ],
    conversionRate: 12.5,
    refundRate: 2.1
  }
}

export function InstructorAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const exportData = () => {
    console.log('Exporting analytics data...')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your teaching performance and student engagement</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview.totalStudents.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{analyticsData.overview.studentsGrowth}% this month
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${analyticsData.overview.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{analyticsData.overview.revenueGrowth}% this month
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview.totalCourses}
                </p>
                <p className="text-sm text-green-600">
                  +{analyticsData.overview.coursesGrowth}% this month
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview.averageRating}/5
                </p>
                <p className="text-sm text-green-600">
                  +{analyticsData.overview.ratingChange} this month
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Trends</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMetric('revenue')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedMetric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedMetric('students')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedMetric === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Students
                  </button>
                  <button
                    onClick={() => setSelectedMetric('engagement')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedMetric === 'engagement' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Engagement
                  </button>
                </div>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                <SimpleLineChart
                  data={
                    selectedMetric === 'revenue'
                      ? analyticsData.revenueMetrics.monthlyRevenue
                      : selectedMetric === 'students'
                      ? [120, 150, 180, 220, 250, 280, 320, 350, 380, 420, 450, 480]
                      : [65, 70, 68, 75, 80, 82, 85, 88, 90, 87, 92, 95]
                  }
                  label={
                    selectedMetric === 'revenue'
                      ? 'Monthly Revenue'
                      : selectedMetric === 'students'
                      ? 'Student Growth'
                      : 'Engagement Rate (%)'
                  }
                  color={
                    selectedMetric === 'revenue'
                      ? '#10b981'
                      : selectedMetric === 'students'
                      ? '#3b82f6'
                      : '#8b5cf6'
                  }
                />
              </div>
            </Card>
          </div>

          {/* Top Courses */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Performance</h3>
              <div className="space-y-4">
                {analyticsData.coursePerformance.map((course, index) => (
                  <div key={course.courseId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {course.title}
                      </h4>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrollments:</span>
                        <span className="font-medium">{course.enrollments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion:</span>
                        <span className="font-medium text-green-600">{course.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">${course.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{course.rating}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Student Engagement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Engagement</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Average Session Time</span>
                  <span className="font-medium">{analyticsData.studentEngagement.averageSessionTime} minutes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Watch Time</span>
                  <span className="font-medium">{analyticsData.studentEngagement.totalWatchTime} hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Active Users (Last 7 Days)</h4>
                <div className="flex items-end space-x-2 h-20">
                  {analyticsData.studentEngagement.dailyActiveUsers.map((users, index) => (
                    <div key={index} className="flex-1 bg-blue-600 rounded-t" style={{ height: `${(users / 200) * 100}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Conversion Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Metrics</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.revenueMetrics.conversionRate}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Refund Rate</p>
                  <p className="text-lg font-semibold text-red-600">
                    {analyticsData.revenueMetrics.refundRate}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-lg font-semibold text-green-600">73%</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue by Course</h4>
                <div className="space-y-3">
                  {analyticsData.revenueMetrics.courseRevenue.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.course}</span>
                      <span className="font-medium">${item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Simple Line Chart Component (SVG-based, no external dependencies)
interface SimpleLineChartProps {
  data: number[]
  label: string
  color: string
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, label, color }) => {
  const width = 600
  const height = 200
  const padding = 40
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
    const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = padding + (i * (height - 2 * padding)) / 4
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((value, index) => {
          const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
          const y = height - padding - ((value - minValue) / range) * (height - 2 * padding)
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
              <title>{`${label}: ${value}`}</title>
            </g>
          )
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map(i => {
          const value = maxValue - (i * range) / 4
          const y = padding + (i * (height - 2 * padding)) / 4
          return (
            <text
              key={i}
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {Math.round(value)}
            </text>
          )
        })}

        {/* X-axis labels (months) */}
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
          if (index >= data.length) return null
          const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
          return (
            <text
              key={index}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {month}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
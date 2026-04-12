import React, { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EarningsData {
  totalEarnings: number
  monthlyEarnings: number
  pendingEarnings: number
  paidEarnings: number
  monthlyChange: number
}

interface Transaction {
  id: string
  courseTitle: string
  studentName: string
  amount: number
  commission: number
  netEarnings: number
  date: string
  status: 'completed' | 'pending' | 'processing'
  paymentMethod: string
}

interface CourseEarnings {
  courseId: number
  title: string
  totalRevenue: number
  totalSales: number
  averageRating: number
  monthlyRevenue: number
}

const earningsData: EarningsData = {
  totalEarnings: 24500.00,
  monthlyEarnings: 3200.00,
  pendingEarnings: 450.00,
  paidEarnings: 24050.00,
  monthlyChange: 12.5
}

const transactions: Transaction[] = [
  {
    id: 'TXN-001',
    courseTitle: 'Complete React Developer Course',
    studentName: 'John Doe',
    amount: 89.99,
    commission: 13.50,
    netEarnings: 76.49,
    date: '2024-01-20',
    status: 'completed',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'TXN-002',
    courseTitle: 'Advanced JavaScript Concepts',
    studentName: 'Sarah Wilson',
    amount: 79.99,
    commission: 12.00,
    netEarnings: 67.99,
    date: '2024-01-19',
    status: 'completed',
    paymentMethod: 'PayPal'
  },
  {
    id: 'TXN-003',
    courseTitle: 'Complete React Developer Course',
    studentName: 'Mike Chen',
    amount: 89.99,
    commission: 13.50,
    netEarnings: 76.49,
    date: '2024-01-18',
    status: 'pending',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'TXN-004',
    courseTitle: 'Python Data Science',
    studentName: 'Emma Davis',
    amount: 109.99,
    commission: 16.50,
    netEarnings: 93.49,
    date: '2024-01-17',
    status: 'processing',
    paymentMethod: 'Bank Transfer'
  }
]

const courseEarnings: CourseEarnings[] = [
  {
    courseId: 1,
    title: 'Complete React Developer Course',
    totalRevenue: 12500.00,
    totalSales: 156,
    averageRating: 4.9,
    monthlyRevenue: 1800.00
  },
  {
    courseId: 2,
    title: 'Advanced JavaScript Concepts',
    totalRevenue: 8200.00,
    totalSales: 108,
    averageRating: 4.7,
    monthlyRevenue: 1200.00
  },
  {
    courseId: 3,
    title: 'Python Data Science',
    totalRevenue: 3800.00,
    totalSales: 42,
    averageRating: 4.8,
    monthlyRevenue: 200.00
  }
]

export function InstructorEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter === 'all') return true
    return transaction.status === statusFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600'
      case 'pending':
        return 'bg-yellow-600'
      case 'processing':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }

  const handleExport = () => {
    console.log('Exporting earnings report...')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
            <p className="text-gray-600">Track your revenue and payment history</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${earningsData.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${earningsData.monthlyEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{earningsData.monthlyChange}% from last month
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${earningsData.pendingEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Processing</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Out</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${earningsData.paidEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Available balance</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{transaction.courseTitle}</h4>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Purchase by {transaction.studentName} • {transaction.paymentMethod}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Amount</p>
                            <p className="font-medium">${transaction.amount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Commission</p>
                            <p className="font-medium text-red-600">-${transaction.commission}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Net Earnings</p>
                            <p className="font-medium text-green-600">${transaction.netEarnings}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t text-center">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Transactions
                </Button>
              </div>
            </Card>
          </div>

          {/* Top Performing Courses */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Courses</h3>
              <div className="space-y-4">
                {courseEarnings.map((course) => (
                  <div key={course.courseId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue:</span>
                        <span className="font-medium">${course.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{course.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{course.averageRating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month:</span>
                        <span className="font-medium text-green-600">
                          ${course.monthlyRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-2">Next Payout</p>
                  <p className="font-medium">February 1, 2024</p>
                  <p className="text-green-600">${earningsData.pendingEarnings} pending</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Payment Method</p>
                  <p className="font-medium">Bank Account ****1234</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Commission Rate</p>
                  <p className="font-medium">15% platform fee</p>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" size="sm">
                    Update Payment Settings
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Earnings Chart Placeholder */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Earnings Trend</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPeriod('thisWeek')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedPeriod === 'thisWeek' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                7 days
              </button>
              <button
                onClick={() => setSelectedPeriod('thisMonth')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedPeriod === 'thisMonth' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                30 days
              </button>
              <button
                onClick={() => setSelectedPeriod('last3Months')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedPeriod === 'last3Months' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}
              >
                90 days
              </button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Earnings chart will be displayed here</p>
              <p className="text-sm text-gray-500">Showing revenue trends over time</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
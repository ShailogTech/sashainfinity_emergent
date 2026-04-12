import { getAuthToken } from '@/utils/auth-helper'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Mail,
  BookOpen,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE_URL = "/api/v1"

interface Instructor {
  id: number
  username: string
  email: string
  display_name: string
  role: string
  status: string
  joined_date: string
  last_login: string | null
  total_courses: number
  profile_complete: boolean
}

interface InstructorApplication {
  id: number
  user_id: number
  username: string
  email: string
  display_name: string
  bio: string
  experience: string
  status: string
  applied_at: string
}

export const AdminInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [applications, setApplications] = useState<InstructorApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'instructors' | 'applications'>('instructors')

  useEffect(() => {
    fetchInstructors()
    fetchApplications()
  }, [])

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/users?role=instructor`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setInstructors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching instructors:', error)
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/instructor-applications?status=pending`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setApplications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setApplications([])
    }
  }

  const processApplication = async (applicationId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/instructor-applications/${applicationId}?action=${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchApplications()
        if (action === 'approve') {
          fetchInstructors()
        }
      }
    } catch (error) {
      console.error('Error processing application:', error)
    }
  }

  const terminateInstructor = async (instructorId: number, instructorName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to terminate ${instructorName}? This will delete the instructor account and all their courses, lessons, quizzes, and assignments.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${instructorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success(`${instructorName} has been terminated successfully`)
        fetchInstructors()
      } else {
        const data = await response.json()
        toast.error(data.detail || 'Failed to terminate instructor')
      }
    } catch (error) {
      console.error('Error terminating instructor:', error)
      toast.error('Failed to terminate instructor')
    }
  }

  const filteredInstructors = instructors.filter(instructor =>
    instructor.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
          <p className="text-gray-600 mt-1">Manage instructors and applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{instructors.length}</span> instructors
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Instructors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{instructors.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {instructors.filter(i => i.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{applications.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {instructors.reduce((sum, i) => sum + i.total_courses, 0)}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('instructors')}
            className={`${
              activeTab === 'instructors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Instructors ({instructors.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}
          >
            Applications ({applications.length})
            {applications.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                {applications.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Search */}
      {activeTab === 'instructors' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Instructors Table */}
      {activeTab === 'instructors' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Loading instructors...
                    </td>
                  </tr>
                ) : filteredInstructors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No instructors found
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {instructor.display_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{instructor.display_name}</div>
                            <div className="text-sm text-gray-500">@{instructor.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {instructor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {instructor.total_courses} courses
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(instructor.joined_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          instructor.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {instructor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/admin/courses?instructor=${instructor.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Courses
                          </Link>
                          <button
                            onClick={() => terminateInstructor(instructor.id, instructor.display_name)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Terminate Instructor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications List */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending applications</p>
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {application.display_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{application.display_name}</h3>
                      <p className="text-sm text-gray-600">{application.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied on {formatDate(application.applied_at)}
                      </p>

                      {application.bio && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Bio</h4>
                          <p className="text-sm text-gray-600 mt-1">{application.bio}</p>
                        </div>
                      )}

                      {application.experience && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-900">Experience</h4>
                          <p className="text-sm text-gray-600 mt-1">{application.experience}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => processApplication(application.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => processApplication(application.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

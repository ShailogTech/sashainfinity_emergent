import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Award,
  Download,
  Eye,
  Calendar,
  Users,
  BookOpen,
  CheckCircle
} from 'lucide-react'
import { getAuthToken } from '@/utils/auth-helper'

const API_BASE_URL = "/api/v1"

interface Certificate {
  id: number
  student_name: string
  student_email: string
  course_title: string
  course_id: number
  certificate_id: string
  issue_date: string
  completion_date: string
  grade: number
}

export const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/certificates?limit=100`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setCertificates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      setCertificates([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCertificates = certificates.filter(cert =>
    cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = {
    total: certificates.length,
    thisMonth: certificates.filter(c => {
      const issueDate = new Date(c.issue_date)
      const now = new Date()
      return issueDate.getMonth() === now.getMonth() && issueDate.getFullYear() === now.getFullYear()
    }).length,
    avgGrade: certificates.length > 0
      ? Math.round(certificates.reduce((sum, c) => sum + c.grade, 0) / certificates.length)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600 mt-1">Manage all course completion certificates</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Grade</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.avgGrade}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Students</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {new Set(certificates.map(c => c.student_email)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading certificates...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Award className="w-12 h-12 text-gray-400" />
                      <p>No certificates issued yet</p>
                      <p className="text-sm text-gray-400">Certificates are automatically issued when students complete courses</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-yellow-500 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{certificate.certificate_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{certificate.student_name}</div>
                        <div className="text-sm text-gray-500">{certificate.student_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/courses/${certificate.course_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2"
                      >
                        {certificate.course_title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(certificate.completion_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(certificate.issue_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16">
                          <div className="text-sm font-medium text-gray-900">{certificate.grade}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                certificate.grade >= 90 ? 'bg-green-600' :
                                certificate.grade >= 75 ? 'bg-blue-600' :
                                'bg-yellow-600'
                              }`}
                              style={{ width: `${certificate.grade}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Download">
                          <Download className="w-4 h-4" />
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
    </div>
  )
}

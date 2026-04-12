import React, { useState } from 'react'
import { Users, Search, Filter, MessageCircle, Mail, MoreVertical, Star, BookOpen, Calendar, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'

interface Student {
  id: string
  name: string
  email: string
  avatar: string
  enrolledCourses: EnrolledCourse[]
  totalCourses: number
  completedCourses: number
  totalSpent: number
  joinDate: string
  lastActive: string
  averageRating: number
  certificatesEarned: number
}

interface EnrolledCourse {
  courseId: number
  courseTitle: string
  enrollmentDate: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  lastAccessed: string
  timeSpent: number // in minutes
  certificateIssued?: boolean
}

const students: Student[] = [
  {
    id: 'STU-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    enrolledCourses: [
      {
        courseId: 1,
        courseTitle: 'Complete React Developer Course',
        enrollmentDate: '2024-01-15',
        progress: 85,
        status: 'active',
        lastAccessed: '2024-01-25',
        timeSpent: 450,
        certificateIssued: false
      },
      {
        courseId: 2,
        courseTitle: 'Advanced JavaScript Concepts',
        enrollmentDate: '2024-01-10',
        progress: 100,
        status: 'completed',
        lastAccessed: '2024-01-22',
        timeSpent: 380,
        certificateIssued: true
      }
    ],
    totalCourses: 2,
    completedCourses: 1,
    totalSpent: 169.98,
    joinDate: '2024-01-10',
    lastActive: '2024-01-25',
    averageRating: 4.8,
    certificatesEarned: 1
  },
  {
    id: 'STU-002',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=150&h=150&fit=crop&crop=face',
    enrolledCourses: [
      {
        courseId: 1,
        courseTitle: 'Complete React Developer Course',
        enrollmentDate: '2024-01-18',
        progress: 45,
        status: 'active',
        lastAccessed: '2024-01-24',
        timeSpent: 180,
        certificateIssued: false
      }
    ],
    totalCourses: 1,
    completedCourses: 0,
    totalSpent: 89.99,
    joinDate: '2024-01-18',
    lastActive: '2024-01-24',
    averageRating: 4.9,
    certificatesEarned: 0
  },
  {
    id: 'STU-003',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    enrolledCourses: [
      {
        courseId: 2,
        courseTitle: 'Advanced JavaScript Concepts',
        enrollmentDate: '2024-01-12',
        progress: 70,
        status: 'active',
        lastAccessed: '2024-01-23',
        timeSpent: 320,
        certificateIssued: false
      },
      {
        courseId: 3,
        courseTitle: 'Python Data Science',
        enrollmentDate: '2024-01-20',
        progress: 25,
        status: 'active',
        lastAccessed: '2024-01-25',
        timeSpent: 90,
        certificateIssued: false
      }
    ],
    totalCourses: 2,
    completedCourses: 0,
    totalSpent: 189.98,
    joinDate: '2024-01-12',
    lastActive: '2024-01-25',
    averageRating: 4.6,
    certificatesEarned: 0
  },
  {
    id: 'STU-004',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    enrolledCourses: [
      {
        courseId: 1,
        courseTitle: 'Complete React Developer Course',
        enrollmentDate: '2024-01-08',
        progress: 100,
        status: 'completed',
        lastAccessed: '2024-01-20',
        timeSpent: 520,
        certificateIssued: true
      },
      {
        courseId: 2,
        courseTitle: 'Advanced JavaScript Concepts',
        enrollmentDate: '2024-01-22',
        progress: 15,
        status: 'active',
        lastAccessed: '2024-01-25',
        timeSpent: 45,
        certificateIssued: false
      }
    ],
    totalCourses: 2,
    completedCourses: 1,
    totalSpent: 169.98,
    joinDate: '2024-01-08',
    lastActive: '2024-01-25',
    averageRating: 4.9,
    certificatesEarned: 1
  }
]

export function InstructorStudents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = selectedCourse === 'all' ||
                         student.enrolledCourses.some(course => course.courseId.toString() === selectedCourse)

    const matchesStatus = statusFilter === 'all' ||
                         student.enrolledCourses.some(course => course.status === statusFilter)

    return matchesSearch && matchesCourse && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600'
      case 'completed':
        return 'bg-blue-600'
      case 'paused':
        return 'bg-yellow-600'
      default:
        return 'bg-gray-600'
    }
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const sendMessage = (student: Student) => {
    console.log(`Sending message to ${student.name}`)
  }

  const sendEmail = (student: Student) => {
    console.log(`Sending email to ${student.email}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
          <p className="text-gray-600">Manage and communicate with your students</p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                <option value="1">Complete React Developer Course</option>
                <option value="2">Advanced JavaScript Concepts</option>
                <option value="3">Python Data Science</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedStudent?.id === student.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{student.email}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Courses</p>
                            <p className="font-medium">{student.totalCourses}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="font-medium text-green-600">{student.completedCourses}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Spent</p>
                            <p className="font-medium">${student.totalSpent}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Active</p>
                            <p className="font-medium">
                              {new Date(student.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Current Courses */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Enrolled Courses:</p>
                          <div className="space-y-2">
                            {student.enrolledCourses.map((course) => (
                              <div key={course.courseId} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{course.courseTitle}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${course.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-600">{course.progress}%</span>
                                    <Badge className={getStatusColor(course.status)} size="sm">
                                      {course.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          sendMessage(student)
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          sendEmail(student)
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Student Details Sidebar */}
          <div>
            {selectedStudent ? (
              <Card className="p-6 sticky top-8">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Student Stats</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-600">Total Courses</span>
                        </div>
                        <span className="font-medium">{selectedStudent.totalCourses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-600">Completed</span>
                        </div>
                        <span className="font-medium text-green-600">{selectedStudent.completedCourses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-gray-600">Avg Rating</span>
                        </div>
                        <span className="font-medium">{selectedStudent.averageRating}/5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm text-gray-600">Member Since</span>
                        </div>
                        <span className="font-medium">
                          {new Date(selectedStudent.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Course Progress</h4>
                    <div className="space-y-3">
                      {selectedStudent.enrolledCourses.map((course) => (
                        <div key={course.courseId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900 font-medium line-clamp-1">
                              {course.courseTitle}
                            </span>
                            <span className="text-gray-600">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Time: {formatTimeSpent(course.timeSpent)}</span>
                            <Badge className={getStatusColor(course.status)} size="sm">
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button className="w-full" onClick={() => sendMessage(selectedStudent)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => sendEmail(selectedStudent)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">
                  Click on a student from the list to view their details and progress
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
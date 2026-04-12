import React, { useState, useEffect } from 'react'
import { Camera, User, Mail, Phone, MapPin, Calendar, Edit3, Globe, Facebook, Twitter, Linkedin, AlertCircle, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth'
import { useLocation, useNavigate } from 'react-router-dom'

interface UserProfile {
  first_name: string
  last_name: string
  email: string
  phone: string
  description: string
  designation: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  profile_photo: string
  cover_photo: string
  facebook: string
  twitter: string
  linkedin: string
  website: string
}

interface UserStats {
  enrolled_courses?: number
  completed_courses?: number
  in_progress_courses?: number
  certificates_earned?: number
  total_learning_time?: number
  total_courses?: number
  published_courses?: number
  total_students?: number
}

export function ProfilePage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const setAuthProfile = useAuthStore((state) => state.setProfile)
  const logout = useAuthStore((state) => state.logout)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats>({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile | null>(null)
  const [uploading, setUploading] = useState(false)

  // Check if user was redirected here for profile completion
  const requiresCompletion = location.state?.requiresCompletion || !user?.profile_completed

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setProfile(response.data)
      setEditForm(response.data)

      // Check if profile is incomplete and auto-enable edit mode
      const isIncomplete = !response.data.first_name || !response.data.last_name
      if (isIncomplete) {
        setIsEditing(true)
        toast.info('Please complete your profile information')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSave = async () => {
    if (!editForm) return

    // Validate required fields (including phone for profile completion)
    if (!editForm.first_name || !editForm.last_name) {
      toast.error('First name and last name are required')
      return
    }

    if (requiresCompletion && !editForm.phone) {
      toast.error('Phone number is required to complete your profile')
      return
    }

    try {
      const response = await api.put('/users/profile', editForm)
      setProfile(response.data)
      setIsEditing(false)

      // Re-fetch user from server so profile_completed refreshes in guard
      await useAuthStore.getState().checkAuth()
      // Update auth store with the updated profile
      setAuthProfile(response.data)

      // If profile was just completed, redirect to dashboard
      if (requiresCompletion && response.data.profile_completed) {
        toast.success('Profile completed successfully! Redirecting to dashboard...', {
          duration: 3000,
          icon: '✅'
        })

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          const userRole = user?.role || 'student'
          const dashboardPath = userRole === 'admin' ? '/admin' :
                               userRole === 'instructor' ? '/instructor/courses' :
                               '/courses'
          navigate(dashboardPath, { replace: true })
        }, 1000)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.detail || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => prev ? ({ ...prev, [name]: value }) : null)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update local profile state with new avatar URL
      const newAvatarUrl = response.data.avatar_url
      if (profile) {
        setProfile({ ...profile, profile_photo: newAvatarUrl })
      }
      if (editForm) {
        setEditForm({ ...editForm, profile_photo: newAvatarUrl })
      }

      // Update auth store so header component shows new avatar immediately
      setAuthProfile({ profile_photo: newAvatarUrl })

      toast.success('Avatar uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.response?.data?.detail || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const isProfileIncomplete = !profile?.first_name || !profile?.last_name

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and learning progress</p>
        </div>

        {/* Profile Completion Banner */}
        {requiresCompletion && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Your Profile
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You must complete your profile before accessing other features. Please fill in all required fields: First Name, Last Name, and Phone Number.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Incomplete Profile Banner */}
        {isProfileIncomplete && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Your Profile
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your profile is incomplete. Please fill in your first name and last name to get started.
                    A complete profile helps instructors and other students connect with you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  {profile.profile_photo ? (
                    <img
                      src={profile.profile_photo}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-primary-600" />
                    </div>
                  )}
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-600 text-sm mb-2">{user?.email}</p>
              {profile.designation && (
                <p className="text-primary-600 text-sm font-medium mb-4">{profile.designation}</p>
              )}

              {profile.description && (
                <p className="text-gray-600 text-sm mb-4 italic">"{profile.description}"</p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                {(profile.city || profile.country) && (
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {user?.created_at && (
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role === 'student' ? 'Learning Stats' : 'Teaching Stats'}
              </h3>
              <div className="space-y-4">
                {user?.role === 'student' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Enrolled Courses</span>
                      <Badge variant="secondary">{stats.enrolled_courses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed</span>
                      <Badge className="bg-green-600">{stats.completed_courses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Progress</span>
                      <Badge className="bg-blue-600">{stats.in_progress_courses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Certificates</span>
                      <Badge className="bg-purple-600">{stats.certificates_earned || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hours Learned</span>
                      <Badge className="bg-orange-600">{Math.floor((stats.total_learning_time || 0) / 60)}h</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Courses</span>
                      <Badge variant="secondary">{stats.total_courses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Published</span>
                      <Badge className="bg-green-600">{stats.published_courses || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Students</span>
                      <Badge className="bg-blue-600">{stats.total_students || 0}</Badge>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={editForm?.first_name || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.first_name || '-'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="last_name"
                        value={editForm?.last_name || ''}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.last_name || '-'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm?.phone || ''}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone || '-'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation / Job Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="designation"
                      value={editForm?.designation || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer, Student, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.designation || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / About Me
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editForm?.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.description || '-'}</p>
                  )}
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={editForm?.address || ''}
                          onChange={handleInputChange}
                          placeholder="123 Main Street, Apt 4B"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.address || '-'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="city"
                            value={editForm?.city || ''}
                            onChange={handleInputChange}
                            placeholder="San Francisco"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.city || '-'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State / Province
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="state"
                            value={editForm?.state || ''}
                            onChange={handleInputChange}
                            placeholder="California"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.state || '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="country"
                            value={editForm?.country || ''}
                            onChange={handleInputChange}
                            placeholder="United States"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.country || '-'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="postal_code"
                            value={editForm?.postal_code || ''}
                            onChange={handleInputChange}
                            placeholder="94102"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.postal_code || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Social Links</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-1" />
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={editForm?.website || ''}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        profile.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          <p className="text-gray-900">-</p>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Facebook className="h-4 w-4 inline mr-1" />
                          Facebook
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="facebook"
                            value={editForm?.facebook || ''}
                            onChange={handleInputChange}
                            placeholder="https://facebook.com/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.facebook || '-'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Twitter className="h-4 w-4 inline mr-1" />
                          Twitter
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="twitter"
                            value={editForm?.twitter || ''}
                            onChange={handleInputChange}
                            placeholder="https://twitter.com/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.twitter || '-'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Linkedin className="h-4 w-4 inline mr-1" />
                          LinkedIn
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            name="linkedin"
                            value={editForm?.linkedin || ''}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.linkedin || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { Shield, Bell, Eye, Trash2, Key, Globe, Moon, Sun } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
    courseUpdates: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: string
    showProgress: boolean
    showCertificates: boolean
  }
  display: {
    theme: string
    language: string
    timezone: string
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    activeSessions: number
  }
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: false,
      marketing: false,
      courseUpdates: true,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showCertificates: true
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York'
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2024-01-15',
      activeSessions: 3
    }
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleNotificationChange = (key: keyof Settings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handlePrivacyChange = (key: keyof Settings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
  }

  const handleDisplayChange = (key: keyof Settings['display'], value: string) => {
    setSettings(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Bell className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Course Updates</h3>
                  <p className="text-sm text-gray-600">Get notified when courses you're enrolled in are updated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.courseUpdates}
                    onChange={() => handleNotificationChange('courseUpdates')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                  <p className="text-sm text-gray-600">Receive promotional content and course recommendations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Eye className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="public"
                      checked={settings.privacy.profileVisibility === 'public'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Public - Anyone can see your profile</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="students"
                      checked={settings.privacy.profileVisibility === 'students'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Students only - Only other students can see your profile</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="private"
                      checked={settings.privacy.profileVisibility === 'private'}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Private - Hide your profile from others</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Learning Progress</h3>
                  <p className="text-sm text-gray-600">Display your course progress on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showProgress}
                    onChange={() => handlePrivacyChange('showProgress', !settings.privacy.showProgress)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Certificates</h3>
                  <p className="text-sm text-gray-600">Display your earned certificates on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showCertificates}
                    onChange={() => handlePrivacyChange('showCertificates', !settings.privacy.showCertificates)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Display */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Display & Language</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.display.theme}
                    onChange={(e) => handleDisplayChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.display.language}
                    onChange={(e) => handleDisplayChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.display.timezone}
                  onChange={(e) => handleDisplayChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center space-x-3">
                  {settings.security.twoFactorEnabled ? (
                    <Badge className="bg-green-600">Enabled</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600">
                    Last changed: {new Date(settings.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-1" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Active Sessions</h3>
                  <p className="text-sm text-gray-600">
                    You have {settings.security.activeSessions} active sessions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Sessions
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200">
            <div className="flex items-center mb-6">
              <Trash2 className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-700 font-medium">
                    Are you sure? This will permanently delete your account.
                  </p>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        // Handle account deletion
                        console.log('Account deletion confirmed')
                      }}
                    >
                      Yes, Delete My Account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
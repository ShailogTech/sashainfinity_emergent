import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  BarChart3,
  Tag,
  FolderOpen,
  MessageSquare,
  CreditCard,
  Award
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      single: true
    },
    {
      title: 'Courses',
      icon: BookOpen,
      submenu: [
        { title: 'All Courses', path: '/admin/courses' },
        { title: 'Categories', path: '/admin/courses/categories' },
        { title: 'Tags', path: '/admin/courses/tags' }
      ]
    },
    {
      title: 'Lessons',
      icon: FileText,
      path: '/admin/lessons',
      single: true
    },
    {
      title: 'Quizzes',
      icon: MessageSquare,
      path: '/admin/quizzes',
      single: true
    },
    {
      title: 'Students',
      icon: Users,
      path: '/admin/students',
      single: true
    },
    {
      title: 'Instructors',
      icon: Users,
      path: '/admin/instructors',
      single: true
    },
    {
      icon: Settings,
      title: 'Manage',
      path: '/admin/manage',
      single: true
    },
    {
      title: 'Enrollments',
      icon: FolderOpen,
      path: '/admin/enrollments',
      single: true
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      single: true
    },
    {
      title: 'Orders',
      icon: CreditCard,
      path: '/admin/orders',
      single: true
    },
    {
      title: 'Coupons',
      icon: Tag,
      path: '/admin/coupons',
      single: true
    },
    {
      title: 'Certificates',
      icon: Award,
      path: '/admin/certificates',
      single: true
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      single: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SashaInfinity LMS Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-[#1e1e1e] text-gray-300 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Logo/Branding Area */}
        <div className="h-16 bg-[#23282d] flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <>
              <Link to="/admin/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SI</span>
                </div>
                <span className="text-white font-semibold">SashaInfinity</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.single ? (
                  <Link
                    to={item.path!}
                    className={`flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-600 transition-colors ${
                      isActive(item.path!) ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {sidebarOpen && <span className="text-sm">{item.title}</span>}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setCoursesMenuOpen(!coursesMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm">{item.title}</span>}
                      </div>
                      {sidebarOpen && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            coursesMenuOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    {sidebarOpen && coursesMenuOpen && (
                      <ul className="bg-[#23282d] py-1">
                        {item.submenu?.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`block px-12 py-2 text-sm hover:bg-blue-600 transition-colors ${
                                isActive(subItem.path) ? 'bg-blue-600 text-white' : ''
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-800 p-4">
          <Link
            to="/"
            className="flex items-center space-x-3 px-2 py-2 hover:bg-gray-800 rounded transition-colors"
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Visit Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}
      >
        {/* SashaInfinity LMS Top Bar */}
        <header className="h-16 bg-[#23282d] border-b border-gray-700 flex items-center justify-between px-6 fixed right-0 left-0 z-40"
          style={{ left: sidebarOpen ? '256px' : '64px' }}
        >
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-white text-lg font-medium">
              {menuItems.find((item) => isActive(item.path || ''))?.title || 'Admin Panel'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                // Handle logout
                navigate('/login')
              }}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 mt-16">
          <div className="p-8">{children}</div>
        </main>

        {/* SashaInfinity LMS Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>Thank you for creating with SashaInfinity LMS.</p>
            <p>Version 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

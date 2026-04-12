import * as React from "react"
import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container-custom py-6">
          <Link
            to="/"
            className="flex items-center space-x-2 w-fit"
          >
            <img
              src="https://res.cloudinary.com/dkjvfskhn/image/upload/v1759753621/cropped-sasha-logo-small_ejpceq.png"
              alt="SashaInfinity Logo"
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        {children}
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-40 pointer-events-none" />
    </div>
  )
}
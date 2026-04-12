import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/use-auth'
import { CartProvider } from '@/contexts/CartContext'
import { ProtectedRoute } from '@/components/routing/protected-route'
import { ProfileCompletionGuard } from '@/components/auth/ProfileCompletionGuard'
import { MainLayout } from '@/components/layout/main-layout'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LinkedInCallbackPage } from '@/pages/auth/linkedin-callback'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from '@/components/common/scroll-to-top'

// Pages
import { HomePage } from '@/pages/Home'
import { CoursesPage } from '@/pages/courses'
import { CourseDetailPage } from '@/pages/course-detail'
import { CategoriesPage } from '@/pages/categories'
import { LoginPage } from '@/pages/auth/login'
import { RegisterPage } from '@/pages/auth/register'
import { VerifyEmailPage } from '@/pages/auth/verify-email'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { ResetPasswordPage } from '@/pages/auth/reset-password'
import { DashboardPage } from '@/pages/dashboard'
import { MyCoursesPage } from '@/pages/my-courses'
import { WishlistPage } from '@/pages/wishlist'
import { CartPage } from '@/pages/cart'
import { CheckoutPage } from '@/pages/checkout'
import { ProfilePage } from '@/pages/profile'
import { SettingsPage } from '@/pages/settings'
import { QuizPage } from '@/pages/quiz'
import { LessonPageRedesigned } from '@/pages/lesson-redesigned'
import { CertificatePage } from '@/pages/certificate'
import QuizTaking from '@/pages/quiz-taking'
import AssignmentSubmission from '@/pages/assignment-submission'
import { SearchPage } from '@/pages/search'
import { AboutPage } from '@/pages/About'
import { ContactPage } from '@/pages/Contact'
import { NotFoundPage } from '@/pages/not-found'
import VerifyCertificate from '@/pages/verify-certificate'
import { BlogPage } from '@/pages/blog'
import { BlogDetailPage } from '@/pages/blog-detail'
import { UtporulPage } from '@/pages/category-utporul'
import { MeiporulPage } from '@/pages/category-meiporul'
import { MeiporulARPage } from '@/pages/meiporul-ar'
import { SeyappaduporulPage } from '@/pages/category-seyappaduporul'
import { RefundPolicyPage } from '@/pages/refund-policy'
import { TermsPage } from '@/pages/terms'
import { PrivacyPage } from '@/pages/privacy'
import { ShippingPage } from '@/pages/shipping'
import { InstructorProfilePage } from '@/pages/instructor-profile'

// Instructor Pages
import { InstructorBlogPage } from '@/pages/instructor/blog'
import { BlogEditorPage } from '@/pages/instructor/blog-editor'
import { InstructorDashboard } from '@/pages/instructor/dashboard'
import { InstructorCourses } from '@/pages/instructor/courses'
import { CreateCourse } from '@/pages/instructor/create-course'
import { EditCourse } from '@/pages/instructor/edit-course'
import { InstructorEarnings } from '@/pages/instructor/earnings'
import { InstructorStudents } from '@/pages/instructor/students'
import { InstructorAnalytics } from '@/pages/instructor/analytics'
import QuizBuilder from '@/pages/instructor/quiz-builder'
import AssignmentBuilder from '@/pages/instructor/assignment-builder'
import AssignmentGrading from '@/pages/instructor/assignment-grading'

// Admin Pages
import { AdminLayout } from '@/components/layout/admin/admin-layout'
import { AdminDashboard } from '@/pages/admin/dashboard'
import { AdminCourses } from '@/pages/admin/courses'
import { AdminNewCourse } from '@/pages/admin/new-course'
import { AdminStudents } from '@/pages/admin/students'
import { AdminInstructors } from '@/pages/admin/instructors'
import { AdminManage } from '@/pages/admin/manage'
import { AdminEnrollments } from '@/pages/admin/enrollments'
import { AdminCategories } from '@/pages/admin/categories'
import { AdminTags } from '@/pages/admin/tags'
import { AdminAnalytics } from '@/pages/admin/analytics'
import { AdminOrders } from '@/pages/admin/orders'
import { AdminLessons } from '@/pages/admin/lessons'
import { AdminQuizzes } from '@/pages/admin/quizzes'
import { AdminCertificates } from '@/pages/admin/certificates'
import { AdminSettings } from '@/pages/admin/settings'
import { CouponsPage } from '@/pages/admin/coupons'

// Import global styles
import '@/styles/globals.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <ProfileCompletionGuard>
              <div className="App">
              <ScrollToTop />
              <Routes>
              {/* Auth Routes - No Layout */}
              <Route path="/auth/linkedin/callback" element={<LinkedInCallbackPage />} />
              <Route path="/login" element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              } />
              <Route path="/register" element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              } />
              <Route path="/verify-email" element={
                <AuthLayout>
                  <VerifyEmailPage />
                </AuthLayout>
              } />
              <Route path="/forgot-password" element={
                <AuthLayout>
                  <ForgotPasswordPage />
                </AuthLayout>
              } />
              <Route path="/reset-password" element={
                <AuthLayout>
                  <ResetPasswordPage />
                </AuthLayout>
              } />

              {/* Public Routes - With Main Layout */}
              <Route path="/" element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              } />
              <Route path="/courses" element={
                <MainLayout>
                  <CoursesPage />
                </MainLayout>
              } />
              <Route path="/courses/:id" element={
                <MainLayout>
                  <CourseDetailPage />
                </MainLayout>
              } />
              <Route path="/categories" element={
                <MainLayout>
                  <CategoriesPage />
                </MainLayout>
              } />
              <Route path="/search" element={
                <MainLayout>
                  <SearchPage />
                </MainLayout>
              } />
              <Route path="/about" element={
                <MainLayout>
                  <AboutPage />
                </MainLayout>
              } />
              <Route path="/contact" element={
                <MainLayout>
                  <ContactPage />
                </MainLayout>
              } />
              <Route path="/verify-certificate" element={
                <MainLayout>
                  <VerifyCertificate />
                </MainLayout>
              } />
              <Route path="/verify-certificate/:certificateId" element={
                <MainLayout>
                  <VerifyCertificate />
                </MainLayout>
              } />
              <Route path="/blog" element={
                <MainLayout>
                  <BlogPage />
                </MainLayout>
              } />
              <Route path="/blog/:slug" element={
                <MainLayout>
                  <BlogDetailPage />
                </MainLayout>
              } />

              {/* Category Pages */}
              <Route path="/courses/utporul" element={
                <MainLayout>
                  <UtporulPage />
                </MainLayout>
              } />
              <Route path="/meiporul-ar" element={
                <MainLayout>
                  <MeiporulARPage />
                </MainLayout>
              } />
              <Route path="/courses/meiporul" element={
                <MainLayout>
                  <MeiporulPage />
                </MainLayout>
              } />
              <Route path="/courses/seyappaduporul" element={
                <MainLayout>
                  <SeyappaduporulPage />
                </MainLayout>
              } />

              {/* Policy Pages */}
              <Route path="/refund-policy" element={
                <MainLayout>
                  <RefundPolicyPage />
                </MainLayout>
              } />
              <Route path="/terms" element={
                <MainLayout>
                  <TermsPage />
                </MainLayout>
              } />
              <Route path="/privacy" element={
                <MainLayout>
                  <PrivacyPage />
                </MainLayout>
              } />
              <Route path="/shipping" element={
                <MainLayout>
                  <ShippingPage />
                </MainLayout>
              } />

              {/* Public Instructor Profile */}
              <Route path="/instructor/:id" element={
                <MainLayout>
                  <InstructorProfilePage />
                </MainLayout>
              } />

              {/* Protected Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/my-courses" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MyCoursesPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <MainLayout>
                    <WishlistPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <MainLayout>
                  <CartPage />
                </MainLayout>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckoutPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Learning Experience Routes */}
              <Route path="/courses/:id/learn" element={
                <ProtectedRoute>
                  <LessonPageRedesigned />
                </ProtectedRoute>
              } />
              <Route path="/courses/:courseId/lessons/:lessonId" element={
                <ProtectedRoute>
                  <LessonPageRedesigned />
                </ProtectedRoute>
              } />
              <Route path="/courses/:courseId/quizzes/:quizId" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />
              <Route path="/quiz/:quizId" element={
                <ProtectedRoute>
                  <QuizTaking />
                </ProtectedRoute>
              } />
              <Route path="/assignment/:assignmentId" element={
                <ProtectedRoute>
                  <AssignmentSubmission />
                </ProtectedRoute>
              } />
              <Route path="/courses/:courseId/certificate" element={
                <ProtectedRoute>
                  <CertificatePage />
                </ProtectedRoute>
              } />
              <Route path="/certificates/:courseId" element={
                <ProtectedRoute>
                  <CertificatePage />
                </ProtectedRoute>
              } />

              {/* Instructor Routes */}
              <Route path="/instructor" element={
                <ProtectedRoute requiredRole="instructor">
                  <Navigate to="/instructor/dashboard" replace />
                </ProtectedRoute>
              } />
              <Route path="/instructor/dashboard" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorDashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorCourses />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/create" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <CreateCourse />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/edit" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <EditCourse />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/earnings" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorEarnings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/students" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorStudents />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/analytics" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorAnalytics />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:courseId/quiz-builder/:quizId" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <QuizBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:courseId/quiz-builder" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <QuizBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:courseId/assignment-builder/:assignmentId" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <AssignmentBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:courseId/assignment-builder" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <AssignmentBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/assignments/:assignmentId/grade" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <AssignmentGrading />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/blog" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <InstructorBlogPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/blog/create" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <BlogEditorPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/instructor/blog/edit/:id" element={
                <ProtectedRoute requiredRole="instructor">
                  <MainLayout>
                    <BlogEditorPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/courses" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminCourses />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/courses/new" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminNewCourse />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/courses/categories" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/courses/tags" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminTags />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/students" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminStudents />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/manage" element={
                  <AdminLayout>
                    <AdminManage />
                  </AdminLayout>
                } />
              <Route path="/admin/courses/:id/edit" element={
                  <AdminLayout>
                    <EditCourse />
                  </AdminLayout>
                } />
              <Route path="/admin/courses/create" element={
                  <AdminLayout>
                    <CreateCourse />
                  </AdminLayout>
                } />
              <Route path="/admin/instructors" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminInstructors />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/enrollments" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminEnrollments />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/lessons" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminLessons />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/quizzes" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminQuizzes />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/certificates" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminCertificates />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/coupons" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <CouponsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <MainLayout>
                  <NotFoundPage />
                </MainLayout>
              } />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  style: {
                    border: '1px solid #10b981',
                  },
                },
                error: {
                  style: {
                    border: '1px solid #ef4444',
                  },
                },
              }}
            />
            </div>
            </ProfileCompletionGuard>
          </CartProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
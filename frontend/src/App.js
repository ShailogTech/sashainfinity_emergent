import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/core/Navbar";
import Footer from "@/components/core/Footer";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import CoursesPage from "@/pages/CoursesPage";
import BlogPage from "@/pages/BlogPage";
import ContactPage from "@/pages/ContactPage";
import MeiporulPage from "@/pages/MeiporulPage";
import LoginPage from "@/pages/LoginPage";
import GetStartedPage from "@/pages/GetStartedPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import NanoLearningPage from "@/pages/NanoLearningPage";
import ProfilePage from "@/pages/ProfilePage";
import CodeSandboxPage from "@/pages/CodeSandboxPage";
import WellnessPage from "@/pages/WellnessPage";
import AdminDashboard from "@/pages/admin/AdminDashboard.jsx";
import AdminCourses from "@/pages/admin/AdminCourses.jsx";
import AdminUsers from "@/pages/admin/AdminUsers.jsx";
import AdminLayout from "@/pages/admin/AdminLayout.jsx";
import TeacherDashboard from "@/pages/analytics/TeacherDashboard";
import TeacherStudio from "@/pages/analytics/TeacherStudio";
import HeatmapPage from "@/pages/analytics/HeatmapPage";
import SplashScreen from "@/components/core/SplashScreen";
import ARGalleryPage from "@/pages/ARGalleryPage";
import ARViewerPage from "@/pages/ARViewerPage";
import SearchPage from "@/pages/SearchPage";
import { SearchResults } from "@/components/Search";
import GlassmorphicDemo from "@/pages/GlassmorphicDemo";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuth = location.pathname === "/login" || location.pathname === "/get-started";

  return (
    <>
      <ScrollToTop />
      {!isAuth && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/nano/:courseId" element={<NanoLearningPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/meiporul-ar" element={<MeiporulPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/sandbox" element={<CodeSandboxPage />} />
        <Route path="/sandbox/:videoId" element={<CodeSandboxPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requireRoles={['admin', 'instructor']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route path="/teacher/studio" element={
          <ProtectedRoute requireRoles={['admin', 'instructor']}>
            <TeacherStudio />
          </ProtectedRoute>
        } />
        <Route path="/teacher/analytics" element={
          <ProtectedRoute requireRoles={['admin', 'instructor']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/analytics/heatmap" element={
          <ProtectedRoute requireRoles={['admin', 'instructor']}>
            <HeatmapPage />
          </ProtectedRoute>
        } />
        <Route path="/ar-gallery" element={<ARGalleryPage />} />
        <Route path="/ar/viewer/:id" element={<ARViewerPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/results" element={<SearchResults />} />
        <Route path="/demo/glassmorphic" element={<GlassmorphicDemo />} />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <WellnessPage />
          </ProtectedRoute>
        } />
      </Routes>
      {!isAuth && <Footer />}
    </>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className="sasha-app">
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <div style={{ visibility: splashDone ? "visible" : "hidden" }}>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;

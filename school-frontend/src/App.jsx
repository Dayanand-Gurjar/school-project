import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NotificationBanner from "./components/Notifications/NotificationBanner";

// Public Pages
import HomePage from "./pages/HomePage";
import AcademicsPage from "./pages/AcademicsPage";
import EventsPage from "./pages/EventsPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";

// Auth Pages
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";

// Dashboard Pages
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import TeacherDashboard from "./components/Dashboard/TeacherDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";

// Layout wrapper for dashboard pages
function DashboardLayout({ children }) {
  return (
    <div id="root">
      <Navbar isDashboard={true} />
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <div id="root">
      <Navbar />
      <NotificationBanner />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Dashboard redirect component
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

// Logout component
function Logout() {
  const { logout } = useAuth();
  
  React.useEffect(() => {
    logout();
  }, [logout]);
  
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      } />
      
      <Route path="/academics" element={
        <PublicLayout>
          <AcademicsPage />
        </PublicLayout>
      } />
      
      <Route path="/events" element={
        <PublicLayout>
          <EventsPage />
        </PublicLayout>
      } />
      
      <Route path="/gallery" element={
        <PublicLayout>
          <GalleryPage />
        </PublicLayout>
      } />
      
      <Route path="/contact" element={
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      } />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/logout" element={<Logout />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Admin Dashboard */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Teacher Dashboard */}
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <DashboardLayout>
            <TeacherDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Student Dashboard */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

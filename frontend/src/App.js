import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LandingPage from "@/pages/LandingPage";
import LandingPagePremium from "@/pages/LandingPagePremium";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallback from "@/pages/AuthCallback";
import StudentDashboard from "@/pages/StudentDashboard";
import StudentRegistration from "@/pages/StudentRegistration";
import StudentIDCard from "@/pages/StudentIDCard";
import CrewDashboard from "@/pages/CrewDashboard";
import AdminPanel from "@/pages/AdminPanel";
import LeaderboardPage from "@/pages/LeaderboardPage";
import CertificatesPage from "@/pages/CertificatesPage";
import ProgramsPage from "@/pages/ProgramsPage";
import BrandPage from "@/pages/BrandPage";
import BrandHeadDashboard from "@/pages/BrandHeadDashboard";
import NFCLoginPage from "@/pages/NFCLoginPage";
import CrewAttendanceMode from "@/pages/CrewAttendanceMode";
import SuperAdminPanel from "@/pages/SuperAdminPanel";
import TeamPage from "@/pages/TeamPage";
import KXCraftPage from "@/pages/KXCraftPage";

// Context
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

function AppRouter() {
  const location = useLocation();
  
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/premium" element={<LandingPagePremium />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/login/nfc" element={<NFCLoginPage />} />
      <Route path="/nfc-login" element={<NFCLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/:role" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/kxcraft" element={<KXCraftPage />} />
      <Route path="/brands/:brandSlug" element={<BrandPage />} />
      
      {/* NFC ID Card - Public (when tapped on any phone) */}
      <Route path="/id/:nfcId" element={<StudentIDCard />} />
      
      {/* Smart Dashboard Redirect based on role */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleBasedRedirect />
        </ProtectedRoute>
      } />
      
      {/* Student Routes */}
      <Route path="/student-dashboard" element={
        <ProtectedRoute>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/registration" element={
        <ProtectedRoute>
          <StudentRegistration />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/certificates" element={
        <ProtectedRoute>
          <CertificatesPage />
        </ProtectedRoute>
      } />
      
      {/* Crew/Trainer Routes */}
      <Route path="/crew" element={
        <ProtectedRoute roles={["trainer", "admin"]}>
          <CrewDashboard />
        </ProtectedRoute>
      } />
      <Route path="/crew/attendance" element={
        <ProtectedRoute roles={["trainer", "admin"]}>
          <CrewAttendanceMode />
        </ProtectedRoute>
      } />
      
      {/* Brand Head Routes */}
      <Route path="/brand-head" element={
        <ProtectedRoute roles={["brand_head", "admin"]}>
          <BrandHeadDashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={["admin", "super_admin"]}>
          <AdminPanel />
        </ProtectedRoute>
      } />
      
      {/* Super Admin Route */}
      <Route path="/super-admin" element={
        <ProtectedRoute roles={["super_admin"]}>
          <SuperAdminPanel />
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" richColors className="!top-1/2 !-translate-y-1/2" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

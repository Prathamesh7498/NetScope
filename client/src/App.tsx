import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveCapture } from './pages/LiveCapture';
import { PacketExplorer } from './pages/PacketExplorer';
import { ProtocolStats } from './pages/ProtocolStats';
import { FlowDetails } from './pages/FlowDetails';
import { AnomalyAlerts } from './pages/AnomalyAlerts';
import { CaptureSessions } from './pages/CaptureSessions';
import { PcapUpload } from './pages/PcapUpload';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { getCurrentUser, initializeAuth, UserProfile } from './api';
import {
  ForgotPasswordPage,
  ResendVerificationPage,
  ResetPasswordPage,
  VerificationSuccessPage,
  VerifyEmailPage,
} from './pages/AuthActions';

export const App: React.FC = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    const refreshAuth = () => {
      initializeAuth().then((user) => {
        setCurrentUser(user);
        setAuthReady(true);
      });
    };
    window.addEventListener('ncs_auth_change', handleAuthChange);
    refreshAuth();
    const interval = window.setInterval(refreshAuth, 60_000);
    return () => {
      window.removeEventListener('ncs_auth_change', handleAuthChange);
      window.clearInterval(interval);
    };
  }, []);

  const publicRoutes = [
    '/login',
    '/register',
    '/verify-email',
    '/verification-success',
    '/resend-verification',
    '/forgot-password',
    '/reset-password',
  ];
  const isAuthRoute = publicRoutes.includes(location.pathname);

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verification-success" element={<VerificationSuccessPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D1A] text-[#94A3B8] font-mono">
        Checking secure session…
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-200 font-mono relative selection:bg-[#06B6D4]/30 selection:text-white">
      {/* Fixed Left Rail Sidebar */}
      <Sidebar />

      {/* Main Container offset by sidebar width (w-64) */}
      <div className="pl-64 relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="w-full pt-20 px-6 min-h-screen bg-[#080D1A]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={<LiveCapture />} />
            <Route path="/packets" element={<PacketExplorer />} />
            <Route path="/protocols" element={<ProtocolStats />} />
            <Route path="/flows" element={<FlowDetails />} />
            <Route path="/anomalies" element={<AnomalyAlerts />} />
            <Route path="/sessions" element={<CaptureSessions />} />
            <Route path="/upload" element={<CaptureSessions />} />
            <Route path="/pcap" element={<PcapUpload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout, PublicLayout } from './components/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { PublicTrackPage } from './pages/PublicTrackPage';

// Dashboards
import { DashboardRouter } from './pages/DashboardRouter';
import { AdminDashboard } from './pages/AdminDashboard';
import { LmoDashboard } from './pages/LmoDashboard';
import { GatcDashboard } from './pages/GatcDashboard';
import { BusinessDashboard } from './pages/BusinessDashboard';

// Instruments
import { InstrumentsListPage } from './pages/InstrumentsListPage';
import { RegisterInstrumentPage } from './pages/RegisterInstrumentPage';
import { InstrumentDetailPage } from './pages/InstrumentDetailPage';

// Applications
import { ApplicationsListPage } from './pages/ApplicationsListPage';
import { NewApplicationPage } from './pages/NewApplicationPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';

// Field Verification
import { FieldVerificationPage } from './pages/FieldVerificationPage';

// Certificates
import { CertificatesListPage } from './pages/CertificatesListPage';
import { CertificateDetailPage } from './pages/CertificateDetailPage';

// Admin Pages
import { UsersManagementPage } from './pages/UsersManagementPage';
import { SettingsChecklistPage } from './pages/SettingsChecklistPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify" element={<PublicVerifyPage />} />
              <Route path="/verify/:certNumber" element={<PublicVerifyPage />} />
              <Route path="/track" element={<PublicTrackPage />} />
              <Route path="/track/:appId" element={<PublicTrackPage />} />
            </Route>

            {/* Mobile-Optimized Field Verification (Full Screen or Layout) */}
            <Route element={<ProtectedRoute allowedRoles={['LMO', 'GATC', 'SUPER_ADMIN']} />}>
              <Route path="/field-verification/:id" element={<FieldVerificationPage />} />
            </Route>

            {/* Protected Dashboard Layout Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/lmo/dashboard" element={<LmoDashboard />} />
                <Route path="/gatc/dashboard" element={<GatcDashboard />} />
                <Route path="/business/dashboard" element={<BusinessDashboard />} />

                {/* Instruments */}
                <Route path="/instruments" element={<InstrumentsListPage />} />
                <Route path="/instruments/new" element={<RegisterInstrumentPage />} />
                <Route path="/instruments/:id" element={<InstrumentDetailPage />} />

                {/* Applications */}
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/new" element={<NewApplicationPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />

                {/* Certificates */}
                <Route path="/certificates" element={<CertificatesListPage />} />
                <Route path="/certificates/:certNumber" element={<CertificateDetailPage />} />

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                  <Route path="/admin/users" element={<UsersManagementPage />} />
                  <Route path="/admin/settings" element={<SettingsChecklistPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>

                {/* Notifications */}
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

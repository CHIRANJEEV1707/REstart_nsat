import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import LoginPage from '@/pages/Login'
import DashboardPage from '@/pages/Dashboard'
import BundlesPage from '@/pages/Bundles'
import SubjectsPage from '@/pages/Subjects'
import ContentPage from '@/pages/Content'
import TestsPage from '@/pages/Tests'
import UsersPage from '@/pages/Users'
import OrdersPage from '@/pages/Orders'
import CouponsPage from '@/pages/Coupons'
import NotificationsPage from '@/pages/Notifications'
import CMSPage from '@/pages/CMS'
import SettingsPage from '@/pages/Settings'

// Layout
import AdminLayout from '@/components/layouts/AdminLayout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bundles" element={<BundlesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="cms" element={<CMSPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Public Pages
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import BundlesPage from '@/pages/Bundles'
import BundleDetailPage from '@/pages/BundleDetail'

// Protected Pages
import DashboardPage from '@/pages/Dashboard'
import MyBundlesPage from '@/pages/MyBundles'
import BundleContentPage from '@/pages/BundleContent'
import TestPage from '@/pages/Test'
import TestResultPage from '@/pages/TestResult'
import ProfilePage from '@/pages/Profile'
import PurchaseHistoryPage from '@/pages/PurchaseHistory'
import CheckoutPage from '@/pages/Checkout'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bundles" element={<BundlesPage />} />
        <Route path="/bundles/:bundleId" element={<BundleDetailPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bundles"
          element={
            <ProtectedRoute>
              <MyBundlesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bundles/:bundleId"
          element={
            <ProtectedRoute>
              <BundleContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/:testId"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/:testId/result/:attemptId"
          element={
            <ProtectedRoute>
              <TestResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-history"
          element={
            <ProtectedRoute>
              <PurchaseHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:bundleId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

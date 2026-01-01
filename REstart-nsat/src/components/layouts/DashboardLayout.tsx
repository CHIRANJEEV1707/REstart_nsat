import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  BookOpen,
  User,
  ShoppingBag,
  Bell,
  LogOut,
} from 'lucide-react'

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bundles', to: '/my-bundles', icon: BookOpen },
    { name: 'Purchase History', to: '/purchase-history', icon: ShoppingBag },
    { name: 'Profile', to: '/profile', icon: User },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard" className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">REstart NSAT</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{user?.user_metadata?.full_name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
                title="Sign out"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive(item.to)
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children || <Outlet />}</main>
        </div>
      </div>
    </div>
  )
}

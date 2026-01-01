import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardStats } from '@/types'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  BookOpen,
  CheckCircle,
  FileText,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // Get enrolled bundles
      const { data: purchases } = await supabase
        .from('purchases')
        .select('bundle_id')
        .eq('user_id', user!.id)
        .eq('status', 'completed')

      // Get completed modules
      const { data: progress } = await supabase
        .from('progress')
        .select('id')
        .eq('user_id', user!.id)
        .eq('completed', true)

      // Get test attempts
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('score, total_marks')
        .eq('user_id', user!.id)
        .eq('status', 'submitted')

      const avgScore =
        attempts && attempts.length > 0
          ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length
          : 0

      return {
        enrolledBundles: purchases?.length || 0,
        completedModules: progress?.length || 0,
        testsAttempted: attempts?.length || 0,
        averageScore: Math.round(avgScore),
      } as DashboardStats
    },
  })

  const { data: recentTests } = useQuery({
    queryKey: ['recent-tests', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('test_attempts')
        .select(`
          *,
          test:tests(title)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5)

      return data
    },
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3)

      return data
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your learning progress</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<BookOpen className="h-8 w-8 text-primary-600" />}
              label="Enrolled Bundles"
              value={stats?.enrolledBundles || 0}
            />
            <StatCard
              icon={<CheckCircle className="h-8 w-8 text-green-600" />}
              label="Completed Modules"
              value={stats?.completedModules || 0}
            />
            <StatCard
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              label="Tests Attempted"
              value={stats?.testsAttempted || 0}
            />
            <StatCard
              icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
              label="Average Score"
              value={`${stats?.averageScore || 0}%`}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Tests */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-primary-600" />
              Recent Test Attempts
            </h2>
            {recentTests && recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((attempt: any) => (
                  <Link
                    key={attempt.id}
                    to={`/test/${attempt.test_id}/result/${attempt.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{attempt.test.title}</p>
                      <p className="text-sm text-gray-600">
                        Score: {attempt.score}/{attempt.total_marks}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        (attempt.score / attempt.total_marks) * 100 >= 70
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {Math.round((attempt.score / attempt.total_marks) * 100)}%
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No test attempts yet. Start practicing!</p>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-primary-600" />
              Recent Announcements
            </h2>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-primary-50 border border-primary-100 rounded-lg"
                  >
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No new announcements</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/my-bundles" className="btn-primary text-center">
              View My Bundles
            </Link>
            <Link to="/bundles" className="btn-secondary text-center">
              Browse Bundles
            </Link>
            <Link to="/profile" className="btn-secondary text-center">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  )
}

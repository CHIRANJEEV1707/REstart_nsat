import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Package, ClipboardCheck, TrendingUp, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

interface DashboardStats {
  totalStudents: number
  totalRevenue: number
  activeBundles: number
  totalTests: number
  todayRevenue: number
  weeklyOrders: number
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch all stats in parallel
      const [
        { count: totalStudents },
        { data: revenueData },
        { count: activeBundles },
        { count: totalTests },
        { data: todayRevenue },
        { count: weeklyOrders },
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('final_amount')
          .eq('payment_status', 'completed'),
        supabase
          .from('bundles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase.from('tests').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase
          .from('orders')
          .select('final_amount')
          .eq('payment_status', 'completed')
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.final_amount, 0) || 0
      const todayRevenueAmount = todayRevenue?.reduce((sum, order) => sum + order.final_amount, 0) || 0

      return {
        totalStudents: totalStudents || 0,
        totalRevenue,
        activeBundles: activeBundles || 0,
        totalTests: totalTests || 0,
        todayRevenue: todayRevenueAmount,
        weeklyOrders: weeklyOrders || 0,
      }
    },
  })

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Active Bundles',
      value: stats?.activeBundles || 0,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Published Tests',
      value: stats?.totalTests || 0,
      icon: ClipboardCheck,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: TrendingUp,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
    },
    {
      title: 'Weekly Orders',
      value: stats?.weeklyOrders || 0,
      icon: Activity,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to REstart Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/bundles"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Create New Bundle</div>
              <div className="text-sm text-gray-600">Add a new course bundle</div>
            </a>
            <a
              href="/tests"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Create New Test</div>
              <div className="text-sm text-gray-600">Add a new mock test</div>
            </a>
            <a
              href="/coupons"
              className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Create Coupon</div>
              <div className="text-sm text-gray-600">Generate discount codes</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Storage Usage</span>
                <span className="text-gray-900 font-medium">2.3 GB / 10 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

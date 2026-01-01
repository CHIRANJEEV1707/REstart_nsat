import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { BookOpen, ArrowRight } from 'lucide-react'

export default function MyBundlesPage() {
  const { user } = useAuth()

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['my-bundles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          bundle:bundles(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bundles</h1>
        <p className="text-gray-600 mb-8">Access your purchased exam prep bundles</p>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : bundles && bundles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {bundles.map((purchase: any) => (
              <Link
                key={purchase.id}
                to={`/my-bundles/${purchase.bundle.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <BookOpen className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{purchase.bundle.title}</h3>
                      <p className="text-sm text-gray-600">Purchased on {new Date(purchase.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{purchase.bundle.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Valid until {new Date(purchase.expires_at).toLocaleDateString()}
                  </span>
                  <span className="text-primary-600 font-medium">Start Learning →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bundles yet</h3>
            <p className="text-gray-600 mb-6">Purchase your first bundle to start learning</p>
            <Link to="/bundles" className="btn-primary inline-block">
              Browse Bundles
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

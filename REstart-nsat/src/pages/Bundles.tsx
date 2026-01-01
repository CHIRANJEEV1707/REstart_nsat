import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Bundle } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { BookOpen, Clock } from 'lucide-react'

export default function BundlesPage() {
  const { data: bundles, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Bundle[]
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">REstart NSAT</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Preparation Bundles</h1>
        <p className="text-gray-600 mb-8">Choose the perfect bundle to ace your exams</p>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles?.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <Link to={`/bundles/${bundle.id}`} className="card hover:shadow-lg transition-shadow duration-200">
      <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center">
        <BookOpen className="h-20 w-20 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{bundle.description}</p>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-primary-600">{formatCurrency(bundle.price)}</span>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {bundle.duration_days} days access
        </div>
      </div>
      <ul className="space-y-2 mb-4">
        {bundle.features?.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-600">
            <span className="text-primary-600 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button className="w-full btn-primary">View Details</button>
    </Link>
  )
}

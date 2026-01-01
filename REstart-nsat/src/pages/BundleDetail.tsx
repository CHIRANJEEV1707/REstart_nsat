import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { BundleWithSubjects } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

export default function BundleDetailPage() {
  const { bundleId } = useParams<{ bundleId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['bundle', bundleId!],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          subjects:subjects(
            *,
            modules:modules(*)
          )
        `)
        .eq('id', bundleId!)
        .single()

      if (error) throw error
      return data as unknown as BundleWithSubjects
    },
  })

  const { data: hasPurchased } = useQuery({
    queryKey: ['purchase', bundleId, user?.id],
    queryFn: async () => {
      if (!user) return false
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('bundle_id', bundleId!)
        .eq('status', 'completed')
        .single()

      return !!data
    },
    enabled: !!user && !!bundleId,
  })

  const handlePurchase = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/checkout/${bundleId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!bundle) {
    return <div>Bundle not found</div>
  }

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
              {user ? (
                <Link to="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/bundles" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bundles
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{bundle.title}</h1>
              <p className="text-gray-600 mb-6">{bundle.description}</p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {bundle.duration_days} days access
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {bundle.subjects?.length || 0} subjects
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {bundle.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syllabus */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Syllabus</h2>
                <div className="space-y-4">
                  {bundle.subjects?.map((subject) => (
                    <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{subject.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{subject.description}</p>
                      <p className="text-sm text-gray-500">
                        {subject.modules?.length || 0} modules
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary-600 mb-2">
                  {formatCurrency(bundle.price)}
                </p>
                <p className="text-gray-600">One-time payment</p>
              </div>

              {hasPurchased ? (
                <Link to={`/my-bundles/${bundle.id}`} className="w-full btn-primary block text-center">
                  Go to Content
                </Link>
              ) : (
                <button onClick={handlePurchase} className="w-full btn-primary">
                  Buy Now
                </button>
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Lifetime access to content
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited mock tests
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Instant results & analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

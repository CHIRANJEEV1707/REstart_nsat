import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { FileText, PlayCircle, CheckCircle, Lock } from 'lucide-react'

interface Progress {
  module_id: string
  completed: boolean
}

interface Module {
  id: string
  title: string
  content_type: string
  content_url?: string
}

interface Subject {
  id: string
  title: string
  description: string
  modules?: Module[]
}

interface Bundle {
  id: string
  title: string
  description: string
  subjects?: Subject[]
}

interface Test {
  id: string
  title: string
  description: string
  duration_minutes: number
  total_marks: number
  bundle_id: string
  is_active: boolean
}

export default function BundleContentPage() {
  const { bundleId } = useParams()
  const { user } = useAuth()

  const { data: bundle, isLoading } = useQuery<Bundle>({
    queryKey: ['bundle-content', bundleId],
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
      return data
    },
    enabled: !!bundleId,
  })

  const { data: tests } = useQuery<Test[]>({
    queryKey: ['bundle-tests', bundleId!],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('bundle_id', bundleId!)
        .eq('is_active', true)

      if (error) throw error
      return data || []
    },
    enabled: !!bundleId,
  })

  const { data: progress } = useQuery<Progress[]>({
    queryKey: ['user-progress', user?.id, bundleId!],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress')
        .select('module_id, completed')
        .eq('user_id', user!.id)

      if (error) throw error
      return (data || []) as Progress[]
    },
    enabled: !!user && !!bundleId,
  })

  const isModuleCompleted = (moduleId: string) => {
    return progress?.some((p) => p.module_id === moduleId && p.completed) || false
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{bundle?.title}</h1>
        <p className="text-gray-600 mb-8">{bundle?.description}</p>

        {/* Tests Section */}
        {tests && tests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mock Tests</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <Link
                  key={test.id}
                  to={`/test/${test.id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">{test.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{test.duration_minutes} mins</span>
                        <span>{test.total_marks} marks</span>
                      </div>
                    </div>
                    <PlayCircle className="h-8 w-8 text-primary-600 flex-shrink-0" />
                  </div>
                  <button className="w-full mt-4 btn-primary">Start Test</button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Study Materials */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Study Materials</h2>
          <div className="space-y-6">
            {bundle?.subjects?.map((subject: any) => (
              <div key={subject.id} className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{subject.title}</h3>
                <p className="text-gray-600 mb-4">{subject.description}</p>
                <div className="space-y-2">
                  {subject.modules?.map((module: any) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        {isModuleCompleted(module.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{module.title}</p>
                          <p className="text-sm text-gray-600">{module.content_type.toUpperCase()}</p>
                        </div>
                      </div>
                      {module.content_url ? (
                        <a
                          href={module.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View
                        </a>
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

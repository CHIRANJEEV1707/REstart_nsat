import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { formatCurrency, calculateFinalPrice, generateSlug } from '@/lib/utils'
import { Database } from '@/types/database'

type Bundle = Database['public']['Tables']['bundles']['Row']

const EXAM_TYPES = ['JEE', 'NEET', 'CAT', 'GATE', 'UPSC', 'NSAT', 'SAT', 'GRE', 'GMAT']

export default function BundlesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data: bundles, isLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Bundle[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (bundleData: Partial<Bundle>) => {
      const { data, error } = await supabase
        .from('bundles')
        .insert([bundleData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast.success('Bundle created successfully!')
      setIsCreating(false)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create bundle')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Bundle> }) => {
      const { error } = await supabase
        .from('bundles')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast.success('Bundle updated successfully!')
      setEditingBundle(null)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update bundle')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bundles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundles'] })
      toast.success('Bundle deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete bundle')
    },
  })

  const filteredBundles = bundles?.filter(
    (bundle) =>
      bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.exam_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-600 mt-1">Manage your course bundles</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Bundle
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bundles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bundle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBundles?.map((bundle) => (
          <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {bundle.thumbnail_url && (
                <img
                  src={bundle.thumbnail_url}
                  alt={bundle.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      {bundle.exam_type}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        bundle.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : bundle.status === 'draft'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {bundle.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{bundle.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {bundle.short_description || bundle.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bundle.final_price)}
                  </span>
                  {bundle.discount_percentage > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(bundle.price)}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {bundle.discount_percentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="font-semibold text-gray-900">{bundle.total_tests}</div>
                    <div className="text-gray-600">Tests</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="font-semibold text-gray-900">{bundle.total_pdfs}</div>
                    <div className="text-gray-600">PDFs</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="font-semibold text-gray-900">{bundle.validity_days}</div>
                    <div className="text-gray-600">Days</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingBundle(bundle)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(bundle.id, bundle.name)}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingBundle) && (
        <BundleModal
          bundle={editingBundle}
          onClose={() => {
            setIsCreating(false)
            setEditingBundle(null)
          }}
          onSave={(data) => {
            if (editingBundle) {
              updateMutation.mutate({ id: editingBundle.id, data })
            } else {
              createMutation.mutate(data)
            }
          }}
        />
      )}
    </div>
  )
}

function BundleModal({
  bundle,
  onClose,
  onSave,
}: {
  bundle: Bundle | null
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    name: bundle?.name || '',
    exam_type: bundle?.exam_type || 'JEE',
    description: bundle?.description || '',
    short_description: bundle?.short_description || '',
    price: bundle?.price || 0,
    discount_percentage: bundle?.discount_percentage || 0,
    validity_days: bundle?.validity_days || 365,
    status: bundle?.status || 'draft',
    thumbnail_url: bundle?.thumbnail_url || '',
    features: bundle?.features || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const slug = generateSlug(formData.name)
    onSave({ ...formData, slug })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {bundle ? 'Edit Bundle' : 'Create Bundle'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Bundle Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="exam_type">Exam Type*</Label>
              <select
                id="exam_type"
                value={formData.exam_type}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                required
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)*</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percentage: Number(e.target.value) })
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validity">Validity (Days)*</Label>
                <Input
                  id="validity"
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_days: Number(e.target.value) })
                  }
                  required
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                type="url"
                value={formData.thumbnail_url || ''}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.price > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  Final Price:{' '}
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      calculateFinalPrice(formData.price, formData.discount_percentage)
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {bundle ? 'Update Bundle' : 'Create Bundle'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

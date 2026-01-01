import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, CheckCircle, X } from 'lucide-react'

export default function PurchaseHistoryPage() {
  const { user } = useAuth()

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchase-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          bundle:bundles(title)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Purchase History</h1>

        {isLoading ? (
          <div className="card">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : purchases && purchases.length > 0 ? (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Bundle</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Order ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((purchase: any) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {purchase.bundle.title}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(purchase.created_at)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {formatCurrency(purchase.amount_paid)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={purchase.status} />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                        {purchase.razorpay_order_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600">Your purchase history will appear here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  }

  const icons = {
    completed: <CheckCircle className="h-4 w-4" />,
    pending: <ShoppingBag className="h-4 w-4" />,
    failed: <X className="h-4 w-4" />,
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
      <span className="mr-1">{icons[status as keyof typeof icons]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

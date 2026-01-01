import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Tag } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const { bundleId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount_type: string
    discount_value: number
    max_discount_amount?: number
    min_purchase_amount: number
    valid_from: string
    valid_until: string
  } | null>(null)
  const [couponError, setCouponError] = useState('')

  const { data: bundle } = useQuery<{
    id: string
    title: string
    price: number
    duration_days: number
  }>({
    queryKey: ['bundle', bundleId!],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundleId!)
        .single()

      if (error) throw error
      return data
    },
  })

  const applyCoupon = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single() as { data: {
          code: string
          discount_type: string
          discount_value: number
          max_discount_amount?: number
          min_purchase_amount: number
          valid_from: string
          valid_until: string
        } | null, error: any }

      if (error || !data) throw new Error('Invalid coupon code')

      const now = new Date()
      const validFrom = new Date(data.valid_from)
      const validUntil = new Date(data.valid_until)

      if (now < validFrom || now > validUntil) {
        throw new Error('Coupon has expired')
      }

      if (!bundle || (bundle as any).price < data.min_purchase_amount) {
        throw new Error(`Minimum purchase amount is ${formatCurrency(data.min_purchase_amount)}`)
      }

      return data
    },
    onSuccess: (data) => {
      setAppliedCoupon(data)
      setCouponError('')
    },
    onError: (error: Error) => {
      setCouponError(error.message)
    },
  })

  const createOrder = useMutation({
    mutationFn: async (amount: number) => {
      // In production, call your backend to create Razorpay order
      // For now, we'll simulate it
      const orderId = `order_${Date.now()}`
      
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user!.id,
          bundle_id: bundleId!,
          amount_paid: amount,
          razorpay_order_id: orderId,
          status: 'pending',
          expires_at: new Date(Date.now() + bundle!.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          coupon_code: appliedCoupon?.code,
          discount_amount: appliedCoupon ? calculateDiscount() : 0,
        } as any)
        .select()
        .single() as { data: { id: string } | null, error: any }

      if (error || !data) throw error
      return { orderId, purchaseId: data.id }
    },
  })

  const calculateDiscount = () => {
    if (!appliedCoupon || !bundle) return 0

    let discount = 0
    if (appliedCoupon.discount_type === 'percentage') {
      discount = (bundle.price * appliedCoupon.discount_value) / 100
      if (appliedCoupon.max_discount_amount) {
        discount = Math.min(discount, appliedCoupon.max_discount_amount)
      }
    } else {
      discount = appliedCoupon.discount_value
    }

    return Math.min(discount, bundle.price)
  }

  const getFinalAmount = () => {
    if (!bundle) return 0
    return bundle.price - calculateDiscount()
  }

  const handlePayment = async () => {
    if (!bundle) return

    const finalAmount = getFinalAmount()

    try {
      const { orderId, purchaseId } = await createOrder.mutateAsync(finalAmount)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'REstart NSAT',
        description: bundle.title,
        order_id: orderId,
        handler: async function (response: any) {
          // Update purchase status
          await supabase
            .from('purchases')
            .update({
              status: 'completed',
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq('id', purchaseId)

          navigate(`/my-bundles/${bundleId}`)
        },
        prefill: {
          name: user?.user_metadata?.full_name,
          email: user?.email,
        },
        theme: {
          color: '#0ea5e9',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    }
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="space-y-6">
          {/* Bundle Details */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium text-gray-900">{bundle.title}</p>
                <p className="text-sm text-gray-600">{bundle.duration_days} days access</p>
              </div>
              <p className="font-bold text-gray-900">{formatCurrency(bundle.price)}</p>
            </div>

            {/* Coupon */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input-field pl-10"
                    disabled={!!appliedCoupon}
                  />
                </div>
                {appliedCoupon ? (
                  <button
                    onClick={() => {
                      setAppliedCoupon(null)
                      setCouponCode('')
                    }}
                    className="btn-secondary"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => applyCoupon.mutate(couponCode)}
                    disabled={!couponCode || applyCoupon.isPending}
                    className="btn-primary disabled:opacity-50"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="text-sm text-red-600">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-sm text-green-600">
                  Coupon applied! You saved {formatCurrency(calculateDiscount())}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              {appliedCoupon && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600 font-medium">
                    -{formatCurrency(calculateDiscount())}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(getFinalAmount())}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={createOrder.isPending}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center"
          >
            <CreditCard className="h-6 w-6 mr-2" />
            {createOrder.isPending ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}

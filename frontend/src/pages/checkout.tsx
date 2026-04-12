import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Lock } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

export function CheckoutPage() {
  const { items, appliedCoupon, getFinalTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  useEffect(() => {
    // Force re-render after zustand rehydrates from localStorage
    const timer = setTimeout(() => setHydrated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!document.querySelector('script[src*="razorpay"]')) {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.head.appendChild(s)
    }
  }, [])

  const total = getFinalTotal()
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0

  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setProcessing(true)
    try {
      const orderData: any = { course_ids: items.map(i => i.courseId) }
      if (appliedCoupon) orderData.coupon_code = appliedCoupon.code
      const orderResponse = await api.post('/orders/', orderData)
      const createdOrder = orderResponse.data
      if (total <= 0) {
        clearCart(); setOrderComplete(true)
        toast.success('Enrolled successfully!'); return
      }
      const options = {
        key: 'rzp_live_DSn07pFbccQOX2',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'SashaInfinity',
        description: 'Course Enrollment',
        order_id: createdOrder.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              order_id: createdOrder.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            })
            clearCart(); setOrderComplete(true)
            toast.success('Payment successful!')
          } catch { toast.error('Payment verification failed') }
        },
        theme: { color: '#f4911a' },
        modal: { ondismiss: () => { setProcessing(false); toast.error('Payment cancelled') } }
      }
      new window.Razorpay(options).open()
    } catch (error: any) {
      console.error('Checkout error full:', error.response?.data)
      const msg = error.response?.data?.detail || error.message || 'Failed to process order'
      toast.error(msg)
    } finally { setProcessing(false) }
  }

  if (!hydrated) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  if (orderComplete) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Successful!</h2>
        <p className="text-gray-600 mb-8">You are now enrolled in your courses.</p>
        <Link to="/my-courses" className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600">
          Go to My Courses
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-orange-500 hover:text-orange-600 text-sm">← Back to Cart</Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Your Courses ({items.length})
            </h2>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">By {item.instructor}</p>
                    <p className="text-orange-500 font-bold text-sm mt-1">
                      {item.price === 0 ? 'Free' : `₹${item.price}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{items.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={processing}
              className="w-full mt-6 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              {processing ? 'Processing...' : total <= 0 ? 'Enroll Free' : `Pay ₹${total.toFixed(2)}`}
            </button>
            <div className="mt-4 space-y-1 text-xs text-gray-500 text-center">
              <p>🔒 Secure 256-bit SSL encryption</p>
              <p>✓ 30-day money-back guarantee</p>
              <p>✓ Lifetime access to courses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

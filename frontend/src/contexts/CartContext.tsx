import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface CartItem {
  courseId: number
  title: string
  instructor: string
  price: number
  salePrice?: number
  thumbnail: string
  level: string
  rating?: number
}

interface AppliedCoupon {
  code: string
  discountAmount: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

interface CartContextType {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  addToCart: (item: CartItem) => void
  removeFromCart: (courseId: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
  isInCart: (courseId: number) => boolean
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
  getFinalTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }

    const savedCoupon = localStorage.getItem('appliedCoupon')
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon)
        // Expire coupon after 60 seconds of inactivity
        if (parsed && parsed.savedAt && Date.now() - parsed.savedAt < 60000) {
          setAppliedCoupon(parsed.coupon)
        } else {
          localStorage.removeItem('appliedCoupon')
        }
      } catch (error) {
        console.error('Error loading coupon from localStorage:', error)
        localStorage.removeItem('appliedCoupon')
      }
    }

    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Save coupon to localStorage whenever it changes (after initial load)
  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem(
          'appliedCoupon',
          JSON.stringify({ coupon: appliedCoupon, savedAt: Date.now() })
        )
      } else {
        localStorage.removeItem('appliedCoupon')
      }
    }
  }, [appliedCoupon, isLoaded])

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      // Check if item already exists in cart
      const exists = prev.find(i => i.courseId === item.courseId)
      if (exists) {
        toast.info('Course already in cart')
        return prev
      }
      toast.success('Added to cart')
      return [...prev, item]
    })
  }

  const removeFromCart = (courseId: number) => {
    setItems(prev => prev.filter(item => item.courseId !== courseId))
    toast.success('Removed from cart')
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
    localStorage.removeItem('cart')
    localStorage.removeItem('appliedCoupon')
  }

  const getCartTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.salePrice ?? item.price
      return sum + price
    }, 0)
  }

  const getFinalTotal = () => {
    const subtotal = getCartTotal()
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
    return Math.max(0, subtotal - discount)
  }

  const getItemCount = () => {
    return items.length
  }

  const isInCart = (courseId: number) => {
    return items.some(item => item.courseId === courseId)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
        isInCart,
        setAppliedCoupon,
        getFinalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

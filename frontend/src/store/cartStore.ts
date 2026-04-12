import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: number
  title: string
  instructor: string
  price: number
  originalPrice?: number
  salePrice?: number
  rating: number
  duration: string
  level: string
  thumbnail: string
  discount?: number
}

interface CartStore {
  items: CartItem[]
  promoCode: string | null
  promoDiscount: number

  // Actions
  addToCart: (item: CartItem) => void
  removeFromCart: (courseId: number) => void
  clearCart: () => void
  applyPromoCode: (code: string) => boolean
  removePromoCode: () => void

  // Computed
  getSubtotal: () => number
  getSavings: () => number
  getTotal: () => number
  getItemCount: () => number
  isInCart: (courseId: number) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,

      addToCart: (item) => {
        const state = get()

        // Check if already in cart
        if (state.items.find(i => i.id === item.id)) {
          return
        }

        set({ items: [...state.items, item] })
      },

      removeFromCart: (courseId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== courseId)
        }))
      },

      clearCart: () => {
        set({ items: [], promoCode: null, promoDiscount: 0 })
      },

      applyPromoCode: (code) => {
        const validCodes: Record<string, number> = {
          'SAVE10': 0.10,
          'SAVE20': 0.20,
          'WELCOME': 0.15,
          'STUDENT': 0.25
        }

        const discount = validCodes[code.toUpperCase()]

        if (discount) {
          set({ promoCode: code.toUpperCase(), promoDiscount: discount })
          return true
        }

        return false
      },

      removePromoCode: () => {
        set({ promoCode: null, promoDiscount: 0 })
      },

      getSubtotal: () => {
        const state = get()
        return state.items.reduce((sum, item) => {
          // Use sale price if available, otherwise regular price
          const price = item.salePrice || item.price
          return sum + price
        }, 0)
      },

      getSavings: () => {
        const state = get()
        return state.items.reduce((sum, item) => {
          // Calculate savings from original price vs current price
          if (item.originalPrice) {
            const currentPrice = item.salePrice || item.price
            return sum + (item.originalPrice - currentPrice)
          }
          return sum
        }, 0)
      },

      getTotal: () => {
        const state = get()
        const subtotal = state.getSubtotal()
        const promoAmount = subtotal * state.promoDiscount
        return subtotal - promoAmount
      },

      getItemCount: () => {
        return get().items.length
      },

      isInCart: (courseId) => {
        return get().items.some(item => item.id === courseId)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)

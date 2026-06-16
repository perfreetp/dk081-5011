import { create } from 'zustand'
import type { Furniture, BookingOrder, DamageReport } from '@/types'
import { mockFurniture, mockOrders, mockDamageReports } from '@/data/mock'

interface AppState {
  furnitureList: Furniture[]
  orders: BookingOrder[]
  damageReports: DamageReport[]
  selectedCategory: string
  searchQuery: string

  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  getFurnitureById: (id: string) => Furniture | undefined
  getOrderById: (id: string) => BookingOrder | undefined
  getOrderByFurnitureId: (furnitureId: string) => BookingOrder | undefined
  createOrder: (order: BookingOrder) => void
  updateOrder: (id: string, updates: Partial<BookingOrder>) => void
  addDamageReport: (report: DamageReport) => void
}

export const useStore = create<AppState>((set, get) => ({
  furnitureList: mockFurniture,
  orders: mockOrders,
  damageReports: mockDamageReports,
  selectedCategory: 'all',
  searchQuery: '',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFurnitureById: (id) => get().furnitureList.find((f) => f.id === id),

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getOrderByFurnitureId: (furnitureId) =>
    get().orders.find((o) => o.furnitureId === furnitureId),

  createOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),

  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),

  addDamageReport: (report) =>
    set((state) => ({ damageReports: [...state.damageReports, report] })),
}))

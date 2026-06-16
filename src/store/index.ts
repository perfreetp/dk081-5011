import { create } from 'zustand'
import type { Furniture, BookingOrder, DamageReport } from '@/types'
import { mockFurniture, mockOrders, mockDamageReports } from '@/data/mock'

const STORAGE_KEY_ORDERS = 'juya_orders'
const STORAGE_KEY_DAMAGE = 'juya_damage'

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T[]
  } catch {}
  return fallback
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

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
  getLatestOrder: () => BookingOrder | undefined
  createOrder: (order: BookingOrder) => void
  updateOrder: (id: string, updates: Partial<BookingOrder>) => void
  addDamageReport: (report: DamageReport) => void
}

export const useStore = create<AppState>((set, get) => ({
  furnitureList: mockFurniture,
  orders: loadFromStorage<BookingOrder>(STORAGE_KEY_ORDERS, mockOrders),
  damageReports: loadFromStorage<DamageReport>(STORAGE_KEY_DAMAGE, mockDamageReports),
  selectedCategory: 'all',
  searchQuery: '',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getFurnitureById: (id) => get().furnitureList.find((f) => f.id === id),

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getOrderByFurnitureId: (furnitureId) =>
    get().orders.find((o) => o.furnitureId === furnitureId),

  getLatestOrder: () => {
    const orders = get().orders
    return orders.length > 0 ? orders[orders.length - 1] : undefined
  },

  createOrder: (order) =>
    set((state) => {
      const orders = [...state.orders, order]
      saveToStorage(STORAGE_KEY_ORDERS, orders)
      return { orders }
    }),

  updateOrder: (id, updates) =>
    set((state) => {
      const orders = state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o))
      saveToStorage(STORAGE_KEY_ORDERS, orders)
      return { orders }
    }),

  addDamageReport: (report) =>
    set((state) => {
      const damageReports = [...state.damageReports, report]
      saveToStorage(STORAGE_KEY_DAMAGE, damageReports)
      return { damageReports }
    }),
}))

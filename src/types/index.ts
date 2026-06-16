export interface Furniture {
  id: string
  name: string
  category: 'original_wood' | 'mid_century' | 'office' | 'designer'
  material: string
  dimensions: { length: number; width: number; height: number; weight: number }
  price: number
  images: string[]
  condition: string
  source: string
  repairHistory: RepairRecord[]
  riskLevel: 'low' | 'medium' | 'high'
  riskNotes: string[]
  careTips: string[]
  resaleSuggestion: {
    priceRange: [number, number]
    bestTiming: string
    tips: string[]
  }
}

export interface BookingOrder {
  id: string
  furnitureId: string
  serviceType: 'deliver_then_install' | 'inspect_then_install'
  dateSlot: string
  timeSlot: 'morning' | 'afternoon'
  addOns: { whiteGlove: boolean; takeOld: boolean }
  status: 'pending' | 'preparing' | 'in_transit' | 'arriving' | 'installing' | 'completed'
  installer: Installer
  totalFee: number
  elevatorChecked: boolean
  corridorChecked: boolean
  preparationDone: boolean
}

export interface Installer {
  id: string
  name: string
  avatar: string
  rating: number
  yearsExperience: number
  specialties: string[]
  completedJobs: number
}

export interface RepairRecord {
  date: string
  description: string
  photos: string[]
}

export interface DamageReport {
  id: string
  orderId: string
  photoUrl: string
  description: string
  reportedAt: string
  responsibility: 'installer' | 'pre_existing' | 'transit'
}

export interface PreparationItem {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
}

export type CategoryType = 'original_wood' | 'mid_century' | 'office' | 'designer'

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  original_wood: '原木家具',
  mid_century: '中古家具',
  office: '办公家具',
  designer: '设计师款',
}

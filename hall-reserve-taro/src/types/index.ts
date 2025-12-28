export type ScenarioCategory = 'MOVIE' | 'TEAM' | 'PARTY'

export interface ScenarioPackage {
  id: string
  name: string
  price: number
  originalPrice: number
  desc: string
  tags: string[]
}

export interface AddonItem {
  id: string
  name: string
  price: number
  category: 'Food' | 'Drink' | 'Service'
}

export interface Scenario {
  id: string
  title: string
  image: string
  category: ScenarioCategory
  tags: string[]
  location: string
  rating: number
  packages: ScenarioPackage[]
}

export interface BookingState {
  scenarioId: string | null
  packageId: string | null
  date: string
  timeSlot: string
  addons: Record<string, number>
}

export interface AdminOrder {
  id: string
  customer: string
  scenarioTitle: string
  time: string
  amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export interface TimeSlot {
  time: string
  status: 'Available' | 'Sold Out'
}

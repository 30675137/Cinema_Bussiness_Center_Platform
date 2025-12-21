import { create } from 'zustand'
import type { Scenario } from '@/types'

interface AppState {
  activeScenario: Scenario | null
  successData: {
    scenario: Scenario
    package: { id: string; name: string; price: number }
    addons: Record<string, number>
    total: number
    time: string
    date: string
  } | null
  setActiveScenario: (scenario: Scenario | null) => void
  setSuccessData: (data: AppState['successData']) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeScenario: null,
  successData: null,
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setSuccessData: (data) => set({ successData: data }),
  reset: () => set({ activeScenario: null, successData: null })
}))

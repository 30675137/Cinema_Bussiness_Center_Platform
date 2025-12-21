import { create } from 'zustand'

interface BookingState {
  selectedDate: string
  selectedTime: string | null
  selectedPkgId: string
  addons: Record<string, number>
  setSelectedDate: (date: string) => void
  setSelectedTime: (time: string | null) => void
  setSelectedPkgId: (pkgId: string) => void
  updateAddon: (id: string, delta: number) => void
  reset: () => void
}

const initialState = {
  selectedDate: '今天',
  selectedTime: null,
  selectedPkgId: '',
  addons: {} as Record<string, number>
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setSelectedPkgId: (pkgId) => set({ selectedPkgId: pkgId }),
  updateAddon: (id, delta) =>
    set((state) => {
      const current = state.addons[id] || 0
      const next = Math.max(0, current + delta)
      return { addons: { ...state.addons, [id]: next } }
    }),
  reset: () => set(initialState)
}))

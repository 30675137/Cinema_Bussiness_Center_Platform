/**
 * 预约表单状态管理
 * 使用Zustand管理预约表单的所有状态
 */
import { create } from 'zustand'
import type {
  TimeSlot,
  PackageTier,
  AddonItem,
  ContactInfo,
} from '@/services/types/reservation.types'

/**
 * 预约表单State接口
 */
interface ReservationFormState {
  // 场景包信息
  scenarioPackageId: string | null
  scenarioPackageName: string
  scenarioPackageImage: string

  // 选择的日期（显示用，如"12月25日（今天）"）
  selectedDate: string
  
  // 选择的日期（API用，如"2024-12-25"）
  reservationDateApi: string

  // 选择的时段
  selectedSlot: TimeSlot | null

  // 选择的套餐
  selectedTier: PackageTier | null

  // 选择的加购项 (addonId -> { item, quantity })
  selectedAddons: Map<string, { item: AddonItem; quantity: number }>

  // 联系人信息
  contactInfo: ContactInfo

  // 备注
  remark: string

  // Actions
  setScenarioPackage: (id: string, name: string, image: string) => void
  setDate: (displayDate: string, apiDate: string) => void
  setSlot: (slot: TimeSlot | null) => void
  setTier: (tier: PackageTier | null) => void
  addAddon: (item: AddonItem, quantity?: number) => void
  removeAddon: (addonId: string) => void
  updateAddonQuantity: (addonId: string, quantity: number) => void
  setContactInfo: (info: Partial<ContactInfo>) => void
  setRemark: (remark: string) => void
  resetForm: () => void

  // Computed getters
  getTotalAmount: () => number
  getAddonsTotalAmount: () => number
  isFormValid: () => boolean
}

/**
 * 获取今天的日期字符串 (yyyy-MM-dd)
 */
function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * 初始状态
 */
const initialState = {
  scenarioPackageId: null,
  scenarioPackageName: '',
  scenarioPackageImage: '',
  selectedDate: getTodayString(),
  reservationDateApi: getTodayString(),
  selectedSlot: null,
  selectedTier: null,
  selectedAddons: new Map<string, { item: AddonItem; quantity: number }>(),
  contactInfo: { name: '', phone: '' },
  remark: '',
}

/**
 * 预约表单Store
 */
export const useReservationStore = create<ReservationFormState>((set, get) => ({
  ...initialState,

  // 设置场景包信息
  setScenarioPackage: (id, name, image) =>
    set({
      scenarioPackageId: id,
      scenarioPackageName: name,
      scenarioPackageImage: image,
    }),

  // 设置日期
  setDate: (displayDate, apiDate) =>
    set({
      selectedDate: displayDate,
      reservationDateApi: apiDate,
      // 切换日期时清空时段选择
      selectedSlot: null,
    }),

  // 设置时段
  setSlot: (slot) => set({ selectedSlot: slot }),

  // 设置套餐
  setTier: (tier) => set({ selectedTier: tier }),

  // 添加加购项
  addAddon: (item, quantity = 1) =>
    set((state) => {
      const newAddons = new Map(state.selectedAddons)
      const existing = newAddons.get(item.id)
      if (existing) {
        newAddons.set(item.id, {
          item,
          quantity: existing.quantity + quantity,
        })
      } else {
        newAddons.set(item.id, { item, quantity })
      }
      return { selectedAddons: newAddons }
    }),

  // 移除加购项
  removeAddon: (addonId) =>
    set((state) => {
      const newAddons = new Map(state.selectedAddons)
      newAddons.delete(addonId)
      return { selectedAddons: newAddons }
    }),

  // 更新加购项数量
  updateAddonQuantity: (addonId, quantity) =>
    set((state) => {
      const newAddons = new Map(state.selectedAddons)
      const existing = newAddons.get(addonId)
      if (existing) {
        if (quantity <= 0) {
          newAddons.delete(addonId)
        } else {
          const maxQty = existing.item.maxQuantity || 99
          newAddons.set(addonId, {
            item: existing.item,
            quantity: Math.min(quantity, maxQty),
          })
        }
      }
      return { selectedAddons: newAddons }
    }),

  // 设置联系人信息
  setContactInfo: (info) =>
    set((state) => ({
      contactInfo: { ...state.contactInfo, ...info },
    })),

  // 设置备注
  setRemark: (remark) => set({ remark }),

  // 重置表单
  resetForm: () =>
    set({
      ...initialState,
      selectedDate: getTodayString(),
      selectedAddons: new Map(),
    }),

  // 计算加购项总金额
  getAddonsTotalAmount: () => {
    const { selectedAddons } = get()
    let total = 0
    selectedAddons.forEach(({ item, quantity }) => {
      total += item.price * quantity
    })
    return total
  },

  // 计算总金额
  getTotalAmount: () => {
    const { selectedTier } = get()
    const tierPrice = selectedTier?.price || 0
    const addonsTotal = get().getAddonsTotalAmount()
    return tierPrice + addonsTotal
  },

  // 验证表单是否有效
  isFormValid: () => {
    const { selectedDate, selectedSlot, selectedTier, contactInfo } = get()

    // 必填项检查
    if (!selectedDate) return false
    if (!selectedSlot) return false
    if (!selectedTier) return false
    if (!contactInfo.name.trim()) return false
    if (!contactInfo.phone.trim()) return false

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(contactInfo.phone)) return false

    return true
  },
}))

/**
 * 选择器Hooks - 用于优化组件渲染
 */

// 获取场景包信息
export const useScenarioPackage = () =>
  useReservationStore((state) => ({
    id: state.scenarioPackageId,
    name: state.scenarioPackageName,
    image: state.scenarioPackageImage,
  }))

// 获取选择的日期
export const useSelectedDate = () =>
  useReservationStore((state) => state.selectedDate)

// 获取选择的时段
export const useSelectedSlot = () =>
  useReservationStore((state) => state.selectedSlot)

// 获取选择的套餐
export const useSelectedTier = () =>
  useReservationStore((state) => state.selectedTier)

// 获取选择的加购项
export const useSelectedAddons = () =>
  useReservationStore((state) => state.selectedAddons)

// 获取联系人信息
export const useContactInfo = () =>
  useReservationStore((state) => state.contactInfo)

// 获取总金额
export const useTotalAmount = () =>
  useReservationStore((state) => state.getTotalAmount())

// 获取表单是否有效
export const useIsFormValid = () =>
  useReservationStore((state) => state.isFormValid())

export default useReservationStore

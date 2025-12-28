/**
 * 时段选择器组件
 * 显示可用时段列表并支持选择
 */
import { View, Text, ScrollView } from '@tarojs/components'
import { useMemo } from 'react'
import { useReservationStore } from '@/stores/reservationStore'
import type { TimeSlot } from '@/services/types/reservation.types'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedDate: string
}

// 日期选项
const DATE_OPTIONS = ['今天', '明天', '后天']

/**
 * 获取日期选项的实际日期字符串
 */
function getDateString(option: string): string {
  const today = new Date()
  let targetDate = today

  if (option === '明天') {
    targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  } else if (option === '后天') {
    targetDate = new Date(today.getTime() + 48 * 60 * 60 * 1000)
  }

  return targetDate.toISOString().split('T')[0]
}

export default function TimeSlotPicker({ slots, selectedDate }: TimeSlotPickerProps) {
  const { selectedSlot, setDate, setSlot } = useReservationStore()

  // 过滤当天可用的时段
  const availableSlots = useMemo(() => {
    return slots.filter((slot) => slot.available)
  }, [slots])

  const handleDateSelect = (date: string) => {
    setDate(date)
    // 切换日期时清空时段选择
    setSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSlot(slot)
    }
  }

  return (
    <View className="time-slot-picker">
      {/* 日期选择 */}
      <ScrollView scrollX className="date-strip">
        {DATE_OPTIONS.map((option) => {
          const dateStr = getDateString(option)
          const isActive = selectedDate === option || selectedDate === dateStr
          return (
            <View
              key={option}
              className={`date-item ${isActive ? 'active' : ''}`}
              onClick={() => handleDateSelect(getDateString(option))}
            >
              <Text>{option}</Text>
            </View>
          )
        })}
      </ScrollView>

      {/* 时段网格 */}
      <View className="time-grid">
        {slots.length === 0 ? (
          <View className="no-slots">
            <Text>当日无可用时段</Text>
          </View>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlot?.id === slot.id
            return (
              <View
                key={slot.id}
                className={`time-item ${!slot.available ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSlotSelect(slot)}
              >
                <Text className="time-text">{slot.startTime}</Text>
                {!slot.available && <Text className="sold-out">售罄</Text>}
                {slot.available && slot.capacity - slot.bookedCount <= 3 && (
                  <Text className="limited">仅剩{slot.capacity - slot.bookedCount}</Text>
                )}
              </View>
            )
          })
        )}
      </View>

      {/* 选中状态提示 */}
      {selectedSlot && (
        <View className="selected-info">
          <Text>已选时段：{selectedSlot.name}</Text>
        </View>
      )}
    </View>
  )
}

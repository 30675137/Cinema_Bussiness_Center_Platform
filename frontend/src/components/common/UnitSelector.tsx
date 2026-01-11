/** @spec M001-material-unit-system */
import React from 'react'
import { Select } from 'antd'
import type { UnitCategory } from '@/types/unit'
import { useUnits } from '@/hooks/useUnits'

interface UnitSelectorProps {
  value?: string
  onChange?: (value: string) => void
  category?: UnitCategory
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  category,
  placeholder = '选择单位',
  disabled = false,
  style,
}) => {
  const { data: units, isLoading } = useUnits(category)

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      loading={isLoading}
      style={style}
      showSearch
      filterOption={(input, option) =>
        (option?.label?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
      }
    >
      {units?.data?.map((unit) => (
        <Select.Option key={unit.id} value={unit.id} label={`${unit.name} (${unit.code})`}>
          {unit.name} ({unit.code})
        </Select.Option>
      ))}
    </Select>
  )
}

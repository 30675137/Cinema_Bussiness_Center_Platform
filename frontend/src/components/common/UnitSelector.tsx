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
  /**
   * 返回值类型：'id' 返回单位ID，'code' 返回单位代码
   * @default 'id'
   */
  valueType?: 'id' | 'code'
  allowClear?: boolean
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  category,
  placeholder = '选择单位',
  disabled = false,
  style,
  valueType = 'id',
  allowClear = false,
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
      allowClear={allowClear}
      filterOption={(input, option) =>
        (option?.label?.toString().toLowerCase() ?? '').includes(input.toLowerCase())
      }
    >
      {units?.map((unit) => (
        <Select.Option
          key={unit.id}
          value={valueType === 'code' ? unit.code : unit.id}
          label={`${unit.name} (${unit.code})`}
        >
          {unit.name} ({unit.code})
        </Select.Option>
      ))}
    </Select>
  )
}

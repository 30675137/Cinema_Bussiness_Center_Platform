/** @spec M001-material-unit-system */
import React from 'react'
import { Select } from 'antd'
import { useMaterials } from '@/hooks/useMaterials'

interface MaterialSelectorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
  allowClear?: boolean
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  value,
  onChange,
  placeholder = '选择物料',
  disabled = false,
  style,
  allowClear = false,
}) => {
  const { data: materials, isLoading } = useMaterials()

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
      {materials?.map((material) => (
        <Select.Option
          key={material.id}
          value={material.id}
          label={`${material.name} (${material.code})`}
        >
          {material.name} ({material.code})
        </Select.Option>
      ))}
    </Select>
  )
}

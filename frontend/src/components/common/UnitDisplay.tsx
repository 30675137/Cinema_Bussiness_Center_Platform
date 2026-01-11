/** @spec M001-material-unit-system */
import React from 'react'
import { Tag } from 'antd'
import type { Unit, UnitCategory } from '@/types/unit'

interface UnitDisplayProps {
  unit?: Unit | null
  showCode?: boolean
  showCategory?: boolean
}

const categoryColors: Record<UnitCategory, string> = {
  VOLUME: 'blue',
  WEIGHT: 'green',
  COUNT: 'orange',
}

const categoryLabels: Record<UnitCategory, string> = {
  VOLUME: '体积',
  WEIGHT: '重量',
  COUNT: '计数',
}

export const UnitDisplay: React.FC<UnitDisplayProps> = ({ unit, showCode = true, showCategory = false }) => {
  if (!unit) {
    return <span>-</span>
  }

  return (
    <span>
      {unit.name}
      {showCode && <span style={{ marginLeft: 4, color: '#999' }}>({unit.code})</span>}
      {showCategory && (
        <Tag color={categoryColors[unit.category]} style={{ marginLeft: 8 }}>
          {categoryLabels[unit.category]}
        </Tag>
      )}
    </span>
  )
}

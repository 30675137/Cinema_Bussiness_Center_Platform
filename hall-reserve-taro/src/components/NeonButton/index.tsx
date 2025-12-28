import { View } from '@tarojs/components'
import { PropsWithChildren } from 'react'
import './index.less'

interface NeonButtonProps {
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const NeonButton: React.FC<PropsWithChildren<NeonButtonProps>> = ({
  children,
  onClick,
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <View
      className={`neon-button ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
    >
      {children}
    </View>
  )
}

export default NeonButton

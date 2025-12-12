import React from 'react'
import { Breadcrumb as AntBreadcrumb } from 'antd'

interface BreadcrumbItem {
  title: string
  path?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  style?: React.CSSProperties
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, style }) => {
  const breadcrumbItems = items?.map(item => {
    const itemProps: any = {
      key: item.path || item.title,
      title: item.title,
    }

    if (item.path) {
      itemProps.onClick = () => {
        // 这里可以添加路由导航逻辑
        console.log('Navigate to:', item.path)
        // 使用 history 或 navigate 进行路由跳转
        // navigate(item.path)
      }
    }

    return itemProps
  })

  return (
    <AntBreadcrumb
      items={breadcrumbItems}
      className={className}
      style={style}
    />
  )
}

export default Breadcrumb
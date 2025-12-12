import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'

const { Sider } = Layout
const { Title } = Typography

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/product',
      icon: <AppstoreOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/spu',
          icon: <TagsOutlined />,
          label: 'SPU管理',
        },
        {
          key: '/category',
          icon: <AppstoreOutlined />,
          label: '分类管理',
        },
        {
          key: '/brand',
          icon: <TeamOutlined />,
          label: '品牌管理',
        },
      ],
    },
    {
      key: '/inventory',
      icon: <ShoppingCartOutlined />,
      label: '库存管理',
      children: [
        {
          key: '/inventory/list',
          icon: <ShoppingCartOutlined />,
          label: '库存列表',
        },
        {
          key: '/inventory/trace',
          icon: <BarChartOutlined />,
          label: '库存追溯',
        },
      ],
    },
    {
      key: '/pricing',
      icon: <DollarOutlined />,
      label: '价格管理',
      children: [
        {
          key: '/price/list',
          icon: <DollarOutlined />,
          label: '价格列表',
        },
        {
          key: '/pricing/strategy',
          icon: <SettingOutlined />,
          label: '价格策略',
        },
      ],
    },
    {
      key: '/procurement',
      icon: <ShoppingCartOutlined />,
      label: '采购管理',
      children: [
        {
          key: '/procurement/suppliers',
          icon: <TeamOutlined />,
          label: '供应商管理',
        },
        {
          key: '/procurement/orders',
          icon: <ShoppingCartOutlined />,
          label: '采购订单',
        },
        {
          key: '/procurement/review',
          icon: <BarChartOutlined />,
          label: '采购审批',
        },
      ],
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
      children: [
        {
          key: '/analytics/sales',
          icon: <BarChartOutlined />,
          label: '销售分析',
        },
        {
          key: '/analytics/inventory',
          icon: <BarChartOutlined />,
          label: '库存分析',
        },
        {
          key: '/analytics/performance',
          icon: <BarChartOutlined />,
          label: '业绩分析',
        },
      ],
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const getSelectedKeys = () => {
    const { pathname } = location
    return [pathname]
  }

  const getOpenKeys = () => {
    const { pathname } = location

    if (pathname.startsWith('/product')) return ['product']
    if (pathname.startsWith('/inventory')) return ['inventory']
    if (pathname.startsWith('/pricing')) return ['pricing']
    if (pathname.startsWith('/procurement')) return ['procurement']
    if (pathname.startsWith('/analytics')) return ['analytics']

    return []
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          height: 64,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          {collapsed ? '影院' : '影院商品管理'}
        </Title>
      </div>

      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          background: '#fff',
        }}
      />
    </Sider>
  )
}

export default Sidebar
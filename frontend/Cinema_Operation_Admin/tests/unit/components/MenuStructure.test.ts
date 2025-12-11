import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MenuStructure } from '@/components/layout/Sidebar/MenuStructure';
import { useNavigationStore } from '@/stores/navigationStore';

// Mock Zustand store
vi.mock('@/stores/navigationStore', () => ({
  useNavigationStore: vi.fn()
}));

// Mock menu data
const mockMenuData = [
  {
    id: 'menu-001',
    name: '基础设置与主数据',
    code: 'basic_settings',
    icon: 'SettingOutlined',
    level: 1,
    sortOrder: 10,
    isActive: true,
    isVisible: true,
    functionalArea: 'basic_settings',
    children: [
      {
        id: 'menu-001-1',
        name: '组织/门店/仓库管理',
        code: 'organization',
        level: 2,
        sortOrder: 1,
        isActive: true,
        isVisible: true,
        functionalArea: 'basic_settings'
      },
      {
        id: 'menu-001-2',
        name: '单位 & 换算规则管理',
        code: 'units',
        level: 2,
        sortOrder: 2,
        isActive: true,
        isVisible: true,
        functionalArea: 'basic_settings'
      }
    ]
  },
  {
    id: 'menu-002',
    name: '商品管理 (MDM / PIM)',
    code: 'product_management',
    icon: 'ProductOutlined',
    level: 1,
    sortOrder: 20,
    isActive: true,
    isVisible: true,
    functionalArea: 'product_management',
    children: [
      {
        id: 'menu-002-1',
        name: 'SPU 管理',
        code: 'spu',
        level: 2,
        sortOrder: 1,
        isActive: true,
        isVisible: true,
        functionalArea: 'product_management'
      },
      {
        id: 'menu-002-2',
        name: 'SKU 管理',
        code: 'sku',
        level: 2,
        sortOrder: 2,
        isActive: true,
        isVisible: true,
        functionalArea: 'product_management'
      }
    ]
  }
];

describe('MenuStructure', () => {
  const mockSetMenus = vi.fn();
  const mockSetActiveMenu = vi.fn();
  const mockToggleMenuExpansion = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Zustand store
    (useNavigationStore as any).mockReturnValue({
      menus: mockMenuData,
      activeMenuId: null,
      expandedMenuIds: [],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });
  });

  test('应该渲染正确数量的主要菜单', () => {
    render(<MenuStructure />);

    // 应该渲染2个主要菜单
    const mainMenus = screen.getAllByText(/基础设置与主数据|商品管理/);
    expect(mainMenus).toHaveLength(2);
  });

  test('应该渲染菜单图标', () => {
    render(<MenuStructure />);

    // 检查图标是否渲染
    const settingIcon = screen.getByText('SettingOutlined');
    const productIcon = screen.getByText('ProductOutlined');

    expect(settingIcon).toBeInTheDocument();
    expect(productIcon).toBeInTheDocument();
  });

  test('应该按照sortOrder正确排序菜单', () => {
    render(<MenuStructure />);

    const menuContainer = screen.getByRole('navigation');
    const menuItems = menuContainer.querySelectorAll('.ant-menu-item');

    // 验证第一个菜单是基础设置（sortOrder: 10）
    expect(menuItems[0]).toHaveTextContent('基础设置与主数据');

    // 验证第二个菜单是商品管理（sortOrder: 20）
    expect(menuItems[1]).toHaveTextContent('商品管理');
  });

  test('点击菜单项应该调用toggleMenuExpansion', async () => {
    render(<MenuStructure />);

    const firstMenu = screen.getByText('基础设置与主数据');
    fireEvent.click(firstMenu);

    expect(mockToggleMenuExpansion).toHaveBeenCalledWith('menu-001');
  });

  test('展开的菜单应该显示子菜单', async () => {
    // Mock expanded state
    (useNavigationStore as any).mockReturnValue({
      menus: mockMenuData,
      activeMenuId: null,
      expandedMenuIds: ['menu-001'],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    await waitFor(() => {
      // 验证子菜单可见
      expect(screen.getByText('组织/门店/仓库管理')).toBeInTheDocument();
      expect(screen.getByText('单位 & 换算规则管理')).toBeInTheDocument();
    });
  });

  test('不应该渲染非活跃的菜单', () => {
    const inactiveMenuData = [
      {
        ...mockMenuData[0],
        isActive: false
      },
      mockMenuData[1]
    ];

    (useNavigationStore as any).mockReturnValue({
      menus: inactiveMenuData,
      activeMenuId: null,
      expandedMenuIds: [],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    // 非活跃菜单不应该渲染
    expect(screen.queryByText('基础设置与主数据')).not.toBeInTheDocument();
    // 活跃菜单应该渲染
    expect(screen.getByText('商品管理')).toBeInTheDocument();
  });

  test('不应该渲染不可见的菜单', () => {
    const invisibleMenuData = [
      {
        ...mockMenuData[0],
        isVisible: false
      },
      mockMenuData[1]
    ];

    (useNavigationStore as any).mockReturnValue({
      menus: invisibleMenuData,
      activeMenuId: null,
      expandedMenuIds: [],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    // 不可见菜单不应该渲染
    expect(screen.queryByText('基础设置与主数据')).not.toBeInTheDocument();
    // 可见菜单应该渲染
    expect(screen.getByText('商品管理')).toBeInTheDocument();
  });

  test('应该正确显示菜单的层级结构', () => {
    (useNavigationStore as any).mockReturnValue({
      menus: mockMenuData,
      activeMenuId: null,
      expandedMenuIds: ['menu-001', 'menu-002'],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    // 验证主菜单存在
    expect(screen.getByText('基础设置与主数据')).toBeInTheDocument();
    expect(screen.getByText('商品管理')).toBeInTheDocument();

    // 验证子菜单存在
    expect(screen.getByText('组织/门店/仓库管理')).toBeInTheDocument();
    expect(screen.getByText('单位 & 换算规则管理')).toBeInTheDocument();
    expect(screen.getByText('SPU 管理')).toBeInTheDocument();
    expect(screen.getByText('SKU 管理')).toBeInTheDocument();
  });

  test('应该处理空菜单数据', () => {
    (useNavigationStore as any).mockReturnValue({
      menus: [],
      activeMenuId: null,
      expandedMenuIds: [],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    // 应该显示空状态或加载状态
    const emptyState = screen.queryByText('暂无菜单数据');
    // 根据实际组件实现调整
  });

  test('应该正确设置active状态', () => {
    (useNavigationStore as any).mockReturnValue({
      menus: mockMenuData,
      activeMenuId: 'menu-001',
      expandedMenuIds: [],
      setMenus: mockSetMenus,
      setActiveMenu: mockSetActiveMenu,
      toggleMenuExpansion: mockToggleMenuExpansion
    });

    render(<MenuStructure />);

    const activeMenu = screen.getByText('基础设置与主数据');
    expect(activeMenu.closest('.ant-menu-item-active')).toBeInTheDocument();
  });
});
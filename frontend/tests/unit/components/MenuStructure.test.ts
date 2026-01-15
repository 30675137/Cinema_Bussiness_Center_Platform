/**
 * 导航菜单结构单元测试
 * 验证菜单数据结构和组件渲染逻辑
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the router
vi.mock('@/router', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock the stores
vi.mock('@/stores/navigationStore', () => ({
  useNavigationStore: () => ({
    menus: [],
    activeMenuId: null,
    expandedMenuIds: [],
    setMenus: vi.fn(),
    setActiveMenu: vi.fn(),
    toggleMenuExpansion: vi.fn(),
    loading: false,
    error: null,
  }),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: null,
    loading: false,
    error: null,
  }),
}));

// Import components after mocking
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import type { MenuItem } from '@/types/navigation';

describe('MenuStructure', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const mockMenus: MenuItem[] = [
    {
      id: 'basic-settings',
      name: '基础设置与主数据',
      code: 'basic_settings',
      level: 1,
      sortOrder: 1,
      isActive: true,
      isVisible: true,
      functionalArea: 'basic_settings',
      icon: 'SettingOutlined',
      children: [
        {
          id: 'organization-management',
          parentId: 'basic-settings',
          name: '组织/门店/仓库管理',
          code: 'organization_management',
          level: 2,
          sortOrder: 1,
          isActive: true,
          isVisible: true,
          functionalArea: 'basic_settings',
        },
      ],
    },
    {
      id: 'product-management',
      name: '商品管理 (MDM/PIM)',
      code: 'product_management',
      level: 1,
      sortOrder: 2,
      isActive: true,
      isVisible: true,
      functionalArea: 'product_management',
      icon: 'ShopOutlined',
      children: [
        {
          id: 'spu-management',
          parentId: 'product-management',
          name: 'SPU 管理',
          code: 'spu_management',
          level: 2,
          sortOrder: 1,
          isActive: true,
          isVisible: true,
          functionalArea: 'product_management',
        },
      ],
    },
  ];

  describe('菜单数据结构验证', () => {
    it('应该包含正确数量的主菜单', () => {
      expect(mockMenus.filter(menu => menu.level === 1)).toHaveLength(2);
    });

    it('应该包含正确数量的子菜单', () => {
      expect(mockMenus.filter(menu => menu.level === 2)).toHaveLength(2);
    });

    it('菜单项应该有必要的属性', () => {
      mockMenus.forEach(menu => {
        expect(menu).toHaveProperty('id');
        expect(menu).toHaveProperty('name');
        expect(menu).toHaveProperty('code');
        expect(menu).toHaveProperty('level');
        expect(menu).toHaveProperty('sortOrder');
        expect(menu).toHaveProperty('isActive');
        expect(menu).toHaveProperty('isVisible');
        expect(menu).toHaveProperty('functionalArea');
      });
    });

    it('子菜单应该有正确的父级关系', () => {
      const basicSettingsMenu = mockMenus.find(menu => menu.id === 'basic-settings');
      const organizationSubmenu = mockMenus.find(menu => menu.id === 'organization-management');

      expect(organizationSubmenu?.parentId).toBe('basic-settings');
      expect(basicSettingsMenu?.children).toContain(organizationSubmenu);
    });

    it('功能区域应该正确分类', () => {
      const basicSettingsMenu = mockMenus.find(menu => menu.id === 'basic-settings');
      const productMenu = mockMenus.find(menu => menu.id === 'product-management');

      expect(basicSettingsMenu?.functionalArea).toBe('basic_settings');
      expect(productMenu?.functionalArea).toBe('product_management');
    });

    it('排序顺序应该正确', () => {
      const mainMenus = mockMenus.filter(menu => menu.level === 1);
      const sortedMenus = [...mainMenus].sort((a, b) => a.sortOrder - b.sortOrder);

      expect(mainMenus).toEqual(sortedMenus);
    });
  });

  describe('菜单过滤功能', () => {
    it('应该过滤掉非活跃的菜单', () => {
      const activeMenus = mockMenus.filter(menu => menu.isActive);
      expect(activeMenus).toHaveLength(4);
    });

    it('应该过滤掉不可见的菜单', () => {
      const visibleMenus = mockMenus.filter(menu => menu.isVisible);
      expect(visibleMenus).toHaveLength(4);
    });

    it('应该只返回一级菜单', () => {
      const mainMenus = mockMenus.filter(menu => menu.level === 1);
      expect(mainMenus).toHaveLength(2);
    });

    it('应该正确构建菜单层级结构', () => {
      const menuHierarchy = mockMenus.filter(menu => menu.level === 1);
      const basicSettingsMenu = menuHierarchy.find(menu => menu.id === 'basic-settings');

      expect(basicSettingsMenu?.children).toHaveLength(1);
      expect(basicSettingsMenu?.children?.[0].id).toBe('organization-management');
    });
  });

  describe('菜单图标和样式', () => {
    it('主要菜单项应该有图标', () => {
      const mainMenus = mockMenus.filter(menu => menu.level === 1);
      const menusWithIcons = mainMenus.filter(menu => menu.icon);

      expect(menusWithIcons).toHaveLength(2);
    });

    it('图标应该是有效的字符串', () => {
      const mainMenus = mockMenus.filter(menu => menu.level === 1);

      mainMenus.forEach(menu => {
        if (menu.icon) {
          expect(typeof menu.icon).toBe('string');
          expect(menu.icon.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('组件渲染测试', () => {
    it('应该渲染导航菜单组件', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );
    });

    it('应该显示主要菜单项', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      // 检查主要菜单项是否存在
      expect(screen.getByText('基础设置与主数据')).toBeInTheDocument();
      expect(screen.getByText('商品管理 (MDM/PIM)')).toBeInTheDocument();
    });

    it('应该正确显示菜单图标', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      // 检查图标是否存在
      expect(screen.getByTestId('menu-icon-basic-settings')).toBeInTheDocument();
      expect(screen.getByTestId('menu-icon-product-management')).toBeInTheDocument();
    });

    it('应该支持菜单展开/收起', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const basicSettingsMenu = screen.getByText('基础设置与主数据');

      // 初始状态应该没有展开的子菜单
      expect(screen.queryByText('组织/门店/仓库管理')).not.toBeInTheDocument();

      // 点击展开菜单
      fireEvent.click(basicSettingsMenu);

      // 展开后应该显示子菜单
      expect(screen.getByText('组织/门店/仓库管理')).toBeInTheDocument();
    });

    it('应该正确处理菜单点击事件', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const basicSettingsMenu = screen.getByText('基础设置与主数据');

      // 点击菜单项
      fireEvent.click(basicSettingsMenu);

      // 验证点击事件处理
      expect(basicSettingsMenu).toBeInTheDocument();
    });

    it('应该在高亮显示活动菜单', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const basicSettingsMenu = screen.getByText('基础设置与主数据');

      // 点击设置活动菜单
      fireEvent.click(basicSettingsMenu);

      // 验证活动状态
      expect(basicSettingsMenu).toHaveClass('active');
    });

    it('应该处理加载状态', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu loading={true} />
        </QueryClientProvider>
      );

      // 检查加载状态
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('应该处理错误状态', async () => {
      const errorMessage = '菜单加载失败';

      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu error={errorMessage} />
        </QueryClientProvider>
      );

      // 检查错误状态
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('菜单可访问性', () => {
    it('应该有正确的ARIA角色', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label');
      });
    });

    it('应该支持键盘导航', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const firstMenuItem = screen.getAllByRole('menuitem')[0];
      expect(firstMenuItem).toHaveAttribute('tabIndex', '0');
    });

    it('应该有适当的展开/收起状态指示', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <NavigationMenu />
        </QueryClientProvider>
      );

      const expandableMenu = screen.getByText('基础设置与主数据');

      // 初始状态应该是收起状态
      expect(expandableMenu).toHaveAttribute('aria-expanded', 'false');

      // 展开后应该是展开状态
      fireEvent.click(expandableMenu);
      expect(expandableMenu).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
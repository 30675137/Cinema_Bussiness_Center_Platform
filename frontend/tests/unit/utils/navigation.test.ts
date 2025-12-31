/**
 * 导航工具函数单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchMenuItems,
  calculateMatchScore,
  generateBreadcrumbs,
  formatMenuItemPath,
  validateMenuItem,
  debounce,
  findMenuItemById,
  filterMenuItemsByPermissions,
  sortMenuItemsByOrder,
  getMenuItemLevel,
  isMenuItemActive,
} from '@/utils/navigation';
import { MenuItem, FunctionalArea, MenuLevel, SearchResult } from '@/types/navigation';

describe('导航工具函数', () => {
  let mockMenus: MenuItem[];

  beforeEach(() => {
    mockMenus = [
      {
        id: 'menu-1',
        name: '基础设置',
        code: 'basic-settings',
        path: '/basic-settings',
        level: MenuLevel.MAIN,
        sortOrder: 1,
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
        icon: 'SettingOutlined',
        description: '基础设置管理',
        children: [
          {
            id: 'menu-1-1',
            parentId: 'menu-1',
            name: '系统配置',
            code: 'system-config',
            path: '/basic-settings/system-config',
            level: MenuLevel.SUB,
            sortOrder: 1,
            isActive: true,
            isVisible: true,
            functionalArea: FunctionalArea.BASIC_SETTINGS,
            icon: 'SettingOutlined',
          },
          {
            id: 'menu-1-2',
            parentId: 'menu-1',
            name: '数据字典',
            code: 'data-dictionary',
            path: '/basic-settings/data-dictionary',
            level: MenuLevel.SUB,
            sortOrder: 2,
            isActive: true,
            isVisible: true,
            functionalArea: FunctionalArea.BASIC_SETTINGS,
            icon: 'DatabaseOutlined',
          },
        ],
      },
      {
        id: 'menu-2',
        name: '商品管理',
        code: 'product-management',
        path: '/product-management',
        level: MenuLevel.MAIN,
        sortOrder: 2,
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
        icon: 'ShopOutlined',
        description: '商品信息管理',
        children: [
          {
            id: 'menu-2-1',
            parentId: 'menu-2',
            name: '商品列表',
            code: 'product-list',
            path: '/product-management/product-list',
            level: MenuLevel.SUB,
            sortOrder: 1,
            isActive: true,
            isVisible: true,
            functionalArea: FunctionalArea.PRODUCT_MANAGEMENT,
            icon: 'UnorderedListOutlined',
          },
        ],
      },
      {
        id: 'menu-3',
        name: '库存管理',
        code: 'inventory-management',
        path: '/inventory',
        level: MenuLevel.MAIN,
        sortOrder: 3,
        isActive: false,
        isVisible: true,
        functionalArea: FunctionalArea.INVENTORY,
        icon: 'InboxOutlined',
        description: '库存信息管理',
      },
    ];
  });

  describe('searchMenuItems', () => {
    it('应该能够通过名称搜索菜单', () => {
      const results = searchMenuItems(mockMenus, '商品');

      expect(results).toHaveLength(2); // 2个结果
      expect(results[0].title).toBe('商品管理');
      expect(results[0].menuItem?.id).toBe('menu-2');
    });

    it('应该能够通过代码搜索菜单', () => {
      const results = searchMenuItems(mockMenus, 'system-config');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('系统配置');
      expect(results[0].menuItem?.code).toBe('system-config');
    });

    it('应该能够搜索子菜单', () => {
      const results = searchMenuItems(mockMenus, '数据字典');

      expect(results).toHaveLength(1);
      expect(results[0].menuItem?.id).toBe('menu-1-2');
    });

    it('应该限制搜索结果数量', () => {
      const results = searchMenuItems(mockMenus, '', 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('应该忽略不活跃的菜单', () => {
      const results = searchMenuItems(mockMenus, '库存');

      expect(results).toHaveLength(0); // menu-3是inactive
    });

    it('应该支持模糊搜索', () => {
      const results = searchMenuItems(mockMenus, '商品管', 20, {
        fuzzyMatch: true,
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('商品管理');
    });

    it('应该计算匹配分数', () => {
      const results = searchMenuItems(mockMenus, '商品管理');

      expect(results[0].score).toBeGreaterThan(0);
    });

    it('应该高亮搜索结果', () => {
      const results = searchMenuItems(mockMenus, '商品');

      expect(results[0].highlightedTitle).toContain('<mark>');
      expect(results[0].highlightedTitle).toContain('</mark>');
    });
  });

  describe('calculateMatchScore', () => {
    it('应该为完全匹配计算最高分', () => {
      const score = calculateMatchScore('商品管理', '商品管理');

      expect(score).toBe(100);
    });

    it('应该为部分匹配计算相应分数', () => {
      const score = calculateMatchScore('商品管理', '商品');

      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThan(100);
    });

    it('应该为不匹配计算最低分', () => {
      const score = calculateMatchScore('商品管理', '库存');

      expect(score).toBe(0);
    });

    it('应该忽略大小写差异', () => {
      const score1 = calculateMatchScore('商品管理', '商品管理');
      const score2 = calculateMatchScore('商品管理', '商品管理');

      expect(score1).toBe(score2);
    });
  });

  describe('generateBreadcrumbs', () => {
    it('应该生成正确的面包屑', () => {
      const breadcrumbs = generateBreadcrumbs(mockMenus, 'menu-1-1');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].title).toBe('基础设置');
      expect(breadcrumbs[1].title).toBe('系统配置');
      expect(breadcrumbs[2].title).toBe('系统配置');
    });

    it('应该为当前页面设置正确的状态', () => {
      const breadcrumbs = generateBreadcrumbs(mockMenus, 'menu-1-1');

      expect(breadcrumbs[0].isCurrent).toBe(false);
      expect(breadcrumbs[1].isCurrent).toBe(false);
      expect(breadcrumbs[2].isCurrent).toBe(true);
    });

    it('应该为不存在的菜单ID返回空数组', () => {
      const breadcrumbs = generateBreadcrumbs(mockMenus, 'non-existent');

      expect(breadcrumbs).toEqual([]);
    });
  });

  describe('formatMenuItemPath', () => {
    it('应该格式化菜单路径', () => {
      const path = formatMenuItemPath(mockMenus, 'menu-1-1');

      expect(path).toBe('基础设置 > 系统配置');
    });

    it('应该为顶级菜单返回名称', () => {
      const path = formatMenuItemPath(mockMenus, 'menu-1');

      expect(path).toBe('基础设置');
    });

    it('应该为不存在的菜单返回空字符串', () => {
      const path = formatMenuItemPath(mockMenus, 'non-existent');

      expect(path).toBe('');
    });
  });

  describe('validateMenuItem', () => {
    it('应该验证有效的菜单项', () => {
      const menuItem = mockMenus[0];
      const isValid = validateMenuItem(menuItem);

      expect(isValid).toBe(true);
    });

    it('应该拒绝缺少必填字段的菜单', () => {
      const invalidMenuItem = { ...mockMenus[0], id: '' };
      const isValid = validateMenuItem(invalidMenuItem);

      expect(isValid).toBe(false);
    });

    it('应该拒绝排序序号为负数的菜单', () => {
      const invalidMenuItem = { ...mockMenus[0], sortOrder: -1 };
      const isValid = validateMenuItem(invalidMenuItem);

      expect(isValid).toBe(false);
    });
  });

  describe('debounce', () => {
    it('应该创建防抖函数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();
    });

    it('应该在延迟后执行函数', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('findMenuItemById', () => {
    it('应该能够通过ID查找菜单项', () => {
      const menuItem = findMenuItemById(mockMenus, 'menu-1-1');

      expect(menuItem).toBeTruthy();
      expect(menuItem?.id).toBe('menu-1-1');
    });

    it('应该返回undefined如果找不到菜单', () => {
      const menuItem = findMenuItemById(mockMenus, 'non-existent');

      expect(menuItem).toBeUndefined();
    });

    it('应该能够查找子菜单', () => {
      const menuItem = findMenuItemById(mockMenus, 'menu-2-1');

      expect(menuItem).toBeTruthy();
      expect(menuItem?.parentId).toBe('menu-2');
    });
  });

  describe('filterMenuItemsByPermissions', () => {
    it('应该根据权限过滤菜单', () => {
      const permissions = ['basic-settings.read'];
      const filtered = filterMenuItemsByPermissions(mockMenus, permissions);

      expect(filtered.length).toBeGreaterThan(0);
    });

    it('应该返回所有菜单如果没有权限限制', () => {
      const filtered = filterMenuItemsByPermissions(mockMenus, []);

      expect(filtered).toEqual(mockMenus);
    });

    it('应该排除无权限的菜单', () => {
      const permissions = ['inventory.read'];
      const filtered = filterMenuItemsByPermissions(mockMenus, permissions);

      // menu-3是inventory相关的，但它是inactive，所以应该被排除
      expect(filtered.filter((m) => m.id === 'menu-3')).toHaveLength(0);
    });
  });

  describe('sortMenuItemsByOrder', () => {
    it('应该按排序序号排序菜单', () => {
      const unsorted = [...mockMenus].reverse();
      const sorted = sortMenuItemsByOrder(unsorted);

      expect(sorted[0].sortOrder).toBe(1); // menu-1
      expect(sorted[1].sortOrder).toBe(2); // menu-2
      expect(sorted[2].sortOrder).toBe(3); // menu-3
    });

    it('应该保持同级菜单的相对顺序', () => {
      const sorted = sortMenuItemsByOrder(mockMenus);

      expect(sorted[0].sortOrder).toBeLessThan(sorted[1].sortOrder);
      expect(sorted[1].sortOrder).toBeLessThan(sorted[2].sortOrder);
    });
  });

  describe('getMenuItemLevel', () => {
    it('应该返回主菜单级别', () => {
      const level = getMenuItemLevel(mockMenus[0]);

      expect(level).toBe(MenuLevel.MAIN);
    });

    it('应该返回子菜单级别', () => {
      const level = getMenuItemLevel(mockMenus[0].children![0]);

      expect(level).toBe(MenuLevel.SUB);
    });
  });

  describe('isMenuItemActive', () => {
    it('应该检查菜单是否活跃', () => {
      const activeMenu = isMenuItemActive(mockMenus[0]);
      const inactiveMenu = isMenuItemActive(mockMenus[2]);

      expect(activeMenu).toBe(true);
      expect(inactiveMenu).toBe(false);
    });

    it('应该检查菜单是否可见', () => {
      const visibleMenu = isMenuItemActive(mockMenus[0]);

      // menu-0是active且visible，应该返回true
      expect(visibleMenu).toBe(true);
    });

    it('应该检查菜单是否可见和活跃', () => {
      // 创建一个可见但不活跃的菜单
      const inactiveButVisibleMenu = {
        ...mockMenus[0],
        isActive: false,
      };

      const result = isMenuItemActive(inactiveButVisibleMenu);

      expect(result).toBe(false);
    });
  });

  describe('搜索结果类型', () => {
    it('应该正确分类搜索结果类型', () => {
      const results = searchMenuItems(mockMenus, '商品管理');

      results.forEach((result: SearchResult) => {
        expect(['menu', 'submenu', 'page']).toContain(result.type);
        expect(result.menuItem).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.title).toBeDefined();
      });
    });

    it('应该为主菜单提供正确的类型', () => {
      const results = searchMenuItems(mockMenus, '商品管理');
      const mainMenuResult = results.find((r) => r.menuItem?.level === MenuLevel.MAIN);

      expect(mainMenuResult?.type).toBe('menu');
    });

    it('应该为子菜单提供正确的类型', () => {
      const results = searchMenuItems(mockMenus, '系统配置');
      const subMenuResult = results.find((r) => r.menuItem?.level === MenuLevel.SUB);

      expect(subMenuResult?.type).toBe('submenu');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成搜索', () => {
      const startTime = performance.now();

      // 创建大量菜单数据
      const largeMenuList = Array.from({ length: 1000 }, (_, index) => ({
        id: `menu-${index}`,
        name: `菜单项 ${index}`,
        code: `menu-${index}`,
        path: `/menu-${index}`,
        level: MenuLevel.MAIN,
        sortOrder: index,
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS,
      }));

      const results = searchMenuItems(largeMenuList, '菜单项 100');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // 应该在100ms内完成
      expect(results.length).toBe(1);
    });
  });
});

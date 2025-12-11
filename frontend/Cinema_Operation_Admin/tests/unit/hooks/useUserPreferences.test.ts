/**
 * useUserPreferences Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { UserPreference } from '@/types/navigation';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock document.documentElement
Object.defineProperty(window, 'document', {
  value: {
    documentElement: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      style: {
        setProperty: vi.fn(),
      },
    },
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基础功能', () => {
    it('应该返回默认用户偏好设置', () => {
      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.preferences).toBeTruthy();
      expect(result.current.preferences?.userId).toBe('user-001');
      expect(result.current.preferences?.sidebarExpanded).toBe(true);
      expect(result.current.preferences?.theme.mode).toBe('light');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('应该从localStorage加载保存的用户偏好', () => {
      const mockPreferences: UserPreference = {
        userId: 'user-001',
        sidebarExpanded: false,
        favoriteMenuIds: ['menu-1', 'menu-2'],
        recentMenuIds: ['menu-3'],
        searchHistory: ['搜索1', '搜索2'],
        theme: {
          mode: 'dark',
          primaryColor: '#ff4d4f'
        },
        navigation: {
          showBreadcrumb: false,
          enableSearch: true,
          recentItemsLimit: 5,
          searchHistoryLimit: 10
        },
        ui: {
          compactMode: true,
          fixedSidebar: false,
          enableAnimation: false
        },
        lastUpdated: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreferences));

      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.preferences?.sidebarExpanded).toBe(false);
      expect(result.current.preferences?.theme.mode).toBe('dark');
      expect(result.current.preferences?.favoriteMenuIds).toEqual(['menu-1', 'menu-2']);
    });

    it('应该处理无效的localStorage数据', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.preferences).toBeTruthy();
      expect(result.current.preferences?.sidebarExpanded).toBe(true); // 使用默认值
    });

    it('应该处理空字符串localStorage数据', () => {
      localStorageMock.getItem.mockReturnValue('');

      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.preferences).toBeTruthy();
      expect(result.current.preferences?.userId).toBe('user-001');
    });
  });

  describe('偏好设置操作', () => {
    it('应该能够更新用户偏好', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.updatePreferences({
          sidebarExpanded: false,
          theme: {
            mode: 'dark',
            primaryColor: '#ff4d4f'
          }
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cinema-navigation-preferences',
        expect.stringContaining('"sidebarExpanded":false')
      );
    });

    it('应该能够切换侧边栏状态', () => {
      const { result } = renderHook(() => useUserPreferences());

      const initialState = result.current.sidebarExpanded;

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarExpanded).toBe(!initialState);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('应该能够切换主题', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light');
    });

    it('应该能够设置自动主题模式', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme).toBe('auto');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('收藏管理', () => {
    it('应该能够添加菜单到收藏', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addToFavorites('menu-1');
      });

      expect(result.current.favoriteMenuIds).toContain('menu-1');
      expect(result.current.isFavorite('menu-1')).toBe(true);
    });

    it('应该能够从收藏中移除菜单', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 先添加到收藏
      act(() => {
        result.current.addToFavorites('menu-1');
        result.current.addToFavorites('menu-2');
      });

      expect(result.current.favoriteMenuIds).toEqual(['menu-1', 'menu-2']);

      // 然后移除一个
      act(() => {
        result.current.removeFromFavorites('menu-1');
      });

      expect(result.current.favoriteMenuIds).toEqual(['menu-2']);
      expect(result.current.isFavorite('menu-1')).toBe(false);
    });

    it('不应该重复添加已收藏的菜单', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addToFavorites('menu-1');
        result.current.addToFavorites('menu-1'); // 重复添加
      });

      expect(result.current.favoriteMenuIds).toEqual(['menu-1']);
    });
  });

  describe('搜索历史管理', () => {
    it('应该能够添加搜索历史', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addToSearchHistory('搜索测试');
      });

      expect(result.current.searchHistory).toContain('搜索测试');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('不应该添加空的搜索历史', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addToSearchHistory('');
        result.current.addToSearchHistory('   '); // 只有空格
      });

      expect(result.current.searchHistory).toEqual([]);
    });

    it('应该能够清空搜索历史', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 先添加一些搜索历史
      act(() => {
        result.current.addToSearchHistory('搜索1');
        result.current.addToSearchHistory('搜索2');
      });

      expect(result.current.searchHistory).toHaveLength(2);

      // 清空历史
      act(() => {
        result.current.clearSearchHistory();
      });

      expect(result.current.searchHistory).toEqual([]);
    });

    it('应该限制搜索历史数量', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 添加超过限制的搜索历史
      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current.addToSearchHistory(`搜索${i}`);
        }
      });

      expect(result.current.searchHistory.length).toBeLessThanOrEqual(20);
    });
  });

  describe('菜单展开管理', () => {
    it('应该能够展开菜单', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.expandMenu('menu-group-1');
      });

      expect(result.current.expandedMenuIds).toContain('menu-group-1');
      expect(result.current.isExpanded('menu-group-1')).toBe(true);
    });

    it('应该能够收起菜单', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 先展开
      act(() => {
        result.current.expandMenu('menu-group-1');
        result.current.expandMenu('menu-group-2');
      });

      // 然后收起一个
      act(() => {
        result.current.collapseMenu('menu-group-1');
      });

      expect(result.current.expandedMenuIds).toEqual(['menu-group-2']);
    });
  });

  describe('最近访问管理', () => {
    it('应该能够添加到最近访问', () => {
      const { result } = renderHook(() => useUserPreferences());

      act(() => {
        result.current.addToRecent('menu-1');
        result.current.addToRecent('menu-2');
        result.current.addToRecent('menu-1'); // 重复访问
      });

      expect(result.current.recentMenuIds).toEqual(['menu-1', 'menu-2']);
    });

    it('应该限制最近访问数量', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 添加超过限制的最近访问
      act(() => {
        for (let i = 1; i <= 15; i++) {
          result.current.addToRecent(`menu-${i}`);
        }
      });

      expect(result.current.recentMenuIds.length).toBeLessThanOrEqual(10);
    });
  });

  describe('导入导出功能', () => {
    it('应该能够导出用户偏好设置', () => {
      const { result } = renderHook(() => useUserPreferences());

      const exported = result.current.exportPreferences();

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.userId).toBe('user-001');
    });

    it('应该能够导入用户偏好设置', () => {
      const { result } = renderHook(() => useUserPreferences());

      const mockPreferences = {
        userId: 'test-user',
        sidebarExpanded: false,
        theme: {
          mode: 'dark',
          primaryColor: '#ff4d4f'
        },
        navigation: {
          showBreadcrumb: false,
          enableSearch: true,
          recentItemsLimit: 5,
          searchHistoryLimit: 10
        },
        ui: {
          compactMode: true,
          fixedSidebar: false,
          enableAnimation: false
        }
      };

      const success = result.current.importPreferences(JSON.stringify(mockPreferences));

      expect(success).toBe(true);
      // 验证导入了偏好设置但保留了原用户ID
      expect(result.current.preferences?.sidebarExpanded).toBe(false);
      expect(result.current.preferences?.theme.mode).toBe('dark');
      expect(result.current.preferences?.userId).toBe('user-001'); // 保留原用户ID
    });

    it('应该拒绝无效的导入数据', () => {
      const { result } = renderHook(() => useUserPreferences());

      const success1 = result.current.importPreferences('invalid json');
      const success2 = result.current.importPreferences('{}'); // 缺少必要字段

      expect(success1).toBe(false);
      expect(success2).toBe(false);
    });
  });

  describe('重置功能', () => {
    it('应该能够重置为默认设置', () => {
      const { result } = renderHook(() => useUserPreferences());

      // 先修改一些设置
      act(() => {
        result.current.updatePreferences({
          sidebarExpanded: false,
          theme: {
            mode: 'dark',
            primaryColor: '#ff4d4f'
          }
        });
      });

      expect(result.current.sidebarExpanded).toBe(false);

      // 重置
      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.sidebarExpanded).toBe(true);
      expect(result.current.theme).toBe('light');
      expect(result.current.preferences?.userId).toBe('user-001'); // 保留用户ID
    });
  });

  describe('响应式值', () => {
    it('应该提供响应式的偏好设置值', () => {
      const { result } = renderHook(() => useUserPreferences());

      expect(result.current.sidebarExpanded).toBe(true);
      expect(result.current.theme).toBe('light');
      expect(result.current.primaryColor).toBe('#1890ff');
      expect(result.current.compactMode).toBe(false);
      expect(result.current.fixedSidebar).toBe(true);
      expect(result.current.enableAnimation).toBe(true);
      expect(result.current.showBreadcrumb).toBe(true);
      expect(result.current.enableSearch).toBe(true);
      expect(result.current.recentItemsLimit).toBe(10);
      expect(result.current.searchHistoryLimit).toBe(20);
    });
  });
});
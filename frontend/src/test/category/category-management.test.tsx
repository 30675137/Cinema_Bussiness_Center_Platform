/**
 * 分类和品牌管理功能测试
 * 测试分类管理和品牌管理的核心功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryManagementPage from '../../pages/mdm-pim/category/CategoryManagement';
import BrandManagementPage from '../../pages/BrandManagement';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';

// Mock services
vi.mock('../../services/categoryService');
vi.mock('../../services/brandService');

describe('分类和品牌管理功能测试', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Mock 分类数据
    const mockCategories = [
      {
        id: 'cat_001',
        name: '食品饮料',
        code: 'FOOD_BEVERAGE',
        level: 1,
        status: 'active',
        description: '各类食品和饮料商品',
        sortOrder: 1,
        parentId: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Mock 品牌数据
    const mockBrands = [
      {
        id: 'brand_001',
        name: '可口可乐',
        code: 'COKE',
        status: 'active',
        logo: '/images/brands/coke-logo.png',
        description: '全球知名的饮料品牌',
        website: 'https://www.coca-cola.com',
        contactPerson: '张经理',
        contactPhone: '13800138001',
        contactEmail: 'coke@example.com',
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Mock service responses
    (categoryService.getCategoryList as any).mockResolvedValue({
      success: true,
      data: {
        list: mockCategories,
        total: mockCategories.length,
        page: 1,
        pageSize: 1000,
        totalPages: 1,
      },
      message: '获取成功',
      code: 200,
      timestamp: Date.now(),
    });
    (brandService.getBrandList as any).mockResolvedValue({
      success: true,
      data: {
        list: mockBrands,
        total: mockBrands.length,
        page: 1,
        pageSize: 1000,
        totalPages: 1,
      },
      message: '获取成功',
      code: 200,
      timestamp: Date.now(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderCategoryManagementPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CategoryManagementPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  const renderBrandManagementPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <BrandManagementPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('分类管理功能测试', () => {
    it('应该正确显示分类管理页面标题', async () => {
      renderCategoryManagementPage();

      await waitFor(() => {
        expect(screen.getByText('分类管理')).toBeInTheDocument();
      });
    });

    it('应该正确加载和显示分类统计数据', async () => {
      renderCategoryManagementPage();

      await waitFor(() => {
        expect(screen.getByText('总分类数')).toBeInTheDocument();
      });
    });
  });

  describe('品牌管理功能测试', () => {
    it('应该正确显示品牌管理页面标题', async () => {
      renderBrandManagementPage();

      await waitFor(() => {
        expect(screen.getByText('品牌管理')).toBeInTheDocument();
      });
    });

    it('应该正确加载和显示品牌统计数据', async () => {
      renderBrandManagementPage();

      await waitFor(() => {
        expect(screen.getByText('总品牌数')).toBeInTheDocument();
      });
    });
  });

  describe('API服务集成测试', () => {
    it('应该正确调用分类服务API', async () => {
      renderCategoryManagementPage();

      await waitFor(() => {
        expect(categoryService.getCategoryList).toHaveBeenCalled();
      });
    });

    it('应该正确调用品牌服务API', async () => {
      renderBrandManagementPage();

      await waitFor(() => {
        expect(brandService.getBrandList).toHaveBeenCalled();
      });
    });
  });
});

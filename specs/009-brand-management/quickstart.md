# Quick Start Guide: 品牌管理功能开发

**Date**: 2025-12-14
**Target**: 开发团队成员

## 开发环境准备

### 前置条件
- Node.js 18+
- npm 9+
- Git
- VS Code（推荐）

### 技术栈确认
```json
{
  "frontend": {
    "framework": "React 19.2.0",
    "language": "TypeScript 5.9.3",
    "ui": "Ant Design 6.1.0",
    "state": "Zustand 5.0.9 + TanStack Query 5.90.12",
    "testing": "Vitest + Playwright",
    "mocking": "MSW 2.12.4"
  }
}
```

## 项目结构设置

### 1. 创建功能模块目录结构
```bash
mkdir -p frontend/src/features/brand-management/{components,hooks,services,types,utils}
mkdir -p frontend/src/features/brand-management/components/{organisms,molecules,atoms}
```

### 2. 核心文件创建
```bash
# 类型定义
touch frontend/src/features/brand-management/types/brand.types.ts

# 服务层
touch frontend/src/features/brand-management/services/brandApi.ts
touch frontend/src/features/brand-management/services/brandService.ts

# Store
touch frontend/src/features/brand-management/stores/brandStore.ts

# Hooks
touch frontend/src/features/brand-management/hooks/useBrandList.ts
touch frontend/src/features/brand-management/hooks/useBrandActions.ts

# 组件
touch frontend/src/features/brand-management/components/organisms/BrandList.tsx
touch frontend/src/features/brand-management/components/organisms/BrandDrawer.tsx
```

## 开发步骤

### Phase 1: 类型定义和服务层

#### 1.1 创建类型定义
```typescript
// frontend/src/features/brand-management/types/brand.types.ts
export interface Brand {
  id: string;
  brandCode: string;
  name: string;
  englishName?: string;
  brandType: BrandType;
  primaryCategories: string[];
  company?: string;
  brandLevel?: string;
  tags: string[];
  description?: string;
  logoUrl?: string;
  status: BrandStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export enum BrandType {
  OWN = 'own',
  AGENCY = 'agency',
  JOINT = 'joint',
  OTHER = 'other'
}

export enum BrandStatus {
  DRAFT = 'draft',
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}
```

#### 1.2 创建API服务
```typescript
// frontend/src/features/brand-management/services/brandApi.ts
import { Brand, BrandQueryParams, CreateBrandRequest, UpdateBrandRequest } from '../types/brand.types';

export const brandApi = {
  getBrands: (params?: BrandQueryParams) => `/api/v1/brands${new URLSearchParams(params as any).toString()}`,
  getBrand: (id: string) => `/api/v1/brands/${id}`,
  createBrand: () => `/api/v1/brands`,
  updateBrand: (id: string) => `/api/v1/brands/${id}`,
  updateBrandStatus: (id: string) => `/api/v1/brands/${id}/status`,
  uploadLogo: (id: string) => `/api/v1/brands/${id}/logo`,
  getUsageStats: (id: string) => `/api/v1/brands/${id}/usage-stats`,
};
```

#### 1.3 设置MSW Mocks
```typescript
// frontend/src/mocks/handlers/brandHandlers.ts
import { rest } from 'msw';
import { Brand, BrandType, BrandStatus } from '../../features/brand-management/types/brand.types';

const mockBrands: Brand[] = [
  {
    id: '1',
    brandCode: 'BRAND001',
    name: '可口可乐',
    englishName: 'Coca-Cola',
    brandType: BrandType.AGENCY,
    primaryCategories: ['饮料'],
    status: BrandStatus.ENABLED,
    // ... other fields
  }
];

export const brandHandlers = [
  rest.get('/api/v1/brands', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: mockBrands,
        pagination: { current: 1, pageSize: 20, total: mockBrands.length },
      })
    );
  }),
  // ... other handlers
];
```

### Phase 2: 状态管理

#### 2.1 创建Zustand Store
```typescript
// frontend/src/features/brand-management/stores/brandStore.ts
import { create } from 'zustand';
import { Brand, BrandFilters, BrandQueryParams } from '../types/brand.types';

interface BrandStore {
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;
  filters: BrandFilters;

  // Actions
  setBrands: (brands: Brand[]) => void;
  setCurrentBrand: (brand: Brand | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<BrandFilters>) => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brands: [],
  currentBrand: null,
  loading: false,
  error: null,
  filters: {},

  setBrands: (brands) => set({ brands }),
  setCurrentBrand: (currentBrand) => set({ currentBrand }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));
```

#### 2.2 创建TanStack Query Hooks
```typescript
// frontend/src/features/brand-management/hooks/useBrandList.ts
import { useQuery } from '@tanstack/react-query';
import { brandApi } from '../services/brandApi';
import { useBrandStore } from '../stores/brandStore';

export const useBrandList = (params?: BrandQueryParams) => {
  const setBrands = useBrandStore((state) => state.setBrands);
  const setLoading = useBrandStore((state) => state.setLoading);

  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => fetch(brandApi.getBrands(params)).then(res => res.json()),
    onSuccess: (data) => {
      setBrands(data.data);
      setLoading(false);
    },
    onError: (error) => {
      setLoading(false);
    },
  });
};
```

### Phase 3: 组件开发

#### 3.1 原子组件
```typescript
// frontend/src/features/brand-management/components/atoms/BrandStatusTag.tsx
import { Tag } from 'antd';
import { BrandStatus } from '../../types/brand.types';

interface BrandStatusTagProps {
  status: BrandStatus;
}

export const BrandStatusTag: React.FC<BrandStatusTagProps> = ({ status }) => {
  const config = {
    [BrandStatus.DRAFT]: { color: 'default', text: '草稿' },
    [BrandStatus.ENABLED]: { color: 'success', text: '启用' },
    [BrandStatus.DISABLED]: { color: 'error', text: '停用' },
  };

  const { color, text } = config[status];

  return <Tag color={color}>{text}</Tag>;
};
```

#### 3.2 有机体组件
```typescript
// frontend/src/features/brand-management/components/organisms/BrandList.tsx
import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { Brand } from '../../types/brand.types';
import { BrandStatusTag } from '../atoms/BrandStatusTag';

interface BrandListProps {
  brands: Brand[];
  onEdit: (brand: Brand) => void;
  onView: (brand: Brand) => void;
  onStatusChange: (brand: Brand, status: string) => void;
}

export const BrandList: React.FC<BrandListProps> = ({
  brands,
  onEdit,
  onView,
  onStatusChange,
}) => {
  const columns = [
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Brand) => (
        <Button type="link" onClick={() => onView(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '品牌类型',
      dataIndex: 'brandType',
      key: 'brandType',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <BrandStatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Brand) => (
        <Space>
          <Button size="small" onClick={() => onView(record)}>
            查看
          </Button>
          <Button size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return <Table dataSource={brands} columns={columns} rowKey="id" />;
};
```

### Phase 4: 测试驱动开发

#### 4.1 单元测试示例
```typescript
// frontend/src/features/brand-management/components/atoms/BrandStatusTag.test.tsx
import { render, screen } from '@testing-library/react';
import { BrandStatusTag } from './BrandStatusTag';
import { BrandStatus } from '../../types/brand.types';

describe('BrandStatusTag', () => {
  it('should render enabled status correctly', () => {
    render(<BrandStatusTag status={BrandStatus.ENABLED} />);
    expect(screen.getByText('启用')).toBeInTheDocument();
    expect(screen.getByText('启用')).toHaveClass('ant-tag-success');
  });

  it('should render disabled status correctly', () => {
    render(<BrandStatusTag status={BrandStatus.DISABLED} />);
    expect(screen.getByText('停用')).toBeInTheDocument();
    expect(screen.getByText('停用')).toHaveClass('ant-tag-error');
  });
});
```

#### 4.2 E2E测试示例
```typescript
// frontend/tests/e2e/brand-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Brand Management', () => {
  test('should create a new brand', async ({ page }) => {
    await page.goto('/mdm-pim/brands');

    await page.click('[data-testid="new-brand-button"]');
    await page.fill('[data-testid="brand-name-input"]', '测试品牌');
    await page.selectOption('[data-testid="brand-type-select"]', 'own');
    await page.click('[data-testid="save-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=测试品牌')).toBeVisible();
  });
});
```

## 开发工作流

### 1. 测试驱动开发流程
```bash
# 1. 编写测试
npm run test:unit -- BrandStatusTag.test.tsx

# 2. 运行测试（应该失败）
npm run test

# 3. 实现最小功能使测试通过
# 编辑 BrandStatusTag.tsx

# 4. 重构优化
npm run test:unit -- BrandStatusTag.test.tsx
```

### 2. 代码质量检查
```bash
# TypeScript类型检查
npm run type-check

# ESLint代码规范检查
npm run lint

# Prettier格式化
npm run format

# 运行所有检查
npm run pre-commit
```

### 3. 组件开发检查清单
- [ ] 组件有完整的TypeScript类型定义
- [ ] 遵循原子设计原则
- [ ] 使用React.memo优化性能
- [ ] 包含完整的单元测试
- [ ] 支持键盘导航
- [ ] 有适当的loading和error状态
- [ ] 遵循Ant Design设计规范

## 常见问题解决

### 1. MSW Mock不生效
```typescript
// 确保在src/mocks/browser.ts中导入handlers
import { brandHandlers } from './handlers/brandHandlers';

export const handlers = [
  ...brandHandlers,
  // 其他handlers
];
```

### 2. TanStack Query缓存问题
```typescript
// 在开发时清除缓存
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 开发时设为0
    },
  },
});
```

### 3. 组件性能优化
```typescript
// 使用React.memo和useCallback
export const BrandListItem = React.memo<BrandListItemProps>(({ brand, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(brand);
  }, [brand, onEdit]);

  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
});
```

## 部署和发布

### 1. 构建检查
```bash
# 生产构建
npm run build

# 检查构建输出
npm run preview
```

### 2. 测试覆盖
```bash
# 单元测试覆盖率
npm run test:coverage

# E2E测试
npm run test:e2e
```

这个快速开始指南提供了品牌管理功能开发的完整流程，确保团队能够高效、规范地完成开发工作。
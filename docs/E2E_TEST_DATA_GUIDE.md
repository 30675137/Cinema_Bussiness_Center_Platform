# E2E 测试数据模块创建指南

**@spec T002-e2e-test-generator**
**最后更新**: 2025-12-30

## 📖 概述

本文档详细说明如何为 E2E 测试场景创建和使用测试数据模块。

## 📂 文件位置

测试数据模块位于: `frontend/src/testdata/`

```
frontend/src/testdata/
├── README.md           # 使用说明文档
├── inventory.ts        # 库存管理测试数据 ✅ 已创建
├── order.ts            # 订单管理测试数据 (待创建)
├── product.ts          # 商品管理测试数据 (待创建)
└── user.ts             # 用户管理测试数据 (待创建)
```

## 🚀 快速开始

### 步骤 1: 创建测试数据模块文件

在 `frontend/src/testdata/` 目录下创建新的 `.ts` 文件,例如 `inventory.ts`。

### 步骤 2: 定义测试数据结构

参考以下模板创建测试数据:

```typescript
/**
 * @spec T002-e2e-test-generator
 * E2E 测试数据 - <模块名称>
 */

// ==================== 用户凭证数据 ====================

export const manager_user = {
  username: 'store_manager',
  password: 'manager123',
  email: 'manager@example.com',
  role: 'store_manager',
};

export const admin_user = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@example.com',
  role: 'admin',
};

// ==================== 配置数据 ====================

export const safety_stock_config = {
  skuId: '550e8400-e29b-41d4-a716-446655440001',
  skuCode: '6901234567001',
  skuName: '威士忌',
  safetyStockThreshold: 100,
  unit: 'ml',
};

// ==================== 业务数据 ====================

export const adjustment_data = {
  skuId: '550e8400-e29b-41d4-a716-446655440001',
  skuCode: '6901234567001',
  skuName: '威士忌',
  adjustmentType: 'surplus',
  quantity: 50,
  reason: 'E2E 测试盘盈',
};

// ==================== 场景数据集 ====================

export const scenario_001 = {
  baseUrl: 'http://localhost:3000',
  user: admin_user,
  adjustment: adjustment_data,
};

export const scenario_004 = {
  baseUrl: 'http://localhost:3000',
  manager_user: manager_user,
  safety_stock_config: safety_stock_config,
};

// ==================== 导出默认数据集 ====================

export const inventoryTestData = {
  manager_user,
  admin_user,
  safety_stock_config,
  adjustment_data,
  scenario_001,
  scenario_004,
};

export default inventoryTestData;
```

### 步骤 3: 在测试脚本中导入使用

在生成的测试脚本中,导入并使用测试数据:

```typescript
// scenarios/inventory/E2E-INVENTORY-004.spec.ts
import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';
import { inventoryTestData } from '@/testdata/inventory'  // ✅ 导入测试数据

test.describe('库存预警通知', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    // ✅ 加载测试数据
    testData = {
      manager_user: inventoryTestData.manager_user,
      safety_stock_config: inventoryTestData.safety_stock_config,
      product_sku: inventoryTestData.product_sku,
      manager_email: inventoryTestData.manager_email,
    };
  });

  test('E2E-INVENTORY-004', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // ✅ 使用测试数据
    await loginPage.login(testData.manager_user);
    await page.goto('/inventory/settings');
    await inventoryPage.setSafetyStock(testData.safety_stock_config, 100);
    // ...
  });
});
```

## 📝 数据结构规范

### 1. 用户凭证数据

```typescript
export const <role>_user = {
  username: string,    // 用户名
  password: string,    // 密码
  email: string,       // 邮箱
  role: string,        // 角色
};
```

**示例**:
```typescript
export const manager_user = {
  username: 'store_manager',
  password: 'manager123',
  email: 'manager@example.com',
  role: 'store_manager',
};
```

### 2. 配置数据

```typescript
export const <entity>_config = {
  // 实体相关的配置字段
};
```

**示例**:
```typescript
export const safety_stock_config = {
  skuId: '550e8400-e29b-41d4-a716-446655440001',
  safetyStockThreshold: 100,
  unit: 'ml',
};
```

### 3. 业务数据

```typescript
export const <entity>_data = {
  // 业务实体的字段
};
```

**示例**:
```typescript
export const adjustment_data = {
  skuId: '550e8400-e29b-41d4-a716-446655440001',
  adjustmentType: 'surplus',
  quantity: 50,
  reason: 'E2E 测试盘盈',
};
```

### 4. 场景数据集

每个场景应有对应的数据集,包含该场景所需的所有数据:

```typescript
export const scenario_<number> = {
  baseUrl: string,           // 基础 URL
  user: UserCredentials,     // 用户凭证
  <entity>_data: object,     // 业务数据
  // 其他场景所需数据
};
```

**示例**:
```typescript
export const scenario_004 = {
  baseUrl: 'http://localhost:3000',
  manager_user: manager_user,
  safety_stock_config: safety_stock_config,
  product_sku: product_sku,
  manager_email: manager_email,
};
```

### 5. 跨系统测试数据

对于跨越 C端 和 B端 的测试场景:

```typescript
export const scenario_002 = {
  // C端配置
  h5BaseUrl: 'http://localhost:10086',
  userCredentials: {
    phone: '13800138000',
    verifyCode: '123456',
  },

  // B端配置
  adminBaseUrl: 'http://localhost:3000',
  adminCredentials: admin_user,

  // 共享数据
  product: {
    id: '550e8400-e29b-41d4-a716-446655440021',
    name: '威士忌可乐',
  },
};
```

## 🔧 使用方式

### 方式 1: 直接导入场景数据集 (推荐)

```typescript
import { inventoryTestData } from '@/testdata/inventory'

test.beforeEach(async ({ page }) => {
  testData = inventoryTestData.scenario_004;
});
```

### 方式 2: 导入单个数据项

```typescript
import { manager_user, safety_stock_config } from '@/testdata/inventory'

test.beforeEach(async ({ page }) => {
  testData = {
    manager_user,
    safety_stock_config,
  };
});
```

### 方式 3: 自定义组合数据

```typescript
import { inventoryTestData } from '@/testdata/inventory'

const customData = {
  ...inventoryTestData.scenario_004,
  safety_stock_config: {
    ...inventoryTestData.safety_stock_config,
    safetyStockThreshold: 200, // 自定义阈值
  },
};
```

## 🌐 环境配置

| 系统 | URL | 说明 |
|------|-----|------|
| B端 (Admin) | http://localhost:3000 | React 管理后台 |
| C端 (H5) | http://localhost:10086 | Taro H5 应用 |
| 后端 API | http://localhost:8080 | Spring Boot 后端 |

## 📋 命名约定

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| 用户凭证 | `<role>_user` | `manager_user`, `admin_user` |
| 配置数据 | `<entity>_config` | `safety_stock_config` |
| 业务数据 | `<entity>_data` | `adjustment_data`, `order_data` |
| 场景数据集 | `scenario_<number>` | `scenario_001`, `scenario_004` |
| 页面路径 | `<page>_page` | `adjustment_page` |
| 选择器 | `<element>_selector` | `confirm_btn_selector` |

## ✅ 最佳实践

### 1. 使用固定的 ID 和 UUID

```typescript
// ✅ 好的做法 - 使用固定 UUID
export const product_sku = {
  id: '550e8400-e29b-41d4-a716-446655440001',  // 固定 UUID
  code: '6901234567001',                       // 固定编码
  name: '威士忌',
};

// ❌ 不好的做法 - 动态生成 ID
export const product_sku = {
  id: generateUUID(),  // 每次运行结果不同
  code: Math.random().toString(),
};
```

### 2. 添加清晰的注释

```typescript
/**
 * 安全库存配置
 * 用于 E2E-INVENTORY-004: 库存预警通知场景
 */
export const safety_stock_config = {
  skuId: '550e8400-e29b-41d4-a716-446655440001', // 威士忌
  safetyStockThreshold: 100, // 安全库存阈值: 100ml
  unit: 'ml',
};
```

### 3. 分组导出数据

```typescript
// ✅ 按类型分组导出
export const inventoryTestData = {
  // 用户凭证
  manager_user,
  admin_user,
  approver_user,

  // 配置数据
  safety_stock_config,
  product_sku,

  // 业务数据
  adjustment_data,

  // 场景数据集
  scenario_001,
  scenario_004,
};
```

### 4. 避免敏感数据

```typescript
// ✅ 使用虚拟数据
export const admin_user = {
  username: 'admin',
  password: 'admin123',  // 测试密码,非生产密码
  email: 'admin@example.com',  // 虚拟邮箱
};

// ❌ 不要使用真实敏感数据
export const admin_user = {
  username: 'real_admin',
  password: 'Prod@2024!',  // ❌ 真实生产密码
  email: 'admin@realcompany.com',  // ❌ 真实邮箱
};
```

## 🎯 完整示例

参考已创建的 `frontend/src/testdata/inventory.ts` 文件:

```bash
# 查看完整示例
cat frontend/src/testdata/inventory.ts
```

## 📚 相关文档

- [E2E 测试数据 README](../frontend/src/testdata/README.md)
- [E2E 测试场景 YAML](../scenarios/README.md)
- [e2e-test-generator Skill](./.claude/skills/e2e-test-generator/skill.md)
- [Playwright 配置](../frontend/playwright.config.ts)

## 🆘 常见问题

### Q1: 为什么使用 `@/testdata` 路径别名?

**A**: 项目配置了 TypeScript 路径别名 (`tsconfig.app.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

`@/testdata/inventory` 会自动解析为 `src/testdata/inventory`,避免复杂的相对路径。

### Q2: 测试数据文件应该放在哪里?

**A**:
- ✅ **推荐**: `frontend/src/testdata/` - 使用 `@/testdata` 导入
- ❌ **不推荐**: `scenarios/testdata/` - 需要复杂的相对路径导入

### Q3: 如何处理跨系统测试的数据?

**A**: 在场景数据集中分别配置 C端 和 B端 的数据:

```typescript
export const scenario_002 = {
  h5BaseUrl: 'http://localhost:10086',     // C端
  adminBaseUrl: 'http://localhost:3000',   // B端
  userCredentials: { ... },                // C端用户
  adminCredentials: { ... },               // B端用户
  product: { ... },                        // 共享数据
};
```

### Q4: 如何验证测试数据模块是否创建正确?

**A**: 运行以下命令检查:

```bash
# 检查文件是否存在
ls -la frontend/src/testdata/

# 验证 TypeScript 语法
cd frontend
npx tsc --noEmit src/testdata/inventory.ts

# 运行测试脚本验证导入
npm run test:e2e -- ../scenarios/inventory/E2E-INVENTORY-004.spec.ts --dry-run
```

### Q5: 测试数据可以动态生成吗?

**A**:
- ✅ **推荐**: 使用固定数据,确保测试可复现
- ⚠️ **谨慎使用**: 动态数据(如当前时间戳)仅在必要时使用
- ❌ **避免**: 随机数据会导致测试结果不稳定

```typescript
// ✅ 固定数据
export const scenario_004 = {
  createdAt: '2025-12-30T10:00:00Z',
};

// ⚠️ 动态数据(谨慎使用)
export const scenario_004 = {
  createdAt: new Date().toISOString(),
};
```

---

**维护者**: e2e-test-generator skill
**反馈渠道**: 项目 Issues 或 Pull Requests

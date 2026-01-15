# E2E 测试数据模块

**@spec T002-e2e-test-generator**

此目录包含所有 E2E 测试场景使用的测试数据。

## 目录结构

```
frontend/src/testdata/
├── README.md           # 本文档
├── inventory.ts        # 库存管理测试数据
├── order.ts            # 订单管理测试数据 (待创建)
├── product.ts          # 商品管理测试数据 (待创建)
└── user.ts             # 用户管理测试数据 (待创建)
```

## 使用方法

### 1. 在测试脚本中导入

```typescript
import { inventoryTestData } from '@/testdata/inventory';

test.describe('库存预警通知', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = {
      manager_user: inventoryTestData.manager_user,
      safety_stock_config: inventoryTestData.safety_stock_config,
      product_sku: inventoryTestData.product_sku,
      manager_email: inventoryTestData.manager_email,
    };
  });

  test('E2E-INVENTORY-004', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 使用测试数据
    await loginPage.login(testData.manager_user);
    // ...
  });
});
```

### 2. 使用场景数据集

每个模块提供了预定义的场景数据集,方便直接使用:

```typescript
import { inventoryTestData } from '@/testdata/inventory';

test.beforeEach(async ({ page }) => {
  // 直接使用场景数据集
  testData = inventoryTestData.scenario_004;
});
```

### 3. 自定义测试数据

您可以基于现有数据创建自定义数据:

```typescript
import { inventoryTestData } from '@/testdata/inventory';

const customData = {
  ...inventoryTestData.scenario_004,
  safety_stock_config: {
    ...inventoryTestData.safety_stock_config,
    safetyStockThreshold: 200, // 自定义阈值
  },
};
```

## 测试数据规范

### 命名约定

- **用户凭证**: `<role>_user` (例如: `manager_user`, `admin_user`)
- **配置数据**: `<entity>_config` (例如: `safety_stock_config`)
- **业务数据**: `<entity>_data` (例如: `adjustment_data`)
- **场景数据集**: `scenario_<number>` (例如: `scenario_001`)

### 数据结构

每个测试数据模块应包含以下部分:

1. **用户凭证** - 登录所需的用户名、密码、角色
2. **配置数据** - 系统配置、设置数据
3. **业务数据** - 业务对象数据(商品、订单等)
4. **场景数据集** - 完整的场景测试数据

### 示例: inventory.ts 结构

```typescript
// 用户凭证
export const manager_user = { ... };
export const admin_user = { ... };

// 配置数据
export const safety_stock_config = { ... };
export const product_sku = { ... };

// 业务数据
export const adjustment_data = { ... };

// 场景数据集
export const scenario_001 = { ... };
export const scenario_004 = { ... };

// 导出默认数据集
export const inventoryTestData = {
  manager_user,
  admin_user,
  safety_stock_config,
  product_sku,
  adjustment_data,
  scenario_001,
  scenario_004,
};

export default inventoryTestData;
```

## 数据维护原则

1. **真实性**: 测试数据应尽可能贴近生产环境数据
2. **独立性**: 每个测试场景的数据应独立,避免相互依赖
3. **可读性**: 使用清晰的变量名和注释
4. **可维护性**: 避免硬编码,使用常量和配置

## 环境配置

测试数据中的 URL 和环境配置:

| 环境        | URL                    | 说明             |
| ----------- | ---------------------- | ---------------- |
| B端 (Admin) | http://localhost:3000  | React 管理后台   |
| C端 (H5)    | http://localhost:10086 | Taro H5 应用     |
| 后端 API    | http://localhost:8080  | Spring Boot 后端 |

## 跨系统测试数据

对于跨系统测试(C端 + B端),数据结构应包含两端的配置:

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
  product: { ... },
};
```

## 常见问题

### Q: 为什么导入路径使用 `@/testdata` 而不是相对路径?

A: 项目配置了 TypeScript 路径别名,`@/testdata` 会自动解析为 `src/testdata`,这样可以避免复杂的相对路径引用。

### Q: 如何创建新的测试数据模块?

A: 参考 `inventory.ts` 的结构,创建新的 `.ts` 文件,并按照相同的命名规范和数据结构组织数据。

### Q: 测试数据中的 ID 是固定的吗?

A: 是的。为了保证测试的稳定性,建议使用固定的 UUID 或固定的 ID 值,这样测试结果可复现。

### Q: 如何处理敏感数据?

A: E2E 测试数据不应包含真实的敏感信息(如生产环境密码、真实用户数据等)。使用虚拟数据进行测试。

## 相关文档

- [E2E 测试场景 YAML](../../../scenarios/README.md)
- [Playwright 配置](../../playwright.config.ts)
- [测试脚本生成器](../../../.claude/skills/e2e-test-generator/skill.md)

---

**最后更新**: 2025-12-30
**维护者**: e2e-test-generator skill

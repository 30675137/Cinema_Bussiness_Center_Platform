# BUG-001 修复策略：库存追溯页面类型导入错误

**问题**: `The requested module '/src/types/inventory.ts' does not provide an export named 'CurrentInventory'`

**严重程度**: 🔴 P0 - 阻塞性问题

**目标**: 让 `/inventory/trace` 页面可以正常渲染

---

## 阶段 1️⃣: 深度诊断（预计30分钟）

### 1.1 验证类型定义本身

**目标**: 确认 inventory.ts 文件本身没有语法错误

```bash
# 步骤1: 检查文件编码
file src/types/inventory.ts

# 步骤2: 验证导出语法
grep -n "^export.*CurrentInventory" src/types/inventory.ts

# 步骤3: 创建最小化测试文件
# 创建 src/test-inventory-import.ts
cat > src/test-inventory-import.ts << 'EOF'
import type { CurrentInventory } from './types/inventory';

const test: CurrentInventory = {
  id: '1',
  skuId: '1',
  storeId: '1',
  availableQty: 0,
  onHandQty: 0,
  reservedQty: 0,
  inTransitQty: 0,
  damagedQty: 0,
  expiredQty: 0,
  reorderPoint: 0,
  maxStock: 0,
  minStock: 0,
  safetyStock: 0,
  lastUpdated: '',
  sku: { id: '', name: '', skuCode: '', isActive: true },
  store: { id: '', name: '', code: '', isActive: true }
};

console.log(test);
EOF

# 步骤4: 尝试编译测试文件
npx tsc --noEmit src/test-inventory-import.ts
```

**预期结果**: 如果编译通过，说明 inventory.ts 本身没问题

---

### 1.2 检查循环依赖

**目标**: 找出是否存在循环引用导致模块加载失败

```bash
# 安装依赖分析工具
npm install --save-dev madge

# 检查循环依赖
npx madge --circular --extensions ts,tsx src/

# 检查 inventory.ts 的依赖树
npx madge --depends src/types/inventory.ts src/

# 生成依赖图（可选）
npx madge --image deps-graph.svg src/types/inventory.ts src/
```

**预期结果**: 如果发现循环依赖，需要打破循环

**常见循环依赖模式**:

```
inventory.ts → store.ts → inventoryStore.ts → inventory.ts
```

---

### 1.3 搜索所有对 CurrentInventory 的引用

**目标**: 找出所有使用 CurrentInventory 的地方

```bash
# 搜索所有导入 CurrentInventory 的文件
grep -r "CurrentInventory" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"

# 查找错误的导入语法
grep -r "import.*CurrentInventory.*from.*services" src/ --include="*.ts" --include="*.tsx"

# 查找 inventoryService 中的类型导出（不应该有）
grep "export.*CurrentInventory" src/services/inventoryService.ts
```

**预期结果**: 找出所有错误的导入

---

### 1.4 检查 Vite 配置

**目标**: 确认路径别名配置正确

```bash
# 查看 vite.config.ts 的路径配置
cat vite.config.ts | grep -A 10 "resolve:"

# 查看 tsconfig.json 的路径配置
cat tsconfig.json | grep -A 5 "paths"
```

**检查点**:

- `@/` 别名是否正确指向 `src/`
- TypeScript 和 Vite 的配置是否一致

---

## 阶段 2️⃣: 分层隔离测试（预计20分钟）

### 2.1 创建最小化可复现案例

**策略**: 从最简单的导入开始，逐步增加复杂度

```typescript
// Step 1: 创建 src/pages/test/TestInventoryPage.tsx
import React from 'react';

// 只导入类型，不导入组件
import type { CurrentInventory } from '@/types/inventory';

export const TestInventoryPage: React.FC = () => {
  const mockData: CurrentInventory = {
    id: '1',
    skuId: '1',
    storeId: '1',
    availableQty: 100,
    onHandQty: 100,
    reservedQty: 0,
    inTransitQty: 0,
    damagedQty: 0,
    expiredQty: 0,
    reorderPoint: 10,
    maxStock: 1000,
    minStock: 0,
    safetyStock: 20,
    lastUpdated: new Date().toISOString(),
    sku: { id: '1', name: 'Test', skuCode: 'TEST001', isActive: true },
    store: { id: '1', name: 'Store1', code: 'S001', isActive: true }
  };

  return (
    <div>
      <h1>Test Inventory Page</h1>
      <pre>{JSON.stringify(mockData, null, 2)}</pre>
    </div>
  );
};
```

**测试步骤**:

1. 在 App.tsx 添加路由: `<Route path="/test-inventory" element={<TestInventoryPage />} />`
2. 访问 `http://localhost:3000/test-inventory`
3. 如果成功，说明类型导入本身没问题
4. 如果失败，问题在于 inventory.ts 本身或路径配置

---

### 2.2 逐步添加复杂依赖

```typescript
// Step 2: 添加 inventoryService 导入
import React from 'react';
import type { CurrentInventory } from '@/types/inventory';
import inventoryService from '@/services/inventoryService';

export const TestInventoryPage: React.FC = () => {
  // ...测试代码
};

// Step 3: 添加 store 导入
import { useInventoryStore } from '@/store/inventoryStore';

// Step 4: 添加 hooks 导入
import { useInventoryData } from '@/hooks/useInventoryData';
```

**策略**: 每次添加一个依赖，测试页面是否能加载。一旦失败，就找到了问题源头。

---

## 阶段 3️⃣: 根据诊断结果修复（预计30-60分钟）

### 方案 A: 如果是循环依赖问题

**解决方案**: 重构文件结构，打破循环

```typescript
// 创建 src/types/inventory-base.ts - 只包含基础类型
export interface CurrentInventory {
  id: string;
  skuId: string;
  storeId: string;
  // ... 只有数据类型，不导入其他模块
}

// src/types/inventory.ts - 导入基础类型并扩展
import type { CurrentInventory as BaseCurrentInventory } from './inventory-base';
export type { BaseCurrentInventory as CurrentInventory };
export * from './inventory-base';

// 其他文件只导入 inventory-base.ts
import type { CurrentInventory } from '@/types/inventory-base';
```

**优点**: 彻底打破循环
**缺点**: 需要重构多个文件

---

### 方案 B: 如果是 Vite 缓存问题

**解决方案**: 彻底清除所有缓存

```bash
# 方案 B1: 清除 Vite 和 npm 缓存
rm -rf node_modules/.vite
rm -rf node_modules/.cache
rm -rf dist
npm cache clean --force
npm run dev

# 方案 B2: 重新安装依赖
rm -rf node_modules
rm package-lock.json
npm install
npm run dev

# 方案 B3: 禁用 Vite HMR（调试用）
# 在 vite.config.ts 添加
server: {
  hmr: false
}
```

---

### 方案 C: 如果是模块系统冲突

**解决方案**: 统一使用 ES Module 语法

```typescript
// ❌ 错误 - 混用语法
export const inventoryService = { ... }
export default inventoryServiceInstance;

// ✅ 正确 - 只用默认导出
const inventoryService = { ... };
export default inventoryService;

// ✅ 或者只用命名导出
export const inventoryService = { ... };
```

**检查清单**:

- [ ] inventoryService 只有一种导出方式
- [ ] 所有类型使用 `export type` 或 `export interface`
- [ ] 所有导入使用 `import type` 导入类型

---

### 方案 D: 如果是路径别名问题

**解决方案**: 统一配置 TypeScript 和 Vite 的路径别名

```typescript
// vite.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**验证**:

```bash
# 测试路径解析
npx tsc --showConfig | grep paths
```

---

### 方案 E: 如果是类型文件太大

**解决方案**: 拆分 inventory.ts 为多个小文件

```
src/types/inventory/
├── index.ts          # 统一导出
├── base.ts           # 基础接口
├── transaction.ts    # 交易相关
├── statistics.ts     # 统计相关
├── enums.ts          # 枚举类型
└── schemas.ts        # Zod schemas
```

```typescript
// src/types/inventory/base.ts
export interface CurrentInventory { ... }
export interface InventoryTransaction { ... }

// src/types/inventory/index.ts
export * from './base';
export * from './transaction';
export * from './statistics';
export * from './enums';
export * from './schemas';

// 其他文件导入
import type { CurrentInventory } from '@/types/inventory';
// 或者更具体的
import type { CurrentInventory } from '@/types/inventory/base';
```

**优点**:

- 减少单个文件的复杂度
- 降低循环依赖风险
- 提高可维护性

---

## 阶段 4️⃣: 暴力修复（最后手段，预计15分钟）

### 方案 F: 临时绕过问题

**策略**: 为 InventoryTrace 页面创建本地类型定义

```typescript
// src/pages/inventory/InventoryTrace/types.ts
// 临时解决方案：复制类型定义到本地
export interface CurrentInventory {
  id: string;
  skuId: string;
  storeId: string;
  availableQty: number;
  onHandQty: number;
  reservedQty: number;
  inTransitQty: number;
  damagedQty: number;
  expiredQty: number;
  reorderPoint: number;
  maxStock: number;
  minStock: number;
  safetyStock: number;
  lastUpdated: string;
  sku: any; // 简化依赖
  store: any; // 简化依赖
  lastTransactionTime?: string;
  lastTransactionType?: any;
  totalValue?: number;
  averageCost?: number;
}

// src/pages/inventory/InventoryTrace/index.tsx
// 使用本地类型而不是全局类型
import type { CurrentInventory } from './types';
```

**优点**: 快速让页面工作起来
**缺点**:

- 不是长期方案
- 类型定义重复
- 后续需要重构

---

## 推荐执行顺序

### 第一轮：快速验证（15分钟）

1. ✅ 执行 1.1 - 验证类型定义本身
2. ✅ 执行 1.3 - 搜索错误导入
3. ✅ 执行 2.1 - 创建最小化测试页面

**目标**: 确认问题的确切位置

### 第二轮：针对性修复（30分钟）

根据第一轮结果，选择对应方案：

- 如果测试页面成功 → 问题在现有组件，执行 2.2
- 如果有循环依赖 → 执行方案 A
- 如果有错误导入 → 修复导入
- 如果路径有问题 → 执行方案 D

### 第三轮：深度修复（60分钟，可选）

如果第二轮失败，执行：

1. 执行方案 B - 彻底清除缓存
2. 执行方案 E - 拆分大文件
3. 考虑方案 C - 统一模块系统

### 最后手段：临时绕过（15分钟）

如果所有方案都失败，执行方案 F 让页面先工作起来

---

## 成功标准

- [ ] `/inventory/trace` 页面可以正常访问
- [ ] 页面不报 JavaScript 错误
- [ ] 可以看到库存数据或空状态页面
- [ ] TC-UI-001 测试可以通过

---

## 预防措施

### 未来避免类似问题

1. **建立导入规范**:

   ```typescript
   // ✅ 好的实践
   import type { TypeName } from '@/types/module';
   import serviceName from '@/services/module';

   // ❌ 避免
   import { TypeName } from '@/services/module'; // 类型不应该从 service 导入
   ```

2. **添加 ESLint 规则**:

   ```json
   {
     "rules": {
       "import/no-cycle": "error",
       "@typescript-eslint/consistent-type-imports": "error"
     }
   }
   ```

3. **定期检查依赖**:

   ```bash
   # 添加到 package.json scripts
   "check-deps": "npx madge --circular src/"
   ```

4. **代码审查清单**:
   - [ ] 类型从 `/types/` 导入
   - [ ] 服务从 `/services/` 导入
   - [ ] 避免跨层级导入
   - [ ] 检查循环依赖

---

## 时间估算

| 阶段     | 最佳情况   | 最坏情况    |
| -------- | ---------- | ----------- |
| 诊断     | 15分钟     | 30分钟      |
| 修复     | 15分钟     | 60分钟      |
| 验证     | 10分钟     | 15分钟      |
| **总计** | **40分钟** | **105分钟** |

---

## 需要的工具

```bash
# 安装诊断工具
npm install --save-dev madge

# 可选：依赖图可视化
npm install --save-dev dependency-cruiser
```

---

**开始执行前**:

1. 确保代码已提交到 git（以便回滚）
2. 记录当前的错误信息
3. 准备好调试工具（浏览器 DevTools）

**执行中**:

1. 每完成一步，记录结果
2. 如果某个方案有效，立即停止并提交代码
3. 保持耐心，系统化地排查

**执行后**:

1. 更新测试报告
2. 记录最终解决方案
3. 添加预防措施到开发规范中

---

**创建时间**: 2025-12-29
**预期解决时间**: 1-2 小时
**优先级**: P0

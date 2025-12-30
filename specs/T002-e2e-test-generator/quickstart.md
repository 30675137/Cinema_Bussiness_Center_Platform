# Quick Start Guide: E2E测试脚本生成器

**Feature**: T002-e2e-test-generator
**Last Updated**: 2025-12-30

## 简介

e2e-test-generator 是一个 Claude Code Skill，用于将 T001-e2e-scenario-author 生成的场景 YAML 文件自动转换为可执行的测试脚本。

**支持的测试框架**:
- **P1 (优先)**: Playwright (UI + API 测试)
- **P2 (未来)**: Postman Collection, REST Client .http

---

## 快速开始

### 1. 生成单个场景的测试脚本

**命令格式**:
```bash
/e2e-test-generator generate <scenario-id>
```

**示例**:
```bash
# 从 scenarios/inventory/E2E-INVENTORY-001.yaml 生成 Playwright 测试脚本
/e2e-test-generator generate E2E-INVENTORY-001
```

**输出**:
```
✅ Generated: scenarios/inventory/E2E-INVENTORY-001.spec.ts
📋 Summary:
   - Framework: Playwright
   - Steps: 5
   - Assertions: 8
   - Page Objects: LoginPage, ProductPage, OrderPage

⚠️  TODO Items:
   - Implement LoginPage.login() method
   - Implement ProductPage.browseProduct() method
```

---

### 2. 指定测试框架（P2功能）

**命令格式**:
```bash
/e2e-test-generator generate <scenario-id> --framework <framework-name>
```

**示例**:
```bash
# 生成 Postman Collection
/e2e-test-generator generate E2E-API-AUTH-001 --framework postman

# 生成 REST Client .http 文件
/e2e-test-generator generate E2E-API-AUTH-001 --framework restclient
```

**支持的框架**:
- `playwright` (默认)
- `postman` (P2)
- `restclient` (P2)

---

### 3. 批量生成（按模块）

**命令格式**:
```bash
/e2e-test-generator batch --module <module-name>
```

**示例**:
```bash
# 批量生成 inventory 模块的所有场景
/e2e-test-generator batch --module inventory
```

**输出**:
```
🚀 Batch Generation Report

✅ Success: 8/10 scenarios
   - E2E-INVENTORY-001.spec.ts
   - E2E-INVENTORY-002.spec.ts
   - E2E-INVENTORY-003.spec.ts
   - E2E-INVENTORY-004.spec.ts
   - E2E-INVENTORY-005.spec.ts
   - E2E-INVENTORY-006.spec.ts
   - E2E-INVENTORY-007.spec.ts
   - E2E-INVENTORY-008.spec.ts

❌ Failed: 2/10 scenarios
   - E2E-INVENTORY-009.yaml (Invalid YAML format)
   - E2E-INVENTORY-010.yaml (Missing required field: steps)

📁 Output Directory: scenarios/inventory/
```

---

### 4. 更新已存在的测试脚本

**命令格式**:
```bash
/e2e-test-generator update <scenario-id>
```

**示例**:
```bash
# 智能更新测试脚本（保留手动修改）
/e2e-test-generator update E2E-INVENTORY-001
```

**智能更新策略**:

**场景 A: 文件未修改或小幅修改**
```
检测到文件修改程度：低 (<30%)
✅ 安全更新：保留 CUSTOM CODE 区域
📝 Updated: scenarios/inventory/E2E-INVENTORY-001.spec.ts
```

**场景 B: 文件大幅修改**
```
检测到文件修改程度：高 (≥30%)
⚠️  拒绝覆盖：生成新文件供手动合并
📝 Generated: scenarios/inventory/E2E-INVENTORY-001.spec.new.ts

建议操作：
1. 使用 diff 工具对比 .spec.ts 和 .spec.new.ts
2. 手动合并变更
3. 删除 .spec.new.ts 文件
```

---

### 5. 验证生成的测试脚本

**命令格式**:
```bash
/e2e-test-generator validate <scenario-id>
```

**示例**:
```bash
# 验证测试脚本语法和依赖
/e2e-test-generator validate E2E-INVENTORY-001
```

**验证检查项**:
```
🔍 Validating E2E-INVENTORY-001.spec.ts

✅ TypeScript Syntax: PASS
✅ Playwright Dry-run: PASS
✅ Imports Resolved: PASS
⚠️  Page Object Method: LoginPage.login() - Method not implemented

Validation Score: 75% (3/4 checks passed)
```

---

## 自定义 Action 映射

### 添加自定义 Action

**配置文件**: `.claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml`

**步骤**:

1. 编辑 `action-mappings.yaml` 文件

2. 添加自定义 action 映射:

```yaml
# 自定义 action: approve_adjustment
approve_adjustment:
  playwright:
    code: "await inventoryPage.approveAdjustment({{adjustmentId}})"
    imports: ["InventoryPage"]
    params: ["adjustmentId"]
```

3. 在场景 YAML 中使用:

```yaml
steps:
  - action: approve_adjustment
    params:
      adjustmentId: "{{testdata_ref}}"
    description: 审批库存调整
```

4. 重新生成测试脚本:

```bash
/e2e-test-generator generate E2E-INVENTORY-001
```

**生成的代码**:
```typescript
// Step: 审批库存调整
await inventoryPage.approveAdjustment(testData.adjustmentId);
```

---

## 代码标记（Code Markers）

生成的测试脚本包含以下标记，用于智能更新：

```typescript
// AUTO-GENERATED: Do not modify above this line
// 此行以上的代码由工具生成，更新时会被覆盖

import { test, expect } from '@playwright/test';
// ... auto-generated imports ...

test.describe('场景标题', () => {
  test.beforeEach(async ({ page }) => {
    // ... auto-generated setup ...
  });

  test('scenario', async ({ page }) => {
    // ... auto-generated steps ...

    // CUSTOM CODE START
    // 在此区域添加自定义代码
    // 更新时此区域的代码会被保留
    await page.screenshot({ path: 'debug.png' });
    console.log('Custom logic here');
    // CUSTOM CODE END
  });
});
```

**最佳实践**:
- ✅ 在 `CUSTOM CODE START/END` 区域内添加自定义断言和调试代码
- ✅ 不修改 `AUTO-GENERATED` 区域的代码
- ❌ 避免删除代码标记注释

---

## 常见问题排查

### 问题 1: 场景 YAML 文件未找到

**错误信息**:
```
❌ Error: Scenario file not found: scenarios/inventory/E2E-INVENTORY-999.yaml
```

**解决方案**:
1. 检查场景 ID 是否正确
2. 确认场景文件存在于正确的模块目录下
3. 使用 `/test-scenario-author list --module inventory` 查看所有场景

---

### 问题 2: Page Object 方法未实现

**警告信息**:
```
⚠️  Page Object Missing: LoginPage.login()
Generated TODO marker in test script
```

**解决方案**:
1. 查看生成的测试脚本中的 TODO 注释
2. 实现对应的页面对象方法:

```typescript
// scenarios/inventory/pages/LoginPage.ts
export class LoginPage {
  async login(credentials: any) {
    await this.page.locator('#username').fill(credentials.username);
    await this.page.locator('#password').fill(credentials.password);
    await this.page.locator('button[type="submit"]').click();
  }
}
```

3. 重新运行测试验证

---

### 问题 3: TypeScript 编译错误

**错误信息**:
```
❌ TypeScript Error: Cannot find module '@/testdata/loader'
```

**解决方案**:
1. 确认项目配置了 TypeScript 路径别名 (`@/`)
2. 检查 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. 创建测试数据加载器:

```typescript
// src/testdata/loader.ts
export async function loadTestData(ref: string) {
  const [dataset, key] = ref.split('.');
  const data = await import(`./${dataset}.json`);
  return data[key];
}
```

---

### 问题 4: 更新时自定义代码被覆盖

**症状**: 手动添加的断言在更新后丢失

**原因**: 未使用 `CUSTOM CODE START/END` 标记

**解决方案**:
1. 始终在 `CUSTOM CODE START/END` 区域内添加自定义代码
2. 如果已经覆盖，使用 Git 恢复:

```bash
git checkout scenarios/inventory/E2E-INVENTORY-001.spec.ts
```

3. 重新添加自定义代码到标记区域内

---

## 进阶用法

### 组合使用多个 Actions

```yaml
steps:
  - action: login
    description: 用户登录
  - action: navigate
    params:
      testdata_ref: inventoryTestData.adjustment_page
    description: 导航到库存调整页面
  - action: create_adjustment
    params:
      testdata_ref: inventoryTestData.adjustment_data
    description: 创建库存调整
  - action: approve_adjustment
    params:
      adjustmentId: "{{testdata_ref}}"
    description: 审批调整
```

### 混合 UI 和 API 断言

```yaml
assertions:
  # UI 断言
  - type: ui
    check: element_visible
    params:
      selector: .success-message
  - type: ui
    check: toast_message_shown
    params:
      message: 操作成功

  # API 断言
  - type: api
    check: response_status_is
    params:
      expected: 200
  - type: api
    check: database_field_equals
    params:
      table: inventory_adjustments
      field: status
      expected: approved
```

---

## 下一步

- 📖 阅读 [data-model.md](./data-model.md) 了解完整的数据结构
- 🛠️ 查看 [spec.md](./spec.md) 了解功能需求和成功标准
- 🧪 运行生成的测试脚本: `npx playwright test scenarios/inventory/E2E-INVENTORY-001.spec.ts`
- 🎯 使用 T001 skill 创建更多场景: `/test-scenario-author create`

---

**技术支持**: 如遇到问题，请查看 `specs/T002-e2e-test-generator/` 目录下的完整文档。

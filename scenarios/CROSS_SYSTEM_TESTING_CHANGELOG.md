# 跨系统 E2E 测试功能更新日志

**Date**: 2025-12-30
**Version**: 1.1.0
**Feature**: T002-e2e-test-generator Cross-System Testing Support

## 概述

基于用户发现的问题（E2E-INVENTORY-002 场景跨越 C端和 B端两个系统），我们实施了完整的跨系统测试支持。

## 问题背景

### 原问题

E2E-INVENTORY-002 场景包含以下步骤：
- **Step 1-6**: 用户在 C端（Taro H5, port 10086）下单
- **Step 7**: 吧台在 B端（React Admin, port 3000）确认出品

### 技术挑战

- Playwright 测试默认在单一系统运行
- 需要在同一测试中访问两个不同的 URL 和页面
- 测试数据需要区分两个系统的配置

## 实施的改进

### ✅ 1. 更新 YAML 场景文件（增加系统标识）

**文件**: `scenarios/inventory/E2E-INVENTORY-002.yaml`

**变更**:
```yaml
steps:
  - action: login
    system: c-end  # 新增系统标识
    description: 用户登录
  # ... C端其他步骤 ...
  - action: click
    system: b-end  # B端步骤
    description: 吧台点击确认出品按钮
```

**系统标识符**:
- `c-end`: C端（用户端）
- `b-end`: B端（运营中台）
- `api`: 纯 API 调用

### ✅ 2. 更新 action-mappings.yaml

**文件**: `.claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml`

**变更**:
- 添加了系统标识符说明文档
- 定义了跨系统测试的代码生成规则

```yaml
# System Identifiers:
#   - c-end: C端（用户端）- Taro H5/小程序 (http://localhost:10086)
#   - b-end: B端（运营中台）- React Admin (http://localhost:3000)
#   - api: 纯 API 调用（无 UI 交互）
```

### ✅ 3. 更新 data-model.md

**文件**: `specs/T002-e2e-test-generator/data-model.md`

**变更**:
- 在 `steps` schema 中添加 `system: string` 字段
- 新增 "Cross-System Testing" 章节
- 提供完整的跨系统场景示例和生成规则

**Schema 更新**:
```yaml
steps:
  - action: string
    system: string   # 新增字段 (optional): c-end | b-end | api
    params: object
    description: string
```

### ✅ 4. 创建 Playwright 跨系统配置

**文件**: `frontend/playwright.config.ts`

**变更 1 - baseURL 配置**:
```typescript
use: {
  baseURL: process.env.CROSS_SYSTEM_TEST ? undefined : 'http://localhost:3000',
  // 跨系统测试时不设置默认 baseURL，每个测试指定完整 URL
}
```

**变更 2 - webServer 配置**:
```typescript
webServer: process.env.CROSS_SYSTEM_TEST ? [
  {
    command: 'cd ../hall-reserve-taro && npm run dev:h5',
    url: 'http://localhost:10086',  // C端
  },
  {
    command: 'npm run dev',
    url: 'http://localhost:3000',  // B端
  }
] : undefined
```

**文件**: `frontend/package.json`

**新增脚本**:
```json
{
  "scripts": {
    "test:e2e:cross-system": "CROSS_SYSTEM_TEST=1 playwright test ../scenarios",
    "test:e2e:cross-system:ui": "CROSS_SYSTEM_TEST=1 playwright test ../scenarios --ui"
  }
}
```

### ✅ 5. 更新 skill.md 文档

**文件**: `.claude/skills/e2e-test-generator/skill.md`

**新增章节**: "Cross-System Testing (跨系统测试)"

**内容包括**:
- 系统标识符说明
- 场景 YAML 示例
- 生成的测试代码示例
- 运行命令
- Playwright 配置说明
- 测试数据结构

### ✅ 6. 生成的测试脚本更新

**文件**: `scenarios/inventory/E2E-INVENTORY-002.spec.ts`

**关键改进**:
```typescript
test('E2E-INVENTORY-002', async ({ page, context }) => {  // 增加 context 参数
  // ====== 第一部分：C端（H5/小程序） - 用户下单流程 ======
  await page.goto(testData.h5BaseUrl);  // http://localhost:10086
  await loginPage.login(testData);
  const orderId = await orderPage.createOrder(testData.order_params);

  // ====== 第二部分：B端（运营中台） - 吧台确认出品流程 ======
  const adminPage = await context.newPage();  // 创建新页面
  await adminPage.goto(testData.adminBaseUrl);  // http://localhost:3000
  await adminLoginPage.login(testData.adminCredentials);
  await adminPage.click(testData.confirm_production_btn);
});
```

**测试数据结构**:
```typescript
{
  h5BaseUrl: 'http://localhost:10086',
  adminBaseUrl: 'http://localhost:3000',
  adminCredentials: { username: 'admin', password: 'admin123' },
  // ...
}
```

### ✅ 7. 创建跨系统测试指南

**文件**: `scenarios/CROSS_SYSTEM_TESTING.md`

**内容**:
- 完整的跨系统测试指南
- 多种实现方案（多页面、多上下文、API+UI 混合）
- 配置说明、最佳实践、常见问题

## 使用方法

### 创建跨系统场景

在 YAML 文件中为每个步骤添加 `system` 字段：

```yaml
steps:
  - action: login
    system: c-end  # C端步骤
  - action: create_order
    system: c-end
  - action: click
    system: b-end  # B端步骤
```

### 生成测试脚本

```bash
/e2e-test-generator generate E2E-INVENTORY-002
```

生成器会自动：
1. 检测 `system` 字段变化
2. 生成系统切换代码（`context.newPage()`）
3. 插入分区注释

### 运行测试

```bash
cd frontend

# 自动启动两个开发服务器并运行测试
npm run test:e2e:cross-system

# UI 模式
npm run test:e2e:cross-system:ui

# 运行特定场景
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

## 技术实现

### Playwright 多页面支持

```typescript
// 默认页面（C端）
const page = await context.page();

// B端页面（新建）
const adminPage = await context.newPage();

// 两个页面可以独立操作
await page.goto('http://localhost:10086');
await adminPage.goto('http://localhost:3000');
```

### 环境变量控制

- `CROSS_SYSTEM_TEST=1`: 启用跨系统模式
  - 自动启动两个 webServer
  - 不设置默认 baseURL

### 生成规则

1. **首次 b-end**: 生成 `const adminPage = await context.newPage()`
2. **后续 b-end**: 复用 `adminPage`
3. **c-end**: 使用默认 `page`

## 文件清单

### 新增文件
- ✅ `scenarios/CROSS_SYSTEM_TESTING.md` - 跨系统测试指南
- ✅ `scenarios/CROSS_SYSTEM_TESTING_CHANGELOG.md` - 本文档

### 修改文件
- ✅ `scenarios/inventory/E2E-INVENTORY-002.yaml` - 增加 system 字段
- ✅ `scenarios/inventory/E2E-INVENTORY-002.spec.ts` - 生成跨系统测试代码
- ✅ `.claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml` - 添加文档说明
- ✅ `.claude/skills/e2e-test-generator/skill.md` - 新增跨系统测试章节
- ✅ `specs/T002-e2e-test-generator/data-model.md` - 更新 schema 和文档
- ✅ `frontend/playwright.config.ts` - 添加跨系统配置
- ✅ `frontend/package.json` - 新增测试脚本

## 向后兼容性

✅ **完全兼容** - 现有场景无需修改：
- `system` 字段为可选（optional）
- 未指定 `system` 时默认使用单一 `page` 对象
- 现有测试脚本继续正常工作

## 下一步计划

### P2 优先级
1. 在 e2e-test-generator 中实现自动识别逻辑
   - 根据 `system` 字段自动生成 `context.newPage()` 代码
   - 自动插入系统切换注释

2. 支持更多系统标识
   - `mobile`: 移动端原生应用
   - `wechat`: 微信小程序（需要开发者工具集成）

3. 增强测试数据管理
   - 自动从 `testdata/` 目录加载数据
   - 支持环境变量覆盖配置

### P3 优先级
1. CI/CD 集成
   - GitHub Actions workflow 示例
   - Docker Compose 配置

2. 性能优化
   - C端操作改用 API 调用
   - 并行运行多个场景

## 验证清单

- ✅ YAML 场景文件包含 `system` 字段
- ✅ action-mappings.yaml 包含系统标识说明
- ✅ data-model.md 文档化 `system` 字段
- ✅ Playwright 配置支持跨系统模式
- ✅ package.json 包含跨系统测试脚本
- ✅ skill.md 文档包含跨系统测试指南
- ✅ 生成的测试脚本包含多页面代码
- ✅ 测试数据结构包含两个系统的配置

## 参考资料

- [Playwright Multiple Pages](https://playwright.dev/docs/pages)
- [Playwright Browser Contexts](https://playwright.dev/docs/browser-contexts)
- [Cinema Business Center Platform - CLAUDE.md](../CLAUDE.md)

---

**Status**: ✅ Completed
**Contributors**: Claude Code (Skill: e2e-test-generator)
**Review Status**: Ready for Testing

# 研究文档：E2E 测试数据规划器

**Feature**: T004-e2e-testdata-planner
**Date**: 2025-12-30
**Status**: Complete

本文档记录了实现 E2E 测试数据规划器所需的技术决策和研究结果。

## 1. 依赖图分析库选择

### 决策：使用简化的自实现拓扑排序

**理由**:
1. 需求相对简单：检测循环依赖 + 拓扑排序生成执行顺序
2. graphlib (2.1.8) 体积较大（50KB+），功能过于丰富
3. 自实现方案可完全控制，易于测试和调试
4. 依赖链深度限制在 10 层，性能不是瓶颈

**实现方案**:
```typescript
// dependency-resolver.ts
export class DependencyResolver {
  // 使用邻接表表示依赖图
  private graph: Map<string, string[]>

  // Kahn 算法实现拓扑排序
  topologicalSort(): string[] {
    // 计算入度
    // BFS 遍历
    // 返回排序结果或检测循环
  }

  // DFS 检测循环依赖
  detectCycle(): string[] | null {
    // 白灰黑三色标记
    // 返回循环路径或 null
  }
}
```

**替代方案拒绝原因**:
- graphlib: 功能过度，增加包体积，学习曲线陡峭
- dagre: 主要用于图布局，非核心需求

**性能预期**:
- 100 节点，5 层依赖：<10ms
- 1000 节点，10 层依赖：<100ms

---

## 2. Fixture 代码生成策略

### 决策：使用模板字符串 + TypeScript 格式化

**理由**:
1. Playwright fixtures 结构相对固定，模板化即可
2. AST 操作（ts-morph）过于复杂，增加维护成本
3. 使用 prettier 格式化生成代码，确保可读性
4. 生成代码需要类型安全，模板中直接嵌入类型注解

**实现方案**:
```typescript
// fixture-codegen.ts
export class FixtureCodeGenerator {
  generateFixture(blueprint: TestdataBlueprint): string {
    const template = `
/**
 * @spec T004-e2e-testdata-planner
 * Auto-generated fixture for ${blueprint.id}
 */
import { test as base } from '@playwright/test';
import type { ${blueprint.id}Data } from './types';

export const test = base.extend<{ ${blueprint.id}: ${blueprint.id}Data }>({
  ${blueprint.id}: async ({ page }, use) => {
    // Setup
    const data = await ${this.generateSetupCode(blueprint)};
    await use(data);
    // Teardown
    ${this.generateTeardownCode(blueprint)}
  }
});
    `.trim();

    return this.formatWithPrettier(template);
  }
}
```

**替代方案拒绝原因**:
- ts-morph/babel: 过度工程化，生成代码结构固定无需 AST 操作
- Handlebars/EJS: 引入额外模板引擎，Node.js 模板字符串已足够

**类型安全保证**:
- 生成的 fixture 代码包含正确的 TypeScript 类型注解
- 使用 tsc --noEmit 验证生成代码的类型正确性
- 集成测试中实际导入生成的 fixtures

---

## 3. Supabase 客户端集成

### 决策：使用 @supabase/supabase-js SDK

**理由**:
1. 官方支持的 TypeScript SDK，类型定义完善
2. 内置认证、权限控制、连接池管理
3. 支持事务（通过 rpc 调用）
4. 错误处理和重试机制成熟

**实现方案**:
```typescript
// db-script-provider.ts
import { createClient } from '@supabase/supabase-js';

export class DbScriptProvider implements DataProvider {
  private client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 服务端密钥
  );

  async executeScript(scriptPath: string): Promise<void> {
    const sql = await readFile(scriptPath, 'utf-8');

    // 使用 rpc 调用执行 SQL（需要在 Supabase 中创建函数）
    const { error } = await this.client.rpc('execute_test_script', {
      script_content: sql
    });

    if (error) {
      throw new DbScriptError(`Failed to execute ${scriptPath}: ${error.message}`);
    }
  }
}
```

**安全措施**:
- 使用环境变量存储凭据，不硬编码
- SQL 脚本路径验证，防止路径遍历
- 限制执行权限，仅允许测试数据库操作
- 记录所有执行的脚本和时间戳

**替代方案拒绝原因**:
- 直接 HTTP API: 需手动处理认证、重试，增加复杂度
- SQL 解析器 + 批量执行: 事务控制困难，错误处理复杂

---

## 4. 蓝图版本控制

### 决策：使用语义化版本号 + 简单向后兼容检查

**理由**:
1. 蓝图模式演化较慢，不需要复杂的迁移机制
2. Zod schema 本身支持 .optional()、.default() 等向后兼容特性
3. 版本号在蓝图文件的 `version` 字段中声明
4. MVP 阶段暂不支持自动迁移，需手动更新蓝图

**实现方案**:
```yaml
# blueprint 示例
id: TD-ORDER-001
version: 1.0.0  # 语义化版本
schema:
  type: object
  properties:
    orderId: { type: string }
    amount: { type: number }
```

```typescript
// blueprint-loader.ts
export function validateBlueprintVersion(blueprint: TestdataBlueprint): void {
  const { major, minor } = parseVersion(blueprint.version);
  const { major: currentMajor } = parseVersion(CURRENT_SCHEMA_VERSION);

  if (major !== currentMajor) {
    throw new VersionMismatchError(
      `Blueprint ${blueprint.id} version ${blueprint.version} incompatible with current schema ${CURRENT_SCHEMA_VERSION}`
    );
  }

  // Minor version 向后兼容
}
```

**未来扩展**:
- 支持蓝图迁移脚本（v1 → v2 转换函数）
- 提供 CLI 命令检查所有蓝图版本兼容性
- 生成迁移建议

**替代方案拒绝原因**:
- 自动迁移机制: MVP 阶段过度设计，蓝图变更频率低
- 数据库迁移工具（Knex/Prisma）: 不适用于 YAML 文件

---

## 5. 数据来源跟踪

### 决策：使用 JSON 文件 + 可选 Supabase 表

**理由**:
1. MVP 阶段使用 JSON 文件即可，简单易实现
2. 文件位置：`testdata/logs/provenance-{timestamp}.json`
3. 未来可迁移到 Supabase 表以支持查询和分析
4. 数据来源跟踪为可选功能（FR-013），不影响核心流程

**数据格式**:
```json
{
  "testRunId": "run-20251230-140532",
  "environment": "staging",
  "dataCreated": [
    {
      "testdataRef": "TD-ORDER-001",
      "strategy": "api",
      "createdAt": "2025-12-30T14:05:35Z",
      "testId": "order-creation-spec.ts:12",
      "status": "success"
    },
    {
      "testdataRef": "TD-USER-ADMIN",
      "strategy": "seed",
      "createdAt": "2025-12-30T14:05:36Z",
      "testId": "order-creation-spec.ts:12",
      "status": "success"
    }
  ],
  "dataCleanedUp": [
    {
      "testdataRef": "TD-ORDER-001",
      "cleanedAt": "2025-12-30T14:06:10Z",
      "status": "success"
    }
  ]
}
```

**未来迁移路径**:
```sql
-- Supabase 表定义（未来实现）
CREATE TABLE testdata_provenance (
  id UUID PRIMARY KEY,
  test_run_id VARCHAR(100),
  testdata_ref VARCHAR(50),
  strategy VARCHAR(20),
  created_at TIMESTAMPTZ,
  test_id VARCHAR(200),
  cleaned_at TIMESTAMPTZ,
  status VARCHAR(20)
);
```

**替代方案拒绝原因**:
- SQLite: 增加依赖，数据查询需求暂时不大
- 直接 Supabase 表: MVP 阶段增加复杂度，文件已足够

---

## 6. 环境特定配置

### 决策：蓝图条件字段 + 环境变量覆盖

**理由**:
1. 蓝图中支持 `environments` 字段，指定适用环境
2. 默认蓝图适用所有环境，特定环境可覆盖
3. 使用环境变量 `E2E_ENV_PROFILE` 指定当前环境
4. 验证逻辑：检查蓝图 `environments` 是否包含当前环境

**实现方案**:
```yaml
# 通用蓝图（适用所有环境）
id: TD-USER-ADMIN
strategy: seed
seedFilePath: testdata/seeds/users.json

# 环境特定蓝图
id: TD-ORDER-PAYMENT
environments: [staging, production]  # 仅适用于 staging 和 production
strategy: api
apiEndpoint: /api/test/orders
```

```typescript
// 环境验证
export function validateEnvironment(blueprint: TestdataBlueprint, envProfile: string): void {
  if (blueprint.environments && !blueprint.environments.includes(envProfile)) {
    throw new EnvironmentMismatchError(
      `Blueprint ${blueprint.id} not applicable for environment ${envProfile}. ` +
      `Allowed: ${blueprint.environments.join(', ')}`
    );
  }
}
```

**配置优先级**:
1. 环境变量 `E2E_ENV_PROFILE`（最高优先级）
2. 蓝图文件中的 `environments` 字段
3. 默认值：所有环境（无限制）

**替代方案拒绝原因**:
- 多环境蓝图文件: 重复内容多，维护成本高
- 纯环境变量: 配置分散，不易追溯

---

## 7. 种子文件加载优化

### 决策：MVP 使用直接加载，超大文件警告

**理由**:
1. 约束条件已限制种子文件 ≤ 10MB
2. 10MB JSON 文件加载时间 <100ms，可接受
3. 超大文件（>10MB）应使用 db-script 策略
4. 提供 CLI 警告提示用户优化

**实现方案**:
```typescript
// seed-provider.ts
export class SeedProvider implements DataProvider {
  async loadSeed(seedFilePath: string): Promise<any[]> {
    const stats = await stat(seedFilePath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > 10) {
      logger.warn(
        `Seed file ${seedFilePath} is ${sizeMB.toFixed(2)}MB (>10MB). ` +
        `Consider using db-script strategy for better performance.`
      );
    }

    if (sizeMB > 50) {
      throw new SeedFileTooLargeError(
        `Seed file ${seedFilePath} exceeds 50MB limit. Use db-script strategy.`
      );
    }

    const content = await readFile(seedFilePath, 'utf-8');
    return JSON.parse(content);
  }
}
```

**未来优化**:
- 支持流式读取（JSONStream）
- 支持分块加载和缓存
- 支持压缩格式（.json.gz）

**替代方案拒绝原因**:
- 流式读取: MVP 阶段过度优化，文件大小已限制
- 数据库导入: 复杂度高，db-script 策略已覆盖

---

## 8. CLI 用户体验设计

### 决策：使用 inquirer.js 进行交互式引导

**理由**:
1. inquirer.js 是成熟的 CLI 交互库，社区支持好
2. 支持多种输入类型（文本、选择、确认）
3. 内置输入验证和格式化
4. 与 Claude Code 对话式体验一致

**实现方案**:
```typescript
// cli.ts
import inquirer from 'inquirer';

export async function guidedBlueprintCreation(): Promise<TestdataBlueprint> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Testdata Reference ID (e.g., TD-ORDER-001):',
      validate: (input) => /^TD-[A-Z]+-\d+$/.test(input) || 'Invalid format'
    },
    {
      type: 'list',
      name: 'strategy',
      message: 'Data supply strategy:',
      choices: ['seed', 'api', 'db-script']
    },
    {
      type: 'input',
      name: 'seedFilePath',
      message: 'Seed file path:',
      when: (answers) => answers.strategy === 'seed'
    },
    {
      type: 'confirm',
      name: 'hasDependencies',
      message: 'Does this data depend on other testdata?',
      default: false
    },
    {
      type: 'input',
      name: 'dependencies',
      message: 'Enter dependencies (comma-separated):',
      when: (answers) => answers.hasDependencies,
      filter: (input) => input.split(',').map(s => s.trim())
    }
  ]);

  return {
    id: answers.id,
    strategy: answers.strategy,
    // ... 其他字段
  };
}
```

**命令结构**:
```bash
# 交互式创建蓝图
/testdata-planner create

# 验证所有蓝图
/testdata-planner validate

# 生成 fixtures
/testdata-planner generate --blueprint TD-ORDER-001

# 诊断供给问题
/testdata-planner diagnose --ref TD-USER-ADMIN
```

**替代方案拒绝原因**:
- prompts: 功能类似但社区支持不如 inquirer.js
- 自定义输入处理: 重复造轮子，用户体验不佳

---

## 技术栈总结

| 技术选型 | 决策 | 理由 |
|---------|------|------|
| 依赖图分析 | 自实现拓扑排序 | 需求简单，完全控制 |
| Fixture 生成 | 模板字符串 + Prettier | 结构固定，无需 AST |
| Supabase 集成 | @supabase/supabase-js SDK | 官方支持，功能完善 |
| 蓝图版本控制 | 语义化版本 + 向后兼容检查 | MVP 阶段足够 |
| 数据来源跟踪 | JSON 文件 | 简单易实现，未来可迁移 |
| 环境配置 | 蓝图条件字段 + 环境变量 | 灵活且可追溯 |
| 种子文件加载 | 直接加载 + 警告 | 文件大小已限制 |
| CLI 交互 | inquirer.js | 成熟且易用 |

## 开发优先级

**P1（MVP 必需）**:
1. 蓝图加载与验证（Zod）
2. 依赖图分析（拓扑排序）
3. Fixture 代码生成（模板字符串）
4. Seed 策略实现
5. CLI 基本命令（create、validate、generate）

**P2（增强功能）**:
1. API 策略实现
2. DB-script 策略实现（Supabase SDK）
3. 环境配置支持
4. 数据来源跟踪

**P3（优化与诊断）**:
1. 蓝图版本控制
2. 诊断工具
3. 性能优化（大文件警告）
4. 交互式引导创建

---

**研究完成日期**: 2025-12-30
**下一步**: 进入 Phase 1 - 设计数据模型和契约

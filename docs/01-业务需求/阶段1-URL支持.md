# 阶段 1: URL 支持增强

**@spec T004-lark-project-management**

**阶段**: 1/4
**工作量**: 1 天
**风险等级**: 🟢 低
**依赖**: 无

---

## 📋 目标

增强 `lark-pm init` 命令的用户体验，支持用户直接粘贴飞书 Base App 完整 URL，自动提取 Token。

---

## 🎯 业务价值

### 当前痛点
用户在飞书中复制 Base App 地址时，得到的是完整 URL：
```
https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb
```

但 init 命令要求用户手动提取 Token 部分（`Y05Mb7greapFiSseRpoc5XkXnrb`），容易出错。

### 改进后
用户可以直接粘贴完整 URL，系统自动提取 Token：
```bash
请输入 Base App Token 或完整 URL:
示例 1（Token）: Y05Mb7greapFiSseRpoc5XkXnrb
示例 2（URL）: https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb

Base App Token/URL: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb
✓ 已提取 Token: Y05Mb7greapFiSseRpoc5XkXnrb
```

---

## 🔧 技术设计

### 修改文件
- `src/commands/init.ts`

### 核心函数

#### 1. Token 提取函数

```typescript
/**
 * 从飞书 Base App URL 提取 Token
 *
 * @param input - 用户输入（URL 或 Token）
 * @returns Token 字符串，如果提取失败返回 null
 *
 * @example
 * extractBaseAppToken('Y05Mb7greapFiSseRpoc5XkXnrb')
 * // 返回: 'Y05Mb7greapFiSseRpoc5XkXnrb'
 *
 * @example
 * extractBaseAppToken('https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb')
 * // 返回: 'Y05Mb7greapFiSseRpoc5XkXnrb'
 *
 * @example
 * extractBaseAppToken('https://feishu.cn/invalid-url')
 * // 返回: null
 */
function extractBaseAppToken(input: string): string | null {
  const trimmed = input.trim()

  // 如果输入为空，返回 null
  if (!trimmed) {
    return null
  }

  // 如果是 URL，提取 Token
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // 匹配 /base/<token> 模式
    // Token 格式: 字母、数字、下划线、连字符
    const match = trimmed.match(/\/base\/([A-Za-z0-9_-]+)/)

    if (match && match[1]) {
      return match[1]
    }

    // URL 格式不正确
    return null
  }

  // 否则假设是直接输入的 Token
  // 验证 Token 格式（字母、数字、下划线、连字符）
  if (/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed
  }

  // 格式不正确
  return null
}
```

#### 2. 修改 init 命令交互逻辑

**修改位置**: `src/commands/init.ts` 第 50-101 行

**当前代码**:
```typescript
while (retries < MAX_RETRIES && !baseAppToken) {
  console.log(
    chalk.cyan(
      '\n请输入已存在的 Lark Base App Token (从飞书多维表格 URL 或配置中获取):'
    )
  )
  const input = await question(chalk.gray('Base App Token: '))

  if (!input.trim()) {
    console.log(chalk.red('✗ Token 不能为空'))
    retries++
    continue
  }

  // 验证 Token
  const validationSpinner = ora('验证 Token 有效性...').start()
  // ...
}
```

**修改后**:
```typescript
while (retries < MAX_RETRIES && !baseAppToken) {
  console.log(chalk.cyan('\n请输入已存在的 Lark Base App Token 或完整 URL:'))
  console.log(chalk.gray('示例 1（Token）: Y05Mb7greapFiSseRpoc5XkXnrb'))
  console.log(chalk.gray('示例 2（URL）: https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb'))
  console.log()

  const input = await question(chalk.gray('Base App Token/URL: '))

  if (!input.trim()) {
    console.log(chalk.red('✗ 输入不能为空'))
    retries++
    continue
  }

  // 提取 Token
  const extractedToken = extractBaseAppToken(input)

  if (!extractedToken) {
    console.log(chalk.red('✗ 无法提取 Token，请检查输入格式'))
    console.log(chalk.yellow('  有效格式:'))
    console.log(chalk.yellow('  - Token: Y05Mb7greapFiSseRpoc5XkXnrb'))
    console.log(chalk.yellow('  - URL: https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb'))
    retries++
    continue
  }

  // 如果从 URL 提取了 Token，显示提示
  if (extractedToken !== input.trim()) {
    console.log(chalk.gray(`✓ 已提取 Token: ${extractedToken}`))
  }

  // 验证 Token
  const validationSpinner = ora('验证 Token 有效性...').start()
  const client = new LarkClient()

  try {
    await client.listTables(extractedToken)
    baseAppToken = extractedToken
    validationSpinner.succeed(chalk.green('✓ Token 验证成功'))
  } catch (error: any) {
    validationSpinner.fail(chalk.red('✗ Token 验证失败'))
    console.log(
      chalk.yellow(
        `错误: ${error.message || '无法访问该 Base App，请检查 Token 和权限'}`
      )
    )
    retries++

    if (retries < MAX_RETRIES) {
      console.log(chalk.gray(`剩余重试次数: ${MAX_RETRIES - retries}`))
    }
  }
}
```

---

## ✅ 验收标准

### 功能测试

#### 测试用例 1: 直接输入 Token
**输入**:
```
Base App Token/URL: Y05Mb7greapFiSseRpoc5XkXnrb
```

**预期输出**:
```
验证 Token 有效性...
✓ Token 验证成功
```

---

#### 测试用例 2: 输入完整 URL
**输入**:
```
Base App Token/URL: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb
```

**预期输出**:
```
✓ 已提取 Token: Y05Mb7greapFiSseRpoc5XkXnrb
验证 Token 有效性...
✓ Token 验证成功
```

---

#### 测试用例 3: 输入无效 URL
**输入**:
```
Base App Token/URL: https://feishu.cn/invalid-url
```

**预期输出**:
```
✗ 无法提取 Token，请检查输入格式
  有效格式:
  - Token: Y05Mb7greapFiSseRpoc5XkXnrb
  - URL: https://xxx.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb
剩余重试次数: 2
```

---

#### 测试用例 4: 输入包含特殊字符的 Token
**输入**:
```
Base App Token/URL: Y05Mb7gre_ap-Fi-Sse-Rp-oc5XkXnrb
```

**预期输出**:
```
验证 Token 有效性...
✓ Token 验证成功
```

---

#### 测试用例 5: 输入空字符串
**输入**:
```
Base App Token/URL:
```

**预期输出**:
```
✗ 输入不能为空
剩余重试次数: 2
```

---

### 性能测试
- Token 提取响应时间 < 100ms
- 不影响现有 Token 验证逻辑性能

### 兼容性测试
- 现有直接输入 Token 的方式仍可正常工作
- 现有配置文件（config.json）无需修改

---

## 📝 文档更新

### 1. 更新 QUICKSTART.md

**位置**: `specs/T004-lark-project-management/quickstart.md` 第 62-80 行

**当前内容**:
```markdown
2. **Provide Base App Token**: You'll be prompted to enter your existing Base App Token
   - Find it in the Base App URL: `https://your-domain.feishu.cn/base/YOUR_BASE_APP_TOKEN`
   - The token will be validated with 3 retry attempts
```

**修改后**:
```markdown
2. **Provide Base App Token or URL**: You can input in two ways:

   **Option 1: Paste complete URL** (Recommended)
   - Copy the Base App URL from Feishu: `https://your-domain.feishu.cn/base/YOUR_BASE_APP_TOKEN`
   - Paste it directly, the system will auto-extract the token

   **Option 2: Input token manually**
   - Extract the token part from URL: `YOUR_BASE_APP_TOKEN`
   - Input the token directly

   The token will be validated with 3 retry attempts.
```

---

### 2. 更新 skill.md

**位置**: `.claude/skills/lark-pm/skill.md` 第 29 行

**当前内容**:
```markdown
1. Copy `.env.example` to `.env` and configure your Lark credentials
2. Run `npm install` to install dependencies
3. Initialize the Base App: `/lark-pm init`
```

**修改后**:
```markdown
1. Copy `.env.example` to `.env` and configure your Lark credentials
2. Run `npm install` to install dependencies
3. Initialize the Base App: `/lark-pm init`
   - You can input Base App Token directly, or paste the complete URL
   - Example URL: `https://your-domain.feishu.cn/base/YOUR_TOKEN`
```

---

## 🧪 测试计划

### 单元测试

创建测试文件: `tests/commands/init.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { extractBaseAppToken } from '../../src/commands/init'

describe('extractBaseAppToken', () => {
  it('should extract token from complete URL', () => {
    const url = 'https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb'
    expect(extractBaseAppToken(url)).toBe('Y05Mb7greapFiSseRpoc5XkXnrb')
  })

  it('should extract token from URL with query params', () => {
    const url = 'https://xxx.feishu.cn/base/ABC123xyz?view=vwxxx'
    expect(extractBaseAppToken(url)).toBe('ABC123xyz')
  })

  it('should return token if input is already a token', () => {
    const token = 'Y05Mb7greapFiSseRpoc5XkXnrb'
    expect(extractBaseAppToken(token)).toBe('Y05Mb7greapFiSseRpoc5XkXnrb')
  })

  it('should handle token with underscores and hyphens', () => {
    const token = 'ABC_123-xyz'
    expect(extractBaseAppToken(token)).toBe('ABC_123-xyz')
  })

  it('should return null for invalid URL', () => {
    const invalidUrl = 'https://feishu.cn/invalid-path'
    expect(extractBaseAppToken(invalidUrl)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(extractBaseAppToken('')).toBeNull()
    expect(extractBaseAppToken('   ')).toBeNull()
  })

  it('should return null for invalid token format', () => {
    const invalidToken = 'ABC@123#XYZ'
    expect(extractBaseAppToken(invalidToken)).toBeNull()
  })
})
```

---

### 集成测试

手动测试流程：

```bash
# 1. 启动 init 命令
cd .claude/skills/lark-pm
npm run dev init

# 2. 测试直接输入 Token
Base App Token/URL: Y05Mb7greapFiSseRpoc5XkXnrb

# 3. 测试输入完整 URL
Base App Token/URL: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb

# 4. 测试错误输入
Base App Token/URL: invalid-input

# 5. 验证配置文件
cat config.json
# 确认 baseAppToken 字段正确
```

---

## 📦 交付清单

### 代码变更
- [ ] 新增 `extractBaseAppToken()` 函数
- [ ] 修改 `init.ts` 中的交互逻辑
- [ ] 更新错误提示信息

### 测试
- [ ] 单元测试通过（`npm test`）
- [ ] 手动集成测试通过
- [ ] 边界情况测试通过

### 文档
- [ ] 更新 `QUICKSTART.md`
- [ ] 更新 `skill.md`
- [ ] 添加代码注释

### 验证
- [ ] 现有功能无回归
- [ ] URL 提取准确率 100%
- [ ] 错误提示友好

---

## 🚀 部署步骤

1. **开发**:
   ```bash
   cd .claude/skills/lark-pm
   # 修改 src/commands/init.ts
   npm run build
   ```

2. **测试**:
   ```bash
   npm run test
   npm run dev init  # 手动测试
   ```

3. **提交**:
   ```bash
   git add src/commands/init.ts tests/commands/init.test.ts
   git add .claude/skills/lark-pm/skill.md
   git add specs/T004-lark-project-management/quickstart.md
   git commit -m "feat(T004): 阶段1 - 支持从 URL 自动提取 Base App Token

   - 新增 extractBaseAppToken() 函数
   - init 命令支持粘贴完整飞书 URL
   - 增强错误提示信息
   - 更新相关文档

   Closes #阶段1"
   ```

4. **验证**:
   ```bash
   # 在干净环境测试
   rm -f config.json
   npm run dev init
   # 输入 URL 测试
   ```

---

## ⚠️ 注意事项

1. **Token 格式变化**:
   - 当前假设 Token 格式为 `[A-Za-z0-9_-]+`
   - 如果飞书未来修改 Token 格式，需要更新正则表达式

2. **URL 模式**:
   - 当前支持 `/base/<token>` 模式
   - 未来可能需要支持其他 URL 格式（如 `/wiki/`, `/docx/`）

3. **错误处理**:
   - 提取失败时给出清晰的格式示例
   - 避免用户多次尝试无效输入

4. **向后兼容**:
   - 必须保持现有直接输入 Token 的方式可用
   - 不能破坏现有配置文件格式

---

## 📊 成功指标

- [ ] 用户可以直接粘贴 URL 完成 init（100% 测试通过）
- [ ] URL 提取准确率 100%
- [ ] 现有功能 0 回归
- [ ] 文档更新完成率 100%

---

**下一阶段**: [阶段 2: 命令结构标准化](./phase-2-command-standardization.md)

**版本**: 1.0.0
**最后更新**: 2025-12-31

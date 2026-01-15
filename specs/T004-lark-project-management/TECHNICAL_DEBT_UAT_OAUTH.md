# 技术债：实现飞书 MCP 文档导入的 OAuth 2.0 用户授权流程

**@spec T004-lark-project-management**

## 基本信息

- **债务标题**: 实现飞书 MCP 文档导入的 OAuth 2.0 用户授权流程
- **严重程度**: 🟠 High
- **状态**: 📝 待处理
- **spec_id**: T004-lark-project-management
- **创建时间**: 2026-01-01
- **预估工时**: 6 小时

## 问题描述

当前 `lark-mcp` 的 `docx_builtin_import` 工具需要 `user_access_token` (UAT) 才能导入文档到用户飞书空间，但 UAT 需要用户手动登录授权获取，存在以下问题：

1. **UAT 定期过期**：需要频繁手动更新
2. **无法自动化**：依赖手动操作，无法集成到 CI/CD
3. **用户体验差**：每次使用前需要先去飞书开放平台获取新 token

## 技术背景

### Token 类型对比

| Token 类型 | 获取方式 | 适用场景 | 有效期 |
|-----------|---------|---------|--------|
| tenant_access_token | APP_ID + APP_SECRET | 应用级操作 | 2 小时（可自动刷新） |
| user_access_token | OAuth 2.0 用户授权 | 用户级操作 | 24 小时（需手动刷新） |

### 为什么 docx_builtin_import 需要 UAT？

```
文档导入操作：
- 在用户的个人飞书空间创建文档 ❌ 不能用 tenant_access_token
- 使用用户身份进行操作 ❌ 不能用应用身份
- 需要用户明确授权 ✅ 必须用 user_access_token
```

## 影响范围

**受影响的功能**：
- ✅ 文档自动导入到飞书（`mcp__lark-mcp__docx_builtin_import`）
- ✅ 用户级别的文档搜索（`mcp__lark-mcp__docx_builtin_search`）
- ❌ Base 多维表格操作（可用 tenant_access_token）

**当前阻塞的任务**：
- 自动导入 `LARK_TABLE_GUIDE_SIMPLE.md` 到飞书作为使用说明文档

## 解决方案

### 方案 1：OAuth 2.0 自动授权流程（推荐）

**实现步骤**：

```typescript
/**
 * @spec T004-lark-project-management
 * OAuth 2.0 用户授权助手
 */
export class LarkOAuthHelper {
  private readonly APP_ID = process.env.LARK_APP_ID!
  private readonly APP_SECRET = process.env.LARK_APP_SECRET!
  private readonly REDIRECT_URI = 'http://localhost:8080/callback'

  /**
   * 启动 OAuth 授权流程
   */
  async authorize(): Promise<string> {
    // 1. 启动本地 HTTP 服务器
    const server = this.createCallbackServer()

    // 2. 生成授权 URL
    const authUrl = this.buildAuthUrl()

    // 3. 打开浏览器
    console.log('正在打开浏览器进行授权...')
    open(authUrl)

    // 4. 等待回调
    const code = await server.waitForCallback()

    // 5. 交换 code 为 UAT
    const uat = await this.exchangeCodeForToken(code)

    // 6. 保存到 .env
    this.saveTokenToEnv(uat)

    console.log('✅ 授权成功！UAT 已保存到 .env 文件')
    return uat
  }

  /**
   * 刷新 UAT
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/refresh_access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          app_id: this.APP_ID,
          app_secret: this.APP_SECRET,
        }),
      }
    )

    const data = await response.json()
    return data.data.access_token
  }
}
```

**使用方式**：

```bash
# 首次使用或 UAT 过期时
/lark-pm auth

# 系统会自动：
# 1. 打开浏览器
# 2. 跳转到飞书授权页面
# 3. 用户点击「同意授权」
# 4. 自动获取 UAT 并保存到 .env
# 5. 完成！
```

**优点**：
- ✅ 一次授权，长期使用（可以自动刷新）
- ✅ 符合 OAuth 2.0 安全标准
- ✅ 用户体验好（只需点击一次同意）

**工作量**：
- **开发时间**: 6 小时
  - OAuth 服务器实现：2 小时
  - Token 交换逻辑：1 小时
  - Token 刷新机制：1 小时
  - CLI 命令集成：1 小时
  - 测试和文档：1 小时

### 方案 2：使用应用级 API（如果存在）

**需要研究**：
- 飞书是否提供应用级别的文档导入 API
- 文档是否可以创建在应用空间而非用户空间

**调研任务**：
- [ ] 查阅飞书开放平台文档
- [ ] 测试 `docx_builtin_import` 使用 tenant_access_token 是否可行
- [ ] 咨询飞书技术支持

**优点**：
- ✅ 无需用户授权
- ✅ 实现简单

**缺点**：
- ❌ 可能不支持（文档通常属于用户而非应用）

### 方案 3：手动更新 Token（临时方案）

**步骤**：
1. 访问 https://open.feishu.cn/app/cli_a9a550b1ec78dcd5
2. 获取新的 User Access Token
3. 更新 `.claude/skills/lark-pm/.env` 文件

**优点**：
- ✅ 立即可用

**缺点**：
- ❌ 需要频繁手动操作
- ❌ UAT 有效期仅 24 小时

## 实施计划

### Phase 1: 快速修复（立即）

- [x] 记录技术债到本地文档
- [ ] 用户手动更新 UAT token
- [ ] 完成文档导入任务

### Phase 2: OAuth 2.0 实现（下一个 Sprint）

- [ ] 设计 OAuth 授权流程
- [ ] 实现本地 HTTP 回调服务器
- [ ] 实现 Token 交换和刷新逻辑
- [ ] 集成到 lark-pm CLI
- [ ] 编写单元测试
- [ ] 更新文档

### Phase 3: 长期优化（未来）

- [ ] Token 过期自动检测和刷新
- [ ] 多用户支持
- [ ] Token 安全存储（使用 Keychain/Credential Manager）

## 参考资料

- [飞书开放平台 - OAuth 2.0 授权](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)
- [飞书开放平台 - 获取 user_access_token](https://open.feishu.cn/document/common-capabilities/sso/api/obtain-user-access-token)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)

## 成功指标

- [ ] 用户只需点击一次「同意授权」即可获取 UAT
- [ ] Token 有效期内自动刷新，无需手动操作
- [ ] 文档导入成功率 100%
- [ ] 授权流程耗时 < 30 秒

---

**创建人**: Claude Code
**待同步到飞书**: 是（UAT 更新后）

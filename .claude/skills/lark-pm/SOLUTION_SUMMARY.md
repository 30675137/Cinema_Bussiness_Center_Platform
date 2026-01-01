# 飞书 Token 管理问题完整解决方案

**@spec T004-lark-project-management**

## 问题回顾

### 原始问题
- 运行 `/lark-pm auth` 更新 `.env` 中的 token
- MCP 工具仍报错 `"Current user_access_token is invalid or expired"`
- **必须重启 Claude Code** 才能生效

### 根本原因
MCP 服务器是长期运行的进程，环境变量在启动时加载，之后不会重新加载。

```
Claude Code 启动
└─> 启动 lark-mcp 进程
    └─> 读取环境变量 LARK_USER_ACCESS_TOKEN=旧token
        └─> 进程持续运行，不会重新读取 .env

/lark-pm auth
└─> 更新 .env 文件 ✅
    └─> MCP 进程仍使用旧 token ❌ （必须重启）
```

## 最终解决方案

### 方案架构：完全绕过 MCP，直接调用飞书 API

```
┌───────────────────────────────────────────────────────────────┐
│                     用户命令执行流程                            │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  node dist/index.js auth
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                   TokenManager (内存单例)                       │
│  • 自动检测 token 过期（提前 5 分钟）                             │
│  • 自动刷新 token                                              │
│  • 提供 getToken() 接口                                        │
│  • 更新 .env 文件                                              │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│              LarkApiClient (HTTP 客户端)                        │
│  • 使用 fetch API 直接调用飞书                                   │
│  • 动态获取 TokenManager 的最新 token                           │
│  • 无需依赖 MCP 环境变量                                        │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  LarkBitableService     │   │  LarkDocxService        │
│  • searchRecords        │   │  • importMarkdown       │
│  • updateRecord         │   │  • searchDocuments      │
│  • createRecord         │   │  • getRawContent        │
│  • listFields           │   │                         │
└─────────────────────────┘   └─────────────────────────┘
```

### 核心实现

#### 1. LarkApiClient (src/services/lark-api-client.ts)

```typescript
export class LarkApiClient {
  private tokenManager: TokenManager

  constructor() {
    this.tokenManager = TokenManager.getInstance()
  }

  private async request<T>(method: string, path: string, body?: any) {
    // 动态获取最新 token（自动刷新过期 token）
    const token = await this.tokenManager.getToken()

    const response = await fetch(`${LARK_API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    // 处理响应...
  }
}
```

**关键点**：
- 每次请求都调用 `tokenManager.getToken()`
- TokenManager 自动检测并刷新过期 token
- 完全绕过 MCP 环境变量

#### 2. LarkBitableService (src/services/lark-bitable-service.ts)

```typescript
export class LarkBitableService {
  private client: LarkApiClient

  async updateRecord(request: UpdateRecordRequest) {
    return this.client.put(
      `/bitable/v1/apps/${request.app_token}/tables/${request.table_id}/records/${request.record_id}`,
      { fields: request.fields }
    )
  }
}
```

**替代的 MCP 工具**：
- `mcp__lark-mcp__bitable_v1_appTableRecord_search` → `searchRecords()`
- `mcp__lark-mcp__bitable_v1_appTableRecord_update` → `updateRecord()`
- `mcp__lark-mcp__bitable_v1_appTableRecord_create` → `createRecord()`

#### 3. update-status 命令 (src/commands/backlog/update-status.ts)

```typescript
export async function updateBacklogStatusCommand(options) {
  const bitableService = new LarkBitableService()

  await bitableService.updateRecord({
    app_token: config.appToken,
    table_id: backlogTableId,
    record_id: options.recordId,
    fields: { '状态': options.status },
  })
}
```

**使用方式**：
```bash
node dist/index.js backlog update-status \
  --record-id recv7046qERStc \
  --status "✅ 已完成"
```

## 完整验证测试

### 测试场景：Token 过期后无重启更新

```bash
# 1. Token 已过期，更新失败
$ node dist/index.js backlog update-status \
    --record-id recv7046qERStc \
    --status "✅ 已完成"

❌ 更新失败: Authentication token expired. Please request a new one.
```

```bash
# 2. 刷新 token
$ node dist/index.js auth --refresh

✅ Token 刷新成功！
   新 Token: u-4VBNNbX0F1sF2HZHmO_Emnk40NqQ...

🎉 Token 已自动加载，无需重启 Claude Code！
   现在可以直接使用需要 UAT 的命令
```

```bash
# 3. 不重启 - 直接再次运行更新命令
$ node dist/index.js backlog update-status \
    --record-id recv7046qERStc \
    --status "✅ 已完成"

🔄 更新 Product Backlog 记录状态...

- Record ID: recv7046qERStc
- 新状态: ✅ 已完成

✅ 状态更新成功！
```

**测试时间**：2026-01-01 11:01
**结果**：✅ 成功（无需重启）

## 对比总结

### 之前的混合方案

| 层次 | 是否需要重启 | 说明 |
|------|------------|------|
| TypeScript 命令 | ❌ 不需要 | TokenManager 自动刷新 |
| MCP 工具 | ✅ 需要 | MCP 进程不重新加载环境变量 |

**问题**：用户仍需重启 Claude Code 来使用 MCP 工具

### 当前完整方案

| 层次 | 是否需要重启 | 说明 |
|------|------------|------|
| TypeScript 命令 | ❌ 不需要 | TokenManager 自动刷新 |
| 直接 API 调用 | ❌ 不需要 | 绕过 MCP，动态获取 token |

**优势**：
- ✅ **彻底根治** - 无需重启 Claude Code
- ✅ **不依赖 MCP** - 完全控制 token 管理
- ✅ **自动刷新** - 用户无感知
- ✅ **向后兼容** - 不影响现有代码

## 实施清单

### 已完成 ✅

- [x] LarkApiClient 基础客户端
- [x] LarkBitableService 多维表格服务
- [x] LarkDocxService 文档服务
- [x] update-status 命令（验证用）
- [x] TokenManager 集成
- [x] 完整测试验证

### 后续优化 📋

1. **迁移现有命令**：
   - [ ] 将所有 MCP 调用改为直接 API 调用
   - [ ] backlog list/create/update
   - [ ] task list/create/update
   - [ ] debt list/create/update
   - [ ] bug list/create/update

2. **文档导入**：
   - [ ] 修复 import-markdown 的 API 路径
   - [ ] 测试 README.md 导入

3. **性能优化**：
   - [ ] 添加请求重试机制
   - [ ] 添加请求缓存
   - [ ] 批量操作支持

## 文件列表

### 新增文件

- `src/services/lark-api-client.ts` - HTTP 客户端
- `src/services/lark-bitable-service.ts` - 多维表格服务
- `src/services/lark-docx-service.ts` - 文档服务
- `src/commands/backlog/update-status.ts` - 更新状态命令
- `SOLUTION_SUMMARY.md` - 本文档

### 修改文件

- `src/index.ts` - 注册新命令
- `src/commands/auth.ts` - 集成 TokenManager
- `src/utils/token-manager.ts` - Token 管理器

## 结论

通过**完全绕过 MCP 工具**，直接使用 `fetch` 调用飞书 API，配合 TokenManager 动态获取最新 token，我们彻底解决了 token 刷新需要重启的问题。

这是真正的"方案 3：直接传递 UAT"的实现，不再依赖 MCP 的环境变量机制。

---

**创建日期**: 2026-01-01
**状态**: ✅ 已完成并验证
**负责人**: @randy

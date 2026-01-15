# MCP 环境变量刷新限制

**@spec T004-lark-project-management**

## 当前状态

TokenManager 解决方案已实现（2026-01-01），但仍存在一个**架构级别的限制**。

## 限制说明

### TypeScript 命令 ✅
- 运行 `/lark-pm auth` 后立即可用
- Token 自动刷新，无需重启
- `get-token` 命令返回最新有效 token

### MCP 工具调用 ❌
- MCP 服务器进程在 Claude Code 启动时加载环境变量
- 运行 `/lark-pm auth` 更新 `.env` 后，**MCP 进程仍使用旧 token**
- 必须**重启 Claude Code** 才能让 MCP 工具读取新 token

## 实际测试

### 测试 1: TypeScript 命令（成功）
```bash
$ node dist/index.js get-token
{
  "success": true,
  "token": "u-7Ax8rY5CxalbGuhgP6CcdEk40Xgkh4Ujjoaaiww02yM0",
  "expiresAt": "2026-01-01T04:35:12.705Z",
  "message": "Token is valid"
}
```

### 测试 2: MCP 工具调用（失败）
```javascript
mcp__lark-mcp__docx_builtin_import({
  data: { file_name: "Lark PM", markdown: "..." },
  useUAT: true
})

// 结果：
{
  "errorMessage": "Current user_access_token is invalid or expired"
}
```

**原因**：MCP 服务器进程的环境变量未刷新。

## 根本原因

```
Claude Code 启动
└─> 启动 lark-mcp 进程
    └─> 加载环境变量（LARK_USER_ACCESS_TOKEN=旧token）
        └─> MCP 进程持续运行，不会重新读取 .env

/lark-pm auth（在 Claude Code 会话中）
└─> TokenManager.setToken(新token) ✅
└─> 更新 .env 文件 ✅
└─> MCP 进程仍使用旧 token ❌
```

## 解决方案

### 当前唯一可行方案：重启 Claude Code

1. 运行 `/lark-pm auth` 完成 OAuth
2. **重启 Claude Code CLI**
3. MCP 工具即可使用新 token

### 未来可能的优化方向

#### 方案 A：MCP 协议扩展（需 MCP 规范支持）
- MCP 协议增加 `reload-config` 消息
- TypeScript 通过 IPC 通知 MCP 服务器重载环境变量
- **限制**：需要修改 MCP 规范和 lark-mcp 实现

#### 方案 B：动态 Token 传递（需修改 MCP API）
- MCP 工具支持直接接收 token 参数（而非从环境变量读取）
- TypeScript 调用 MCP 时传递 `userAccessToken: getCurrentToken()`
- **限制**：需要修改 lark-mcp 服务器 API，影响所有调用方

#### 方案 C：Claude Code 内置支持（最理想）
- Claude Code 提供环境变量热更新机制
- 修改 `.env` 后自动重载 MCP 服务器
- **限制**：需要 Claude Code 核心团队支持

## 对用户的影响

### 场景 1：OAuth 授权后
- **TypeScript 命令**：立即可用 ✅
- **MCP 工具**：需重启 Claude Code ⚠️

### 场景 2：Token 自动刷新
- **TypeScript 命令**：自动刷新，无感知 ✅
- **MCP 工具**：需重启 Claude Code ⚠️

### 场景 3：日常使用
- **如果 token 未过期**：一切正常 ✅
- **如果 token 过期**：需运行 `/lark-pm auth` 并重启 ⚠️

## 用户指南

### 推荐工作流程

1. **首次配置**：
   ```bash
   /lark-pm auth
   # 重启 Claude Code
   ```

2. **Token 过期时**：
   ```bash
   /lark-pm auth
   # 重启 Claude Code
   ```

3. **日常使用**：
   - TypeScript 命令无需任何操作
   - MCP 工具在 token 有效期内正常使用

### 错误处理

如果看到 `"Current user_access_token is invalid or expired"` 错误：

1. 运行 `node dist/index.js get-token` 检查 token 状态
2. 如果 token 有效但 MCP 报错，说明需要重启 Claude Code
3. 如果 token 过期，运行 `/lark-pm auth` 并重启

## 技术总结

TokenManager 成功解决了 **TypeScript 层面**的 token 管理问题，但 **MCP 层面**受限于以下因素：

1. **进程隔离**：MCP 服务器是独立进程，有自己的环境变量副本
2. **MCP 协议限制**：当前 MCP 协议不支持动态配置更新
3. **架构设计**：Claude Code 将 MCP 服务器作为长期运行的子进程

这是一个**架构级别的限制**，不是代码 bug，需要在更高层次解决。

---

**创建日期**: 2026-01-01
**状态**: Known Limitation
**优先级**: P2（用户体验优化）
**负责人**: @randy

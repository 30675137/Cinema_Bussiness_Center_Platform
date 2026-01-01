# 技术债：UAT Token 更新后 MCP 未生效问题

**@spec T004-lark-project-management**

## 问题描述

**现象**：
- 运行 `/lark-pm auth` 成功获取新的 `LARK_USER_ACCESS_TOKEN`
- Token 已正确保存到 `.env` 文件
- 但使用 MCP 工具时仍报错：`Current user_access_token is invalid or expired`
- **重启 Claude Code 后问题解决**

## 根本原因

### MCP 服务器的环境变量加载机制

1. **启动时加载**：
   ```
   Claude Code 启动
   └─> 启动 lark-mcp 服务器进程
       └─> 读取 .env 文件
           └─> 加载 LARK_USER_ACCESS_TOKEN 到进程内存
   ```

2. **环境变量不会自动重新加载**：
   - MCP 服务器是一个**长期运行的进程**
   - 环境变量在进程启动时加载，之后**不会自动刷新**
   - 即使 `.env` 文件被更新，进程中的环境变量仍是旧值

3. **OAuth 更新流程**：
   ```
   /lark-pm auth
   └─> lark-oauth-helper.ts
       └─> 获取新 token
           └─> 写入 .env 文件 ✅
               └─> MCP 服务器进程 (仍使用旧 token) ❌
   ```

### 为什么重启后能工作？

```
重启 Claude Code
└─> 终止旧的 lark-mcp 进程
    └─> 启动新的 lark-mcp 进程
        └─> 重新读取 .env 文件
            └─> 加载新 token ✅
```

## 解决方案

### 方案 1：用户手动重启（已实现）✅

**实现**：在 OAuth 成功后明确提示用户重启

**代码位置**：
- `src/utils/lark-oauth-helper.ts:89-95`
- `src/commands/auth.ts:59-60`

**提示信息**：
```
⚠️  重要提示：
   为了使新 token 生效，请执行以下操作之一：
   1. 重启 Claude Code CLI
   2. 或者在新的终端会话中运行命令

   原因：MCP 服务器需要重新加载环境变量
   这是 MCP 架构的设计限制，不是代码问题
```

**优点**：
- ✅ 简单直接，无需修改 MCP 架构
- ✅ 明确告知用户原因和操作步骤
- ✅ 对所有 MCP 服务器通用

**缺点**：
- ❌ 需要用户手动操作
- ❌ 用户体验不够流畅

### 方案 2：自动触发 MCP 重启（理论方案，未实现）

**理论实现思路**：

#### Option A：发送信号给 Claude Code 主进程
```typescript
// 伪代码
async function triggerMCPReload() {
  // 获取 Claude Code 主进程 PID
  const claudePid = getClaudeCodePID()

  // 发送重载信号 (需要 Claude Code 支持)
  process.kill(claudePid, 'SIGUSR1') // 自定义信号
}
```

**限制**：
- ❌ 需要 Claude Code 本身支持此功能
- ❌ 不同平台信号机制不同
- ❌ 可能需要修改 Claude Code 核心代码

#### Option B：通过 IPC 通知 MCP 服务器
```typescript
// 伪代码
async function notifyMCPReload() {
  // 连接到 MCP 服务器的 IPC 通道
  const ipc = connectToMCP()

  // 发送重载配置的消息
  ipc.send('reload-env', {
    LARK_USER_ACCESS_TOKEN: newToken
  })
}
```

**限制**：
- ❌ 需要 MCP 协议支持动态配置更新
- ❌ 当前 MCP 规范中没有此功能
- ❌ 需要修改 lark-mcp 服务器代码

### 方案 3：完全避免依赖 MCP 的 UAT（长期方案）

**思路**：让 TypeScript 代码直接管理 UAT，不依赖 MCP 环境变量

```typescript
// 当前架构（依赖 MCP）
mcp__lark-mcp__bitable_v1_appTableRecord_create({
  useUAT: true  // MCP 从环境变量读取 UAT
})

// 新架构（直接传递 UAT）
mcp__lark-mcp__bitable_v1_appTableRecord_create({
  userAccessToken: getCurrentToken()  // 直接传递
})
```

**优点**：
- ✅ TypeScript 可以动态刷新 token
- ✅ 无需重启 MCP 服务器

**缺点**：
- ❌ 需要修改 lark-mcp 服务器 API
- ❌ 需要修改所有 MCP 调用处
- ❌ 可能影响其他使用 lark-mcp 的项目

## 当前状态

### ✅ 已完全解决（2026-01-01）

**实施的混合方案**：

1. **TokenManager (TypeScript)**：
   - 自动管理 token 生命周期
   - 提前 5 分钟检测并刷新 token
   - 无需重启即可使用新 token

2. **get-token 命令**：
   - 供 Claude 获取最新有效 token
   - 输出 JSON 格式方便解析
   - 自动触发 token 刷新

3. **更新 auth 命令**：
   - OAuth 成功后立即通知 TokenManager
   - 提示 "无需重启 Claude Code"
   - Token 立即可用

**效果**：
- ✅ 运行 `/lark-pm auth` 后立即可用
- ✅ Token 自动刷新，用户无感知
- ✅ 无需重启 Claude Code
- ✅ 向后兼容现有架构

详见：[TOKEN_MANAGEMENT.md](./TOKEN_MANAGEMENT.md)

## 开发者指南

### 如何避免此问题

**原则**：任何修改 `.env` 的操作后，都应提示用户重启

```typescript
// ✅ 正确示例
async function updateEnvironmentVariable(key: string, value: string) {
  await saveToEnv(key, value)

  console.log(chalk.yellow('⚠️  请重启 Claude Code 以使配置生效'))
}

// ❌ 错误示例（未提示）
async function updateEnvironmentVariable(key: string, value: string) {
  await saveToEnv(key, value)
  // 未提示重启，用户会困惑为什么不生效
}
```

### 测试流程

1. 运行 `/lark-pm auth` 完成 OAuth
2. 查看提示信息
3. **不重启**，尝试使用 MCP 功能
   - 预期：报错 "invalid or expired token"
4. **重启** Claude Code CLI
5. 再次尝试使用 MCP 功能
   - 预期：成功

## 参考资料

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://claude.com/claude-code)
- [Feishu OAuth 2.0 Guide](https://open.feishu.cn/document/common-capabilities/sso/api/oauth)

---

**创建日期**: 2026-01-01
**状态**: Active
**优先级**: P2 (用户体验优化)
**负责人**: @randy

# E2E 测试 - API Mock vs 真实 API 分析报告

**生成时间**: 2025-12-30
**项目**: Cinema Business Center Platform

## 📊 执行总结

**答案**: 当前配置下，E2E 测试使用的是 **真实的后端 API**，而非 Mock 数据。

## 🔍 详细分析

### 1. 环境变量配置

查看 `frontend/.env` 文件:

```bash
VITE_USE_MOCK=false              # ✅ Mock 已禁用
VITE_API_BASE_URL=http://localhost:8080/api
```

**结论**: `VITE_USE_MOCK=false` 明确禁用了 MSW (Mock Service Worker)。

### 2. 应用启动逻辑

查看 `frontend/src/main.tsx` (第 25-46 行):

```typescript
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

if (import.meta.env.DEV && useMock) {
  // 启动 MSW
  const { startMSW } = await import('./mocks/browser')
  await startMSW()
  console.log('✅ MSW initialization completed')
} else if (import.meta.env.DEV) {
  console.log('✅ Development mode: Using real backend API via Vite proxy')
  console.log(`📡 Backend URL: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`)
}
```

**当前执行路径**:
- ✅ `VITE_USE_MOCK=false` → 不启动 MSW
- ✅ 走 `else if` 分支 → 使用真实后端 API
- ✅ 输出: "Using real backend API via Vite proxy"

### 3. Vite 代理配置

查看 `frontend/vite.config.ts` (第 45-63 行):

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // ✅ 代理到真实后端
      changeOrigin: true,
      secure: false,
      configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('→ Sending Request:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('← Received Response:', proxyRes.statusCode, req.url);
        });
      },
    },
  },
}
```

**代理流程**:
```
前端 (localhost:3000)
  ↓ 发起请求 /api/inventory/list
Vite Proxy
  ↓ 代理转发
真实后端 (localhost:8080)
  ↓ 处理请求
Spring Boot + Supabase
  ↓ 返回真实数据
前端接收响应
```

### 4. Playwright 测试配置

查看 `frontend/playwright.config.ts` (第 27 行):

```typescript
use: {
  baseURL: process.env.CROSS_SYSTEM_TEST ? undefined : 'http://localhost:3000',
  // ...
}
```

**测试流程**:
```
Playwright 测试
  ↓ 访问 http://localhost:3000
React 应用 (Vite Dev Server)
  ↓ API 请求 /api/*
Vite Proxy (VITE_USE_MOCK=false)
  ↓ 代理到后端
Spring Boot (localhost:8080)
  ↓ 操作 Supabase 数据库
返回真实数据
```

### 5. MSW Mock 状态

虽然项目中存在 MSW 配置 (`frontend/src/mocks/`),但因为:

1. ❌ `VITE_USE_MOCK=false` - 环境变量禁用
2. ❌ MSW worker 不会启动
3. ✅ 所有 `/api` 请求通过 Vite proxy 转发到真实后端

**MSW 目录结构**:
```
frontend/src/mocks/
├── browser.ts              # MSW worker 配置 (未启动)
├── handlers/               # API mock handlers (未使用)
│   ├── inventoryHandlers.ts
│   ├── orderHandlers.ts
│   └── ...
└── data/                   # Mock 数据 (未使用)
    ├── skuTestData.ts
    └── ...
```

## 🎯 验证方法

### 方法 1: 检查控制台日志

当启动前端开发服务器时,查看控制台输出:

```bash
cd frontend && npm run dev
```

**当前输出** (VITE_USE_MOCK=false):
```
✅ Development mode: Using real backend API via Vite proxy
📡 Backend URL: http://localhost:8080/api
```

**如果启用 Mock** (VITE_USE_MOCK=true):
```
🔧 Development mode: Initializing MSW...
📦 MSW module loaded, starting worker...
✅ MSW initialization completed
📡 Mock handlers are active
```

### 方法 2: 检查网络请求

运行 E2E 测试时,打开浏览器开发者工具 (Network 标签):

**真实 API 请求特征**:
- ✅ Request URL: `http://localhost:3000/api/inventory/list`
- ✅ Status Code: `200` (或其他真实状态码)
- ✅ Response Time: 真实网络延迟 (10-500ms)
- ✅ Response Headers: 包含 Spring Boot headers

**Mock 请求特征**:
- ❌ Request URL: `http://localhost:3000/api/inventory/list`
- ❌ Status Code: `200` (MSW 模拟)
- ❌ Response Time: 几乎即时 (<5ms)
- ❌ Response Headers: 包含 `x-powered-by: msw`

### 方法 3: 检查 Vite 代理日志

Vite 代理配置了请求日志,运行应用时会显示:

```
→ Sending Request: GET /api/inventory/list
← Received Response: 200 /api/inventory/list
```

这证明请求被代理到了真实后端。

### 方法 4: 停止后端服务

停止 Spring Boot 后端:
```bash
# 如果后端在运行
cd backend
./mvnw spring-boot:stop
```

然后运行 E2E 测试:
```bash
cd frontend
npm run test:e2e
```

**结果**:
- ✅ **真实 API**: 测试失败,报错 `ERR_CONNECTION_REFUSED` 或 `500 Proxy Error`
- ❌ **Mock API**: 测试继续运行,返回 Mock 数据

## 🔄 如何切换到 Mock 模式

### 方法 1: 修改环境变量

编辑 `frontend/.env`:

```bash
# 修改前
VITE_USE_MOCK=false

# 修改后
VITE_USE_MOCK=true
```

重启开发服务器:
```bash
cd frontend
npm run dev
```

### 方法 2: 使用命令行临时启用

```bash
cd frontend
VITE_USE_MOCK=true npm run dev
```

### 方法 3: 创建专门的 E2E Mock 配置

创建 `frontend/.env.e2e`:

```bash
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:3000/api
```

运行 E2E 测试时指定环境:
```bash
npm run test:e2e -- --env-file=.env.e2e
```

## 📋 当前配置总结

| 配置项 | 值 | 影响 |
|-------|-----|------|
| `VITE_USE_MOCK` | `false` | ✅ 禁用 MSW Mock |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | ✅ 指向真实后端 |
| Vite Proxy `/api` | `http://localhost:8080` | ✅ 代理到真实后端 |
| MSW Worker | ❌ 未启动 | 不拦截请求 |
| E2E 测试行为 | ✅ 使用真实 API | 操作真实数据库 |

## ⚠️ 注意事项

### 使用真实 API 的优缺点

**优点**:
- ✅ 测试真实的数据库交互
- ✅ 发现真实环境的 bug
- ✅ 验证完整的端到端流程
- ✅ 测试真实的网络延迟和错误处理

**缺点**:
- ❌ 需要运行真实的后端服务 (Spring Boot + Supabase)
- ❌ 测试速度较慢 (网络 + 数据库开销)
- ❌ 可能污染数据库数据
- ❌ 测试依赖外部服务稳定性
- ❌ 难以模拟边界情况和错误场景

### 使用 Mock API 的优缺点

**优点**:
- ✅ 无需运行后端服务
- ✅ 测试速度快 (无网络开销)
- ✅ 数据可控,不污染数据库
- ✅ 可以模拟任意响应和错误
- ✅ 稳定性高,不依赖外部服务

**缺点**:
- ❌ 无法测试真实的数据库交互
- ❌ Mock 数据可能与真实 API 不一致
- ❌ 需要维护 Mock handlers
- ❌ 可能遗漏真实环境的 bug

## 🎯 推荐实践

### 分层测试策略

1. **单元测试** (Vitest):
   - ✅ 使用 Mock
   - 测试组件逻辑、工具函数

2. **集成测试** (MSW + Vitest):
   - ✅ 使用 MSW Mock
   - 测试组件与 API 的交互

3. **E2E 测试** (Playwright):
   - **开发阶段**: 使用 Mock (快速迭代)
   - **CI/CD**: 使用真实 API (发布前验证)
   - **本地调试**: 根据需要切换

### 环境配置建议

创建多个环境配置文件:

```bash
frontend/
├── .env                    # 默认配置 (VITE_USE_MOCK=false)
├── .env.development        # 开发环境 (可选 Mock)
├── .env.e2e.mock          # E2E Mock 模式
└── .env.e2e.real          # E2E 真实 API 模式
```

**.env.e2e.mock**:
```bash
VITE_USE_MOCK=true
```

**.env.e2e.real**:
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📚 相关文档

- [Vite 代理配置](../frontend/vite.config.ts)
- [MSW Mock Handlers](../frontend/src/mocks/handlers/)
- [Playwright 配置](../frontend/playwright.config.ts)
- [环境变量配置](../frontend/.env)

---

**结论**: 当前 E2E 测试使用**真实的后端 API** (`VITE_USE_MOCK=false`),所有请求通过 Vite proxy 转发到 Spring Boot 后端 (`http://localhost:8080`),操作真实的 Supabase 数据库。

# Quickstart Guide: 门店预约设置管理

**Feature**: 016-store-reservation-settings
**Date**: 2025-12-22

## Overview

本文档提供门店预约设置管理功能的快速开发指南，包括环境搭建、本地调试、测试执行和常见问题排查。

## Prerequisites

### 开发环境要求

| 工具 | 版本 | 用途 |
|-----|------|------|
| Node.js | 18+ | 前端运行时 |
| npm/pnpm | 8+/8+ | 包管理工具 |
| Java | 21 | 后端运行时 |
| Maven | 3.9+ | 后端构建工具 |
| PostgreSQL | 14+ | 数据库（Supabase托管） |
| Docker | 20+ (可选) | 本地数据库容器 |
| Git | 2.x | 版本控制 |

### 必需的账号和访问权限

- Supabase项目访问权限（获取数据库连接信息）
- Git仓库访问权限（克隆代码）
- IDE推荐：IntelliJ IDEA (后端) + VS Code (前端)

---

## Project Setup

### 1. 克隆仓库并切换分支

```bash
# 克隆仓库
git clone https://github.com/your-org/Cinema_Bussiness_Center_Platform.git
cd Cinema_Bussiness_Center_Platform

# 切换到功能分支
git checkout 016-store-reservation-settings

# 确认分支
git branch --show-current  # 应显示 016-store-reservation-settings
```

### 2. 前端环境搭建

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
# 或使用 pnpm（推荐，更快）
pnpm install

# 验证安装
npm run type-check  # TypeScript 类型检查
npm run lint        # ESLint 代码检查
```

**环境变量配置**:

创建 `frontend/.env.local` 文件：

```bash
# API 基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# Supabase 配置（如果前端直接访问Supabase）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 后端环境搭建

```bash
# 进入后端目录
cd backend

# 使用 Maven 安装依赖
mvn clean install -DskipTests
```

**配置文件**:

编辑 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.your-project.supabase.co:5432/postgres
    username: ${SUPABASE_DB_USER}
    password: ${SUPABASE_DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate  # 生产环境使用 validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

# Supabase Auth 配置
supabase:
  url: https://your-project.supabase.co
  api-key: ${SUPABASE_API_KEY}

# 日志配置
logging:
  level:
    com.cinema: DEBUG
    org.hibernate.SQL: DEBUG
```

**环境变量**:

创建 `backend/.env` 文件或配置IDE环境变量：

```bash
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_API_KEY=your-api-key
```

### 4. 数据库初始化

**方式1: 使用Supabase Web Console**

1. 登录Supabase Dashboard
2. 进入SQL Editor
3. 运行数据库迁移脚本（位于 `specs/016-store-reservation-settings/data-model.md` 中的DDL）

**方式2: 使用本地PostgreSQL（开发环境）**

```bash
# 启动PostgreSQL容器
docker run --name cinema-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cinema_dev \
  -p 5432:5432 \
  -d postgres:14

# 连接数据库
psql -h localhost -U postgres -d cinema_dev

# 运行迁移脚本
\i backend/src/main/resources/db/migration/V016_001__create_reservation_settings.sql
```

**验证数据库**:

```sql
-- 检查表是否创建成功
\dt reservation_settings

-- 查看表结构
\d reservation_settings

-- 检查索引
\di idx_reservation_settings_*
```

---

## Development Workflow

### 前端开发

**启动开发服务器**:

```bash
cd frontend
npm run dev
# 或
pnpm dev

# 访问 http://localhost:5173
```

**关键文件路径**:

```
frontend/src/
├── features/
│   └── store-management/
│       ├── components/
│       │   ├── ReservationSettingsModal.tsx    # 预约设置配置弹窗
│       │   ├── ReservationSettingsForm.tsx     # 预约设置表单
│       │   ├── TimeSlotFormItem.tsx            # 时间段配置项
│       │   └── DepositFormItem.tsx             # 押金配置项
│       ├── hooks/
│       │   ├── useReservationSettings.ts       # 查询预约设置Hook
│       │   ├── useUpdateReservationSettings.ts # 更新预约设置Hook
│       │   └── useDeleteReservationSettings.ts # 删除预约设置Hook
│       ├── services/
│       │   └── reservation-settings.service.ts # API服务
│       └── types/
│           └── reservation-settings.ts         # TypeScript类型定义
└── pages/
    └── StoreManagementPage.tsx                 # 门店管理页面（集成预约设置按钮）
```

**开发步骤**:

1. **创建类型定义** (`types/reservation-settings.ts`):
   ```typescript
   // 见 data-model.md 中的 TypeScript Type Definitions
   ```

2. **创建API服务** (`services/reservation-settings.service.ts`):
   ```typescript
   import { apiClient } from '@/lib/api-client';
   import type { ReservationSettings, ReservationSettingsDTO } from '../types';

   export const reservationSettingsService = {
     getByStoreId: async (storeId: string): Promise<ReservationSettings> => {
       const response = await apiClient.get(`/stores/${storeId}/reservation-settings`);
       return response.data.data; // ApiResponse unwrapping
     },

     createOrUpdate: async (storeId: string, dto: ReservationSettingsDTO): Promise<ReservationSettings> => {
       const response = await apiClient.put(`/stores/${storeId}/reservation-settings`, dto);
       return response.data.data;
     },

     delete: async (storeId: string): Promise<void> => {
       await apiClient.delete(`/stores/${storeId}/reservation-settings`);
     },
   };
   ```

3. **创建TanStack Query Hooks**:
   ```typescript
   // useReservationSettings.ts
   import { useQuery } from '@tanstack/react-query';
   import { reservationSettingsService } from '../services';

   export const useReservationSettings = (storeId: string) => {
     return useQuery({
       queryKey: ['reservationSettings', storeId],
       queryFn: () => reservationSettingsService.getByStoreId(storeId),
       enabled: !!storeId,
       staleTime: 5 * 60 * 1000, // 5分钟
     });
   };
   ```

4. **创建表单组件** (`ReservationSettingsForm.tsx`):
   ```tsx
   // 见 research.md 中的 Ant Design Form 实现细节
   ```

5. **集成到门店管理页面**:
   ```tsx
   // StoreManagementPage.tsx
   const handleConfigReservation = (storeId: string) => {
     // 打开 ReservationSettingsModal
     setSelectedStoreId(storeId);
     setModalVisible(true);
   };
   ```

### 后端开发

**启动Spring Boot应用**:

```bash
cd backend
mvn spring-boot:run

# 或使用IDE运行 Application.java
# 访问 http://localhost:8080
```

**关键文件路径**:

```
backend/src/main/java/com/cinema/
├── controller/
│   └── ReservationSettingsController.java       # REST Controller
├── domain/
│   ├── ReservationSettings.java                 # JPA Entity
│   └── TimeSlot.java                            # JSONB DTO
├── dto/
│   └── ReservationSettingsDTO.java              # 请求DTO
├── repository/
│   └── ReservationSettingsRepository.java       # JPA Repository
├── service/
│   ├── ReservationSettingsService.java          # 业务逻辑层
│   └── impl/
│       └── ReservationSettingsServiceImpl.java  # 实现类
├── exception/
│   ├── StoreNotFoundException.java
│   └── SettingsNotFoundException.java
└── config/
    └── ApiResponseAdvice.java                   # 全局响应包装
```

**开发步骤**:

1. **创建JPA Entity** (`ReservationSettings.java`):
   ```java
   // 见 data-model.md 中的 Java Entity 定义
   ```

2. **创建Repository** (`ReservationSettingsRepository.java`):
   ```java
   public interface ReservationSettingsRepository extends JpaRepository<ReservationSettings, UUID> {
       Optional<ReservationSettings> findByStoreId(UUID storeId);
       void deleteByStoreId(UUID storeId);
   }
   ```

3. **创建Service层**:
   ```java
   @Service
   public class ReservationSettingsServiceImpl implements ReservationSettingsService {
       @Override
       public ReservationSettings findByStoreId(UUID storeId) {
           return repository.findByStoreId(storeId)
               .orElseThrow(() -> new SettingsNotFoundException(storeId));
       }

       @Override
       @Transactional
       public ReservationSettings createOrUpdate(UUID storeId, ReservationSettingsDTO dto) {
           // 验证门店存在
           Store store = storeRepository.findById(storeId)
               .orElseThrow(() -> new StoreNotFoundException(storeId));

           // 查找或创建配置
           ReservationSettings settings = repository.findByStoreId(storeId)
               .orElse(new ReservationSettings());

           // 更新字段
           settings.setStore(store);
           settings.setTimeSlots(dto.getTimeSlots());
           settings.setMinAdvanceHours(dto.getMinAdvanceHours());
           // ... 其他字段

           // 设置审计字段
           UUID currentUserId = getCurrentUserId(); // 从SecurityContext获取
           if (settings.getId() == null) {
               settings.setCreatedBy(currentUserId);
           }
           settings.setUpdatedBy(currentUserId);

           return repository.save(settings);
       }
   }
   ```

4. **创建Controller**:
   ```java
   @RestController
   @RequestMapping("/api/stores/{storeId}/reservation-settings")
   public class ReservationSettingsController {
       @GetMapping
       public ReservationSettings get(@PathVariable UUID storeId) {
           return service.findByStoreId(storeId);
           // 自动包装为 ApiResponse<ReservationSettings> by ResponseBodyAdvice
       }

       @PutMapping
       public ReservationSettings createOrUpdate(
           @PathVariable UUID storeId,
           @RequestBody @Valid ReservationSettingsDTO dto
       ) {
           return service.createOrUpdate(storeId, dto);
       }

       @DeleteMapping
       @ResponseStatus(HttpStatus.NO_CONTENT)
       public void delete(@PathVariable UUID storeId) {
           service.deleteByStoreId(storeId);
       }
   }
   ```

---

## Testing

### 单元测试

**前端单元测试 (Vitest)**:

```bash
cd frontend
npm run test

# 查看覆盖率
npm run test:coverage
```

**示例测试**:

```typescript
// useReservationSettings.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReservationSettings } from './useReservationSettings';

describe('useReservationSettings', () => {
  it('should fetch reservation settings successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useReservationSettings('store-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveProperty('timeSlots');
  });
});
```

**后端单元测试 (JUnit 5)**:

```bash
cd backend
mvn test
```

**示例测试**:

```java
@SpringBootTest
class ReservationSettingsServiceTest {
    @Autowired
    private ReservationSettingsService service;

    @Test
    void shouldCreateDefaultSettings() {
        UUID storeId = UUID.randomUUID();
        ReservationSettingsDTO dto = createDefaultDTO();

        ReservationSettings result = service.createOrUpdate(storeId, dto);

        assertNotNull(result.getId());
        assertEquals(storeId, result.getStore().getId());
        assertEquals(7, result.getTimeSlots().size());
    }
}
```

### E2E测试

**使用Playwright运行E2E测试**:

```bash
cd frontend
npm run test:e2e

# 或在UI模式下调试
npm run test:e2e:ui
```

**示例E2E测试**:

```typescript
// reservation-settings.spec.ts
import { test, expect } from '@playwright/test';

test('configure reservation settings for a store', async ({ page }) => {
  // 1. 登录系统
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. 进入门店管理页面
  await page.goto('http://localhost:5173/stores');
  await expect(page.locator('h1')).toContainText('门店管理');

  // 3. 点击第一个门店的"预约设置"按钮
  await page.click('button:has-text("预约设置"):first');

  // 4. 等待Modal打开
  await expect(page.locator('.ant-modal')).toBeVisible();

  // 5. 修改时间段配置
  await page.fill('[data-testid="monday-start-time"]', '10:00');
  await page.fill('[data-testid="monday-end-time"]', '22:00');

  // 6. 修改提前量配置
  await page.fill('[name="minAdvanceHours"]', '2');
  await page.fill('[name="maxAdvanceDays"]', '30');

  // 7. 启用押金并设置金额
  await page.check('[name="depositRequired"]');
  await page.fill('[name="depositAmount"]', '200');

  // 8. 保存配置
  await page.click('button:has-text("保存")');

  // 9. 验证成功提示
  await expect(page.locator('.ant-message-success')).toContainText('保存成功');

  // 10. 验证配置已更新（刷新页面后重新打开）
  await page.reload();
  await page.click('button:has-text("预约设置"):first');
  await expect(page.locator('[data-testid="monday-start-time"]')).toHaveValue('10:00');
});
```

---

## Debugging

### 前端调试

**使用Chrome DevTools**:

1. 在Chrome中打开 `http://localhost:5173`
2. 按F12打开开发者工具
3. 在Sources面板中设置断点
4. 使用Console查看日志

**使用VS Code调试**:

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

**查看TanStack Query缓存**:

安装React Query Devtools（已在项目中配置）:

```tsx
// App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

访问应用后，点击右下角的React Query图标查看缓存状态。

### 后端调试

**使用IntelliJ IDEA调试**:

1. 在代码中设置断点
2. 点击Debug按钮（绿色虫子图标）启动应用
3. 触发API请求后，IDE会在断点处暂停

**查看SQL日志**:

在 `application.yml` 中启用SQL日志：

```yaml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

**使用Postman测试API**:

1. 导入OpenAPI spec (`contracts/api.yaml`) 到Postman
2. 配置环境变量：
   - `baseUrl`: `http://localhost:8080/api`
   - `token`: Bearer Token（从登录接口获取）
3. 发送请求测试各端点

---

## Common Issues & Solutions

### 问题1: 前端启动失败 - "Cannot find module 'vite'"

**原因**: 依赖未正确安装

**解决方案**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 问题2: 后端启动失败 - "Unable to connect to database"

**原因**: Supabase数据库连接配置错误

**解决方案**:
1. 检查 `application.yml` 中的数据库URL、用户名、密码
2. 确认Supabase项目状态（访问Supabase Dashboard）
3. 测试数据库连接：
   ```bash
   psql "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
   ```

### 问题3: API请求返回401 Unauthorized

**原因**: Token缺失或无效

**解决方案**:
1. 检查请求头是否包含 `Authorization: Bearer <token>`
2. 验证Token是否过期（使用jwt.io解码检查exp字段）
3. 重新登录获取新Token

### 问题4: 表单验证错误 - "开始时间必须早于结束时间"

**原因**: 时间段配置不正确

**解决方案**:
1. 检查前端表单输入值
2. 查看浏览器Console中的验证错误详情
3. 确认Zod schema定义与后端验证规则一致

### 问题5: E2E测试失败 - "Timeout waiting for selector"

**原因**: 页面元素未加载或选择器错误

**解决方案**:
1. 使用Playwright UI模式调试：`npm run test:e2e:ui`
2. 检查选择器是否正确（使用Playwright Inspector）
3. 增加waitFor超时时间：`await page.waitForSelector('.ant-modal', { timeout: 10000 })`

---

## Useful Commands

### 前端

```bash
# 开发
npm run dev                 # 启动开发服务器
npm run build               # 构建生产版本
npm run preview             # 预览生产构建

# 测试
npm run test                # 运行单元测试
npm run test:e2e            # 运行E2E测试
npm run test:coverage       # 查看测试覆盖率

# 代码质量
npm run lint                # 运行ESLint
npm run lint:fix            # 自动修复ESLint错误
npm run type-check          # TypeScript类型检查
npm run format              # Prettier格式化代码
```

### 后端

```bash
# 开发
mvn spring-boot:run         # 启动Spring Boot应用
mvn clean install           # 清理并构建项目

# 测试
mvn test                    # 运行所有测试
mvn test -Dtest=ReservationSettingsServiceTest  # 运行指定测试
mvn verify                  # 运行测试并生成报告

# 代码质量
mvn checkstyle:check        # 运行Checkstyle检查
mvn spotless:apply          # 格式化代码
```

### 数据库

```bash
# 连接Supabase数据库
psql "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# 备份数据库
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# 恢复数据库
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql

# 查看表结构
\d reservation_settings

# 查看索引
\di idx_reservation_settings_*
```

---

## Next Steps

完成本地开发环境搭建后，建议按以下顺序进行开发：

1. ✅ **阅读规格文档** (`spec.md`) - 理解功能需求和验收标准
2. ✅ **阅读研究文档** (`research.md`) - 理解技术决策
3. ✅ **阅读数据模型** (`data-model.md`) - 理解实体结构和关系
4. ✅ **阅读API契约** (`contracts/api.yaml`) - 理解接口规范
5. 🔜 **编写测试** - 遵循TDD原则，先写E2E测试和单元测试
6. 🔜 **实现后端** - 创建Entity、Repository、Service、Controller
7. 🔜 **实现前端** - 创建类型、服务、Hooks、组件
8. 🔜 **集成测试** - 验证前后端集成无误
9. 🔜 **代码审查** - 提交PR并请求审查
10. 🔜 **部署** - 合并到主分支并部署到测试环境

---

## Resources

### 官方文档

- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [Supabase 文档](https://supabase.com/docs)
- [Playwright E2E测试](https://playwright.dev/)

### 项目内部文档

- [项目宪章](../../.specify/memory/constitution.md)
- [API响应格式标准](.../../.claude/rules/08-api-standards.md)
- [前端技术栈规范](.../../.claude/rules/03-frontend-b-tech-stack.md)
- [后端架构规范](.../../.claude/rules/07-backend-architecture.md)

---

**最后更新**: 2025-12-22
**维护者**: Cinema Business Center Platform Team

# Quick Start Guide: SKU编辑页面数据加载修复

**Feature**: P006-fix-sku-edit-data
**Created**: 2025-12-31
**Status**: Development Ready

## Overview

本快速开始指南提供 SKU 编辑页面数据加载修复功能的开发环境配置、测试驱动开发(TDD)工作流程、调试技巧和常见问题排查方法。

## Prerequisites

### 系统要求

- **Node.js**: 18.x 或更高版本
- **Java**: 21 (或 Java 17)
- **Maven**: 3.8+ (或使用 `./mvnw`)
- **Git**: 2.30+
- **IDE**: VS Code (推荐) 或 IntelliJ IDEA

### 技术栈版本

| 技术 | 版本 |
|-----|------|
| React | 19.2.0 |
| TypeScript | 5.9.3 |
| Ant Design | 6.1.0 |
| TanStack Query | 5.90.12 |
| Playwright | 1.57.0 |
| Spring Boot | 3.3.5 |
| Supabase | - |

## Environment Setup

### 1. 克隆仓库并切换分支

```bash
# 克隆仓库
git clone https://github.com/your-org/Cinema_Bussiness_Center_Platform.git
cd Cinema_Bussiness_Center_Platform

# 切换到 P001 功能分支
git checkout P006-fix-sku-edit-data

# 验证分支和激活规格
git branch --show-current
# 输出: P006-fix-sku-edit-data

cat .specify/active_spec.txt
# 输出: specs/P006-fix-sku-edit-data/spec.md
```

### 2. 前端环境配置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 验证安装
npm run test -- --version
# 输出: Vitest v4.0.15

npx playwright --version
# 输出: Version 1.57.0
```

### 3. 后端环境配置

```bash
# 进入后端目录
cd backend

# 安装依赖（使用 Maven Wrapper）
./mvnw clean install -DskipTests

# 验证 Java 版本
java -version
# 输出: openjdk version "21.0.x" 或 "17.0.x"
```

### 4. 配置环境变量

创建前端环境变量文件：

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080
VITE_ENV=development
```

创建后端环境变量文件：

```bash
# backend/src/main/resources/application-local.yml
spring:
  datasource:
    url: ${SUPABASE_URL}
    username: postgres
    password: ${SUPABASE_PASSWORD}

supabase:
  url: ${SUPABASE_URL}
  anon-key: ${SUPABASE_ANON_KEY}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY}

logging:
  level:
    com.cinema: DEBUG
```

设置环境变量（根据操作系统选择）：

```bash
# macOS/Linux
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Windows PowerShell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_ANON_KEY="your-anon-key"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-key"
```

### 5. 启动开发服务器

**Terminal 1 - 后端 Spring Boot**:
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# 输出: Started Application in X.XX seconds
# 服务运行在 http://localhost:8080
```

**Terminal 2 - 前端 React**:
```bash
cd frontend
npm run dev
# 输出: Local: http://localhost:3000
```

**Terminal 3 - E2E 测试准备**:
```bash
cd frontend
npm run test:e2e:ui
# 打开 Playwright UI 模式
```

### 6. 验证环境

访问以下 URL 验证服务正常运行：

- **前端**: http://localhost:3000
- **后端健康检查**: http://localhost:8080/actuator/health
- **Swagger API 文档**: http://localhost:8080/swagger-ui.html

## TDD Development Workflow

遵循严格的 **Red-Green-Refactor** 测试驱动开发循环。

### 7-Step TDD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    TDD Cycle (重复执行)                      │
│                                                             │
│  ┌──────┐    ┌───────┐    ┌──────────┐                     │
│  │ Red  │───▶│ Green │───▶│ Refactor │───┐                 │
│  └──────┘    └───────┘    └──────────┘   │                 │
│     ▲                                     │                 │
│     └─────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

#### Step 1: 创建 E2E 测试场景 (Red)

使用 `e2e-test-generator` skill 创建测试场景：

```bash
# 使用 Claude Code 执行
/e2e create-scenario --spec P001

# 或手动创建场景 YAML 文件
touch scenarios/product/E2E-PRODUCT-001.yaml
```

**场景 YAML 示例** (`scenarios/product/E2E-PRODUCT-001.yaml`):

```yaml
scenario_id: E2E-PRODUCT-001
spec_ref: P001
title: SKU编辑页面加载SPU和BOM数据
tags:
  module: [product]
  channel: [web]
  deploy: [saas]
  priority: p1
  smoke: true

preconditions:
  role: admin
  testdata_ref: skuEditTestData.scenario_001

steps:
  - action: login
    description: 管理员登录
  - action: navigate
    params:
      testdata_ref: skuEditTestData.sku_edit_page
    description: 导航到SKU编辑页面
  - action: verify_spu_loaded
    description: 验证SPU信息已加载
  - action: verify_bom_loaded
    description: 验证BOM配方已加载

assertions:
  - type: ui
    check: element_visible
    params:
      selector: ".spu-section"
  - type: ui
    check: element_visible
    params:
      selector: ".bom-table"
  - type: ui
    check: table_row_count
    params:
      selector: ".bom-table tbody tr"
      expectedCount: 4
```

#### Step 2: 生成 Playwright 测试脚本 (Red)

```bash
# 使用 e2e-test-generator skill 生成测试脚本
/e2e generate E2E-PRODUCT-001

# 输出:
# ✅ Generated: scenarios/product/E2E-PRODUCT-001.spec.ts
# ⚠️  TODO: Implement page object methods
```

**生成的测试脚本** (`scenarios/product/E2E-PRODUCT-001.spec.ts`):

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * Auto-generated E2E test for SKU edit page data loading
 */
import { test, expect } from '@playwright/test';
import { loadTestData } from '@/testdata/loader';

test.describe('SKU编辑页面加载SPU和BOM数据', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await loadTestData('skuEditTestData.scenario_001');

    // 创建测试数据 (API)
    const createResponse = await page.request.post('/api/test/skus', {
      data: testData.sku
    });
    expect(createResponse.ok()).toBeTruthy();

    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', testData.admin.username);
    await page.fill('input[name="password"]', testData.admin.password);
    await page.click('button[type="submit"]');
  });

  test('应该加载SPU和BOM数据', async ({ page }) => {
    // 导航到SKU编辑页面
    await page.goto(`/skus/${testData.sku.id}/edit`);

    // 验证SPU信息已加载
    await expect(page.locator('.spu-section')).toBeVisible();
    await expect(page.locator('.spu-name')).toContainText(testData.spu.name);

    // 验证BOM配方已加载
    await expect(page.locator('.bom-table')).toBeVisible();
    const bomRows = page.locator('.bom-table tbody tr');
    await expect(bomRows).toHaveCount(4);

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });

  test.afterEach(async ({ page }) => {
    // 清理测试数据 (API)
    await page.request.delete(`/api/test/skus/${testData.sku.id}`);
  });
});
```

#### Step 3: 运行 E2E 测试（期望失败）(Red)

```bash
# 运行测试（期望失败）
cd frontend
npm run test:e2e -- E2E-PRODUCT-001.spec.ts

# 输出示例:
# ❌ Test Failed: SKU编辑页面加载SPU和BOM数据
# Error: API endpoint not found: GET /api/skus/{id}/details
```

**预期结果**: 测试失败（Red 阶段），因为后端 API 尚未实现。

#### Step 4: 实现后端 API (Green)

**创建 Controller** (`backend/src/main/java/com/cinema/sku/controller/SKUController.java`):

```java
/**
 * @spec P006-fix-sku-edit-data
 * SKU管理控制器
 */
@RestController
@RequestMapping("/api/skus")
@RequiredArgsConstructor
public class SKUController {

    private final SKUService skuService;

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<SKUDetailResponse>> getSKUDetails(
            @PathVariable String id) {
        try {
            SKUDetailResponse details = skuService.getSKUDetails(id);
            return ResponseEntity.ok(ApiResponse.success(details));
        } catch (NotFoundException e) {
            return ResponseEntity.status(404)
                .body(ApiResponse.failure("SKU_NTF_001", e.getMessage()));
        }
    }
}
```

**创建 Service** (`backend/src/main/java/com/cinema/sku/service/SKUService.java`):

```java
/**
 * @spec P006-fix-sku-edit-data
 * SKU业务逻辑服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SKUService {

    private final SKURepository skuRepository;
    private final SPURepository spuRepository;
    private final BOMRepository bomRepository;
    private final CacheManager cacheManager;

    @Cacheable(value = "skuDetails", key = "#id")
    public SKUDetailResponse getSKUDetails(String id) {
        log.info("Loading SKU details: skuId={}", id);

        // 1. 加载 SKU 基本信息
        SKU sku = skuRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("SKU not found: " + id));

        // 2. 加载关联的 SPU 信息（可能失败）
        SPU spu = null;
        boolean spuLoadSuccess = true;
        String spuStatus = "not_linked";

        if (sku.getSpuId() != null) {
            try {
                spu = spuRepository.findById(sku.getSpuId()).orElse(null);
                if (spu != null && "valid".equals(spu.getStatus())) {
                    spuStatus = "valid";
                } else {
                    spuStatus = "invalid";
                    spuLoadSuccess = false;
                }
            } catch (Exception e) {
                log.error("Failed to load SPU: skuId={}, spuId={}", id, sku.getSpuId(), e);
                spuLoadSuccess = false;
                spuStatus = "invalid";
            }
        }

        // 3. 加载关联的 BOM 配方（可能失败）
        BOM bom = null;
        boolean bomLoadSuccess = true;
        String bomStatus = "not_configured";

        try {
            bom = bomRepository.findBySkuId(id).orElse(null);
            if (bom != null) {
                bomStatus = bom.getStatus();
            }
        } catch (Exception e) {
            log.error("Failed to load BOM: skuId={}", id, e);
            bomLoadSuccess = false;
        }

        // 4. 构建响应
        LoadMetadata metadata = LoadMetadata.builder()
            .spuLoadSuccess(spuLoadSuccess)
            .bomLoadSuccess(bomLoadSuccess)
            .spuStatus(spuStatus)
            .bomStatus(bomStatus)
            .build();

        return SKUDetailResponse.builder()
            .sku(sku)
            .spu(spu)
            .bom(bom)
            .metadata(metadata)
            .build();
    }
}
```

#### Step 5: 实现前端 UI (Green)

**创建 TanStack Query Hook** (`frontend/src/hooks/useSKUEditData.ts`):

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU编辑数据查询 Hook
 */
import { useQuery } from '@tanstack/react-query';
import { getSKUDetails } from '@/services/skuService';

export const useSKUEditData = (skuId: string) => {
  return useQuery({
    queryKey: ['skuDetails', skuId],
    queryFn: () => getSKUDetails(skuId),
    staleTime: 2 * 60 * 1000, // 2分钟
    cacheTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('[P001] Failed to load SKU details:', {
        skuId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    },
  });
};
```

**创建 SKU 编辑页面组件** (`frontend/src/pages/SKUEdit.tsx`):

```typescript
/**
 * @spec P006-fix-sku-edit-data
 * SKU编辑页面组件
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Alert, Descriptions, Table } from 'antd';
import { useSKUEditData } from '@/hooks/useSKUEditData';

export const SKUEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useSKUEditData(id!);

  if (isLoading) return <Spin size="large" />;
  if (error) return <Alert type="error" message="数据加载失败，请刷新重试" />;

  const { sku, spu, bom, metadata } = data!;

  return (
    <div className="sku-edit-page">
      <h2>编辑 SKU: {sku.name}</h2>

      {/* SKU 基本信息 */}
      <Descriptions title="SKU 基本信息" bordered>
        <Descriptions.Item label="编码">{sku.code}</Descriptions.Item>
        <Descriptions.Item label="名称">{sku.name}</Descriptions.Item>
        <Descriptions.Item label="价格">{sku.price / 100} 元</Descriptions.Item>
        <Descriptions.Item label="库存">{sku.stockQuantity}</Descriptions.Item>
      </Descriptions>

      {/* SPU 信息 */}
      {metadata.spuStatus === 'not_linked' && (
        <Alert type="info" message="未关联SPU" style={{ marginTop: 16 }} />
      )}
      {metadata.spuStatus === 'invalid' && (
        <Alert type="warning" message="SPU已失效" style={{ marginTop: 16 }} />
      )}
      {spu && (
        <div className="spu-section" style={{ marginTop: 16 }}>
          <Descriptions title="SPU 信息（只读）" bordered>
            <Descriptions.Item label="产品名称" className="spu-name">
              {spu.name}
            </Descriptions.Item>
            <Descriptions.Item label="分类">{spu.categoryId}</Descriptions.Item>
            <Descriptions.Item label="品牌">{spu.brandId || '无'}</Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>
              {spu.description}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* BOM 配方 */}
      {metadata.bomStatus === 'not_configured' && (
        <Alert type="info" message="未配置配方" style={{ marginTop: 16 }} />
      )}
      {bom && (
        <div style={{ marginTop: 16 }}>
          <h3>BOM 配方（损耗率: {bom.wasteRate}%）</h3>
          <Table
            className="bom-table"
            dataSource={bom.components}
            rowKey="id"
            pagination={false}
            scroll={{ y: bom.components.length > 10 ? 400 : undefined }}
            virtual={bom.components.length > 10}
            columns={[
              { title: '原料编码', dataIndex: 'ingredientSkuCode' },
              { title: '原料名称', dataIndex: 'ingredientSkuName' },
              { title: '用量', dataIndex: 'quantity' },
              { title: '单位', dataIndex: 'unit' },
              {
                title: '标准成本',
                dataIndex: 'standardCost',
                render: (cost) => (cost ? `${cost / 100} 元` : '-'),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
```

#### Step 6: 重新运行测试（期望通过）(Green)

```bash
# 重新运行 E2E 测试
npm run test:e2e -- E2E-PRODUCT-001.spec.ts

# 输出示例:
# ✅ Test Passed: SKU编辑页面加载SPU和BOM数据
# Duration: 12.5s
```

**预期结果**: 测试通过（Green 阶段）。

#### Step 7: 重构和优化 (Refactor)

- 提取重复代码为可复用函数
- 优化性能（如添加虚拟滚动）
- 改进错误处理
- 添加日志记录

```typescript
// 示例：提取虚拟滚动判断逻辑
const shouldUseVirtualScrolling = (bom: BOM | null): boolean => {
  if (!bom || !bom.components) return false;
  return bom.components.length > 10;
};

// 在组件中使用
<Table
  virtual={shouldUseVirtualScrolling(bom)}
  scroll={{ y: shouldUseVirtualScrolling(bom) ? 400 : undefined }}
  {...otherProps}
/>
```

#### 重复 TDD 循环

继续为其他用户故事（User Story 2, 3）重复步骤 1-7。

## Test Commands

### 单元测试 (Vitest)

```bash
# 前端单元测试
cd frontend
npm run test:unit                # 运行所有单元测试
npm run test:unit:ui             # UI 模式
npm run test:coverage            # 生成覆盖率报告

# 后端单元测试
cd backend
./mvnw test                      # 运行所有测试
./mvnw test -Dtest=SKUServiceTest  # 运行特定测试类
```

### E2E 测试 (Playwright)

```bash
cd frontend

# 基本运行
npm run test:e2e                 # 无头模式运行所有测试
npm run test:e2e:ui              # UI 模式（推荐）
npm run test:headed              # 显示浏览器窗口

# 运行特定测试
npm run test:e2e -- E2E-PRODUCT-001.spec.ts

# 调试模式
npm run test:debug -- E2E-PRODUCT-001.spec.ts

# 生成报告
npm run test:e2e -- --reporter=html
npx playwright show-report
```

### 集成测试 (MSW Mock)

```bash
cd frontend

# 初始化 MSW（首次运行）
npm run mock:init

# 启动开发服务器（MSW 自动启用）
npm run dev
```

## Debugging Techniques

### 1. 前端调试

**浏览器 DevTools**:
```typescript
// 添加断点
debugger;

// 查看 TanStack Query 缓存
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
console.log('Query Cache:', queryClient.getQueryCache().getAll());
```

**React DevTools**:
- 安装 React DevTools 浏览器扩展
- 查看组件树和 props/state
- 分析组件渲染性能

### 2. 后端调试

**IDEA/VS Code 断点调试**:
```java
// 在关键方法设置断点
public SKUDetailResponse getSKUDetails(String id) {
    // 断点在此
    SKU sku = skuRepository.findById(id).orElseThrow(...);
    // ...
}
```

**日志调试**:
```java
log.info("Loading SKU details: skuId={}", id);
log.debug("SPU load result: success={}, status={}", spuLoadSuccess, spuStatus);
log.error("Failed to load BOM: skuId={}", id, exception);
```

**查看日志**:
```bash
# 实时查看日志
tail -f backend/logs/application.log

# 过滤特定操作
grep "operation=GET_SKU_DETAILS" backend/logs/application.log

# 使用 jq 解析 JSON 日志
tail -f backend/logs/application.log | jq 'select(.operation == "GET_SKU_DETAILS")'
```

### 3. E2E 测试调试

**Playwright Trace Viewer**:
```bash
# 运行测试并生成 trace
npm run test:e2e -- --trace on

# 查看 trace
npx playwright show-trace test-results/trace.zip
```

**Playwright Inspector**:
```bash
# 调试模式运行
npm run test:debug -- E2E-PRODUCT-001.spec.ts

# 在测试中添加暂停点
await page.pause();
```

## Troubleshooting

### 问题 1: 后端 API 连接失败

**症状**:
```
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**解决方案**:
1. 检查后端服务是否运行：`curl http://localhost:8080/actuator/health`
2. 验证 Vite 代理配置：查看 `frontend/vite.config.ts` 中的 `server.proxy`
3. 检查防火墙设置

### 问题 2: Supabase 连接超时

**症状**:
```
Caused by: java.net.SocketTimeoutException: Read timed out
```

**解决方案**:
1. 检查 Supabase URL 和密钥是否正确
2. 增加超时配置：
   ```yaml
   # application.yml
   spring:
     datasource:
       hikari:
         connection-timeout: 30000
   ```
3. 验证网络连接：`curl -v https://your-project.supabase.co`

### 问题 3: E2E 测试数据冲突

**症状**:
```
Error: Unique constraint violation: sku_code_unique
```

**解决方案**:
1. 确保 `test.afterEach` 清理测试数据
2. 使用唯一的测试数据 ID：
   ```typescript
   const testSkuId = `test-sku-${Date.now()}`;
   ```
3. 检查测试数据隔离策略

### 问题 4: 并发冲突检测失败

**症状**:
```
Expected HTTP 422, got HTTP 200
```

**解决方案**:
1. 验证 JPA `@Version` 注解已添加到 SKU 实体
2. 检查数据库 `version` 字段类型：`ALTER TABLE sku ADD COLUMN version INTEGER NOT NULL DEFAULT 0;`
3. 确认请求包含正确的 `version` 字段

### 问题 5: BOM 虚拟滚动不工作

**症状**:
```
Warning: Ant Design Table virtual scrolling requires fixed height
```

**解决方案**:
1. 确保 `scroll.y` 属性已设置：
   ```tsx
   <Table scroll={{ y: 400 }} virtual={true} />
   ```
2. 检查 BOM 组件数量：`bom.components.length > 10`
3. 验证 Ant Design 版本：`npm list antd`

## Performance Optimization

### 前端优化

1. **React.memo** 避免不必要渲染:
   ```typescript
   export const SKUEdit = React.memo<Props>(({ skuId }) => {
     // ...
   });
   ```

2. **useMemo** 缓存计算结果:
   ```typescript
   const sortedComponents = useMemo(() => {
     return bom?.components.sort((a, b) => a.sortOrder - b.sortOrder);
   }, [bom]);
   ```

3. **虚拟滚动** 处理大量数据:
   ```tsx
   <Table virtual={bom.components.length > 10} />
   ```

### 后端优化

1. **Caffeine 缓存** SPU 数据:
   ```java
   @Cacheable(value = "spuDetails", key = "#spuId")
   public SPU getSPU(String spuId) { ... }
   ```

2. **批量查询** 减少数据库调用:
   ```java
   @Query("SELECT c FROM BOMComponent c WHERE c.bomId IN :bomIds")
   List<BOMComponent> findByBomIds(List<String> bomIds);
   ```

3. **数据库索引** 优化查询性能:
   ```sql
   CREATE INDEX idx_sku_spu_id ON sku(spu_id);
   CREATE INDEX idx_bom_sku_id ON bom(sku_id);
   ```

## Next Steps

完成 Phase 1 后，继续执行以下步骤：

1. **Update Agent Context**:
   ```bash
   .specify/scripts/bash/update-agent-context.sh claude
   ```

2. **Generate Tasks** (`/speckit.tasks`):
   - 生成 tasks.md 文件
   - 分解为原子任务
   - 定义任务依赖关系

3. **Start Implementation** (`/speckit.implement`):
   - 按任务优先级执行
   - 遵循 TDD 循环
   - 持续集成和测试

## Related Documents

- [Feature Specification](spec.md) - 功能需求和验收标准
- [Implementation Plan](plan.md) - 实现计划和架构设计
- [Research Decisions](research.md) - 技术选型和研究决策
- [Data Model](data-model.md) - 数据模型定义
- [API Contracts](contracts/api.yaml) - API 接口契约

---

**Version**: 1.0.0 | **Last Updated**: 2025-12-31

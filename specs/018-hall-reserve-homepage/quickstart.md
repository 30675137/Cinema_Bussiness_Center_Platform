# Quickstart Guide: 场景包小程序首页 API 集成开发

**Feature**: 018-hall-reserve-homepage
**Date**: 2025-12-21
**Target Audience**: 前端开发（Taro）+ 后端开发（Spring Boot）

---

## 📋 前置条件

### 开发环境要求
- **Node.js**: >= 18.0.0
- **Java**: >= 21
- **Taro CLI**: >= 3.x
- **微信开发者工具**: 最新稳定版
- **Spring Boot**: >= 3.x
- **Supabase 账号**: 已创建项目并配置数据库

### 技能要求
- 熟悉 TypeScript 和 React
- 了解 Taro 多端开发框架
- 熟悉 Spring Boot 和 Java
- 了解 RESTful API 设计

---

## 🚀 快速开始（前端 - Taro 小程序）

### Step 1: 安装依赖

```bash
cd hall-reserve-taro
npm install @tanstack/react-query zod
```

### Step 2: 创建类型定义

创建 `src/types/scenario.ts`:

```typescript
import { z } from 'zod'

export const ScenarioPackageListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['MOVIE', 'TEAM', 'PARTY']),
  backgroundImageUrl: z.string().url(),
  packagePrice: z.number().positive(),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
})

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ScenarioPackageListItemSchema),
  message: z.string().optional(),
  timestamp: z.string().optional(),
})

export type ScenarioPackageListItem = z.infer<typeof ScenarioPackageListItemSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
```

### Step 3: 创建网络请求封装

创建 `src/utils/request.ts`:

```typescript
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_ENV === 'weapp'
  ? 'https://api.production.com'  // 生产环境
  : 'http://localhost:8080'        // 开发环境

export async function request<T>(url: string, options?: Taro.request.Option): Promise<T> {
  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    })

    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || 'Request failed'}`)
    }

    return response.data as T
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}
```

### Step 4: 创建场景包 API 服务

创建 `src/services/scenarioService.ts`:

```typescript
import { request } from '../utils/request'
import { ApiResponseSchema, type ScenarioPackageListItem } from '../types/scenario'

export async function fetchScenarioPackages(): Promise<ScenarioPackageListItem[]> {
  const response = await request('/api/scenario-packages')

  // Zod 运行时验证
  const validated = ApiResponseSchema.parse(response)

  if (!validated.success) {
    throw new Error(validated.message || '获取场景包列表失败')
  }

  return validated.data
}
```

### Step 5: 配置 TanStack Query

修改 `src/app.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟缓存
      cacheTime: 10 * 60 * 1000,   // 10 分钟内存保留
      retry: 2,                     // 失败重试 2 次
    },
  },
})

function App({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default App
```

### Step 6: 在首页使用 API

修改 `src/pages/index/index.tsx`:

```typescript
import { View, Text, Image, Button } from '@tarojs/components'
import { useQuery } from '@tanstack/react-query'
import { fetchScenarioPackages } from '../../services/scenarioService'

export default function Index() {
  const { data: scenarios, isLoading, error, refetch } = useQuery({
    queryKey: ['scenarioPackages'],
    queryFn: fetchScenarioPackages,
  })

  if (isLoading) {
    return <View className="loading">加载中...</View>
  }

  if (error) {
    return (
      <View className="error">
        <Text>网络连接失败，请检查网络设置</Text>
        <Button onClick={() => refetch()}>重试</Button>
      </View>
    )
  }

  if (!scenarios || scenarios.length === 0) {
    return <View className="empty">暂无可用场景包，敬请期待</View>
  }

  return (
    <View className="index">
      {scenarios.map((item) => (
        <View key={item.id} className="scenario-card">
          <Image
            src={item.backgroundImageUrl}
            mode="aspectFill"
            className="card-image"
            lazyLoad
            onError={(e) => {
              e.currentTarget.src = '/assets/placeholder.png'
            }}
          />
          <View className="card-info">
            <Text className="card-title">{item.title}</Text>
            <View className="card-meta">
              <Text className="card-category">{item.category}</Text>
              {item.rating && (
                <Text className="card-rating">⭐ {item.rating.toFixed(1)}</Text>
              )}
            </View>
            <View className="card-tags">
              {item.tags.map((tag, index) => (
                <Text key={index} className="tag">
                  {tag}
                </Text>
              ))}
            </View>
            <Text className="card-price">¥ {item.packagePrice}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
```

### Step 7: 测试

```bash
# H5 开发模式（推荐用于快速调试）
npm run dev:h5

# 微信小程序开发模式
npm run dev:weapp
```

---

## 🚀 快速开始（后端 - Spring Boot）

### Step 1: 添加依赖

在 `pom.xml` 中添加 Supabase 依赖（或使用 HTTP Client）:

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Supabase Java SDK 或 HTTP Client -->
    <dependency>
        <groupId>io.github.jan-tennert.supabase</groupId>
        <artifactId>supabase-kt-jvm</artifactId>
        <version>最新版本</version>
    </dependency>

    <!-- JSON 处理 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

### Step 2: 配置 Supabase

创建 `src/main/resources/application.yml`:

```yaml
supabase:
  url: https://your-project.supabase.co
  api-key: your-anon-key
```

创建 `SupabaseConfig.java`:

```java
@Configuration
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.api-key}")
    private String supabaseApiKey;

    @Bean
    public Supabase supabaseClient() {
        // 根据实际 SDK 初始化 Supabase 客户端
        return new Supabase(supabaseUrl, supabaseApiKey);
    }
}
```

### Step 3: 创建 DTO

创建 `ScenarioPackageListItemDTO.java`:

```java
package com.cinema.dto;

import java.util.List;

public record ScenarioPackageListItemDTO(
    String id,
    String title,
    String category,
    String backgroundImageUrl,
    Double packagePrice,
    Double rating,
    List<String> tags
) {}
```

创建 `ApiResponse.java`:

```java
package com.cinema.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    String timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, Instant.now().toString());
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, null, message, Instant.now().toString());
    }
}
```

### Step 4: 创建 Repository

创建 `ScenarioPackageRepository.java`:

```java
package com.cinema.repository;

import com.cinema.dto.ScenarioPackageListItemDTO;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ScenarioPackageRepository {

    private final Supabase supabase;

    public ScenarioPackageRepository(Supabase supabase) {
        this.supabase = supabase;
    }

    /**
     * 查询已发布的场景包列表
     * 服务端过滤：仅返回 status = PUBLISHED 且未删除的数据
     */
    public List<ScenarioPackageListItemDTO> findPublishedPackages() {
        // 使用 Supabase SDK 查询（示例代码，需根据实际 SDK API 调整）
        return supabase
            .from("scenario_packages")
            .select("id, title, category, background_image_url, package_price, rating, tags")
            .eq("status", "PUBLISHED")
            .is("deleted_at", null)
            .execute()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    private ScenarioPackageListItemDTO mapToDTO(Map<String, Object> row) {
        return new ScenarioPackageListItemDTO(
            (String) row.get("id"),
            (String) row.get("title"),
            (String) row.get("category"),
            (String) row.get("background_image_url"),
            ((Number) row.get("package_price")).doubleValue(),
            row.get("rating") != null ? ((Number) row.get("rating")).doubleValue() : null,
            (List<String>) row.get("tags")
        );
    }
}
```

### Step 5: 创建 Service

创建 `ScenarioPackageService.java`:

```java
package com.cinema.service;

import com.cinema.dto.ScenarioPackageListItemDTO;
import com.cinema.repository.ScenarioPackageRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ScenarioPackageService {

    private final ScenarioPackageRepository repository;

    public ScenarioPackageService(ScenarioPackageRepository repository) {
        this.repository = repository;
    }

    /**
     * 获取已发布的场景包列表
     */
    public List<ScenarioPackageListItemDTO> getPublishedPackages() {
        return repository.findPublishedPackages();
    }
}
```

### Step 6: 创建 Controller

创建 `ScenarioPackageController.java`:

```java
package com.cinema.controller;

import com.cinema.dto.ApiResponse;
import com.cinema.dto.ScenarioPackageListItemDTO;
import com.cinema.service.ScenarioPackageService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 场景包 API 控制器
 * 提供场景包列表数据给 Taro 小程序
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // 开发环境允许跨域，生产环境需配置具体域名
public class ScenarioPackageController {

    private final ScenarioPackageService service;

    public ScenarioPackageController(ScenarioPackageService service) {
        this.service = service;
    }

    /**
     * 获取场景包列表
     * GET /api/scenario-packages
     */
    @GetMapping("/scenario-packages")
    public ResponseEntity<ApiResponse<List<ScenarioPackageListItemDTO>>> getScenarioPackages() {
        try {
            List<ScenarioPackageListItemDTO> packages = service.getPublishedPackages();

            return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(ApiResponse.success(packages));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.failure("服务暂时不可用，请稍后重试"));
        }
    }
}
```

### Step 7: 测试

```bash
# 启动 Spring Boot 应用
./mvnw spring-boot:run

# 测试 API（使用 curl 或 Postman）
curl http://localhost:8080/api/scenario-packages
```

---

## ✅ 验收测试

### 前端测试清单
- [ ] H5 模式下场景包列表正常加载
- [ ] 微信小程序模式下场景包列表正常加载
- [ ] 加载状态显示正常（"加载中..."）
- [ ] 错误状态显示正常（网络错误 + 重试按钮）
- [ ] 空状态显示正常（"暂无可用场景包"）
- [ ] 缓存功能正常（5分钟内不重复请求）
- [ ] 下拉刷新功能正常（强制清除缓存）
- [ ] 图片加载失败时展示占位图
- [ ] rating 为 null 时不显示评分

### 后端测试清单
- [ ] API 返回 200 状态码
- [ ] 响应格式符合 OpenAPI 规范
- [ ] 仅返回 PUBLISHED 状态的场景包
- [ ] 软删除的场景包不返回
- [ ] 响应包含 Cache-Control 头（max-age=300）
- [ ] 数据库查询失败时返回 500 错误
- [ ] 响应时间 < 2 秒

### 集成测试清单
- [ ] 前后端数据格式完全一致
- [ ] Zod 验证通过（无格式错误）
- [ ] 缓存策略正常工作
- [ ] 超时处理正常（10秒超时）

---

## 🐛 常见问题排查

### Q1: Zod 验证失败 "Invalid type"
**原因**: API 返回的数据结构与前端类型定义不匹配

**解决方案**:
1. 检查后端 DTO 字段是否与 OpenAPI 规范一致
2. 检查 Zod Schema 是否正确定义（如 optional 字段）
3. 使用 `console.log(response)` 打印原始响应查看实际数据结构

### Q2: 跨域错误（CORS）
**原因**: 后端未配置跨域支持

**解决方案**:
```java
@CrossOrigin(origins = "http://localhost:10086")  // Taro H5 默认端口
```

### Q3: 缓存不生效
**原因**: TanStack Query 配置错误或 queryKey 不一致

**解决方案**:
1. 检查 `staleTime` 和 `cacheTime` 配置
2. 确保 queryKey 在不同地方使用时完全一致
3. 使用浏览器 DevTools 查看 Network 面板确认是否发起新请求

### Q4: 图片加载失败
**原因**: 图片 URL 无效或跨域限制

**解决方案**:
1. 检查 Supabase Storage 图片是否为公开访问
2. 使用默认占位图：`onError={(e) => { e.currentTarget.src = '/assets/placeholder.png' }}`

---

## 📚 参考资源

- [Taro 官方文档](https://taro-docs.jd.com/docs/)
- [TanStack Query 文档](https://tanstack.com/query/latest/docs/react/overview)
- [Zod 文档](https://zod.dev/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Supabase 文档](https://supabase.com/docs)
- [OpenAPI 3.0 规范](https://spec.openapis.org/oas/v3.0.3)

---

## 📝 后续步骤

1. **创建测试数据**: 在 Supabase 数据库中插入测试场景包数据
2. **配置环境变量**: 设置正确的 API Base URL（开发/生产环境）
3. **实现详情页**: 用户点击场景包卡片跳转到详情页
4. **集成真实后端**: 将 Mock 数据替换为真实的 Spring Boot API

---

**提示**: 本指南涵盖了从零开始的完整开发流程。如遇到问题，请参考规格说明 (`spec.md`)、数据模型 (`data-model.md`) 和 API 契约 (`contracts/api.yaml`)。

## 🔧 环境配置（T057 补充）

### API Base URL 配置说明

#### 开发环境配置

**前端配置** (`hall-reserve-taro/src/utils/request.ts`):

```typescript
// 开发环境 API 地址配置
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-domain.com' // 生产环境 API 地址
  }

  if (process.env.TARO_ENV === 'weapp') {
    // 微信小程序环境：使用真实域名（小程序不支持 localhost）
    return 'https://your-dev-domain.com'
  }

  // H5 开发环境：使用本地后端
  return 'http://localhost:8080'
}

export const BASE_URL = getBaseURL()
```

**后端配置** (`backend/src/main/resources/application.yml`):

```yaml
server:
  port: 8080

spring:
  profiles:
    active: dev  # 开发环境
```

#### 环境变量设置

**本地开发** (`.env` 文件):

```bash
# Supabase 配置（开发环境）
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=http://localhost:8080
```

**生产环境** (云服务器环境变量):

```bash
PROD_SUPABASE_PROJECT_URL=https://prod-project.supabase.co
PROD_SUPABASE_ANON_KEY=prod-anon-key
API_BASE_URL=https://your-production-api.com
```

---

## ✅ 完整验收测试清单（T060）

### 前端测试 ✅

- [x] Taro H5 开发服务器运行成功 (`npm run dev:h5`)
- [x] 微信小程序开发模式运行成功 (`npm run dev:weapp`)
- [x] 首页加载场景包列表（至少 3 条数据）
- [x] TanStack Query 缓存生效（5 分钟内无重复请求）
- [x] 图片懒加载功能正常
- [x] 评分条件显示正确（rating 为 null 时不显示）
- [x] 错误处理 UI 正常（ErrorState 组件）
- [x] 空状态 UI 正常（EmptyState 组件）
- [x] 重试按钮功能正常

### 后端测试 ✅

- [x] Spring Boot 应用启动成功 (`./mvnw spring-boot:run`)
- [x] API 端点返回正确数据 (`GET /api/scenario-packages/published`)
- [x] Cache-Control 响应头正确设置（max-age=300）
- [x] 数据库查询仅返回 PUBLISHED 状态的场景包
- [x] DTO 字段符合前端 Zod Schema 定义
- [x] 异常处理返回正确的 ErrorResponse 格式
- [x] 后端单元测试通过 (`./mvnw test`)

### 集成测试 ✅

- [x] 前后端联调成功（API 请求返回 200）
- [x] 错误场景测试（详见 manual-testing-guide.md）
- [x] 重试功能测试（详见 manual-testing-guide.md）
- [x] 空状态测试（详见 manual-testing-guide.md）
- [x] 网络断开测试（详见 manual-testing-guide.md）

### 性能测试

- [ ] 首屏加载时间 < 2 秒（待实际测量，详见 performance-validation.md）
- [x] 缓存命中时加载时间 < 500ms
- [x] 图片懒加载生效
- [x] API 响应缓存生效

### 代码质量 ✅

- [x] 前端代码格式一致（详见 code-quality-report.md）
- [x] 后端 JavaDoc 注释完整（详见 code-quality-report.md）
- [x] TypeScript 类型安全
- [x] 无编译错误和警告

---

## 📚 补充文档链接

- **手动测试指南**: `manual-testing-guide.md`
- **代码质量报告**: `code-quality-report.md`
- **性能验证报告**: `performance-validation.md`


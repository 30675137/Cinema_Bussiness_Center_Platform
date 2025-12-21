# 前后端 API 字段差异分析与修改方案

**功能**: 018-hall-reserve-homepage  
**日期**: 2025-12-21  
**状态**: ✅ 已完成

---

## 目录

1. [API 接口定义](#一api-接口定义)
2. [数据模型对比](#二数据模型对比)
3. [后台管理功能](#三后台管理功能)
4. [字段差异分析](#四字段差异分析)
5. [修改方案](#五修改方案)
6. [前端字段映射表](#十前端字段映射表)
7. [修改记录](#十一修改记录)

---

## 一、API 接口定义

### 1.1 C端小程序首页 API（本次重点）

| 属性 | 值 |
|-----|----|
| **端点** | `GET /api/scenario-packages/published` |
| **用途** | 获取已发布的场景包列表，用于 Taro 小程序首页展示 |
| **认证** | 无需认证（公开接口） |
| **缓存** | Cache-Control: max-age=300（5分钟） |

#### 请求参数

无请求参数

#### 响应格式（当前后端返回）✅ 已修复

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "title": "VIP 生日派对专场",
      "category": "PARTY",
      "image": "https://storage.supabase.co/...",
      "packagePrice": 1888.00,
      "rating": 4.5,
      "tags": ["生日", "派对", "VIP"],
      "location": "北京·精选场馆",
      "packages": [
        {
          "id": "uuid-001",
          "name": "基础套餐",
          "price": 1888.00,
          "originalPrice": 2265.60,
          "desc": "场景包描述",
          "tags": ["推荐"]
        }
      ]
    }
  ],
  "message": "",
  "timestamp": "2025-12-21T10:00:00Z"
}
```

#### 响应格式（前端期望）

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "title": "VIP 生日派对专场",
      "category": "PARTY",
      "image": "https://storage.supabase.co/...",
      "location": "耀莱成龙影城（五棵松店）",
      "rating": 4.5,
      "tags": ["生日", "派对", "VIP"],
      "packages": [
        {
          "id": "pkg-001",
          "name": "基础套餐",
          "price": 1888,
          "originalPrice": 2500,
          "desc": "包含场地费、基础设备",
          "tags": ["推荐"]
        }
      ]
    }
  ],
  "timestamp": "2025-12-21T10:00:00Z"
}
```

---

### 1.2 后端 API 完整列表

#### C端小程序 API（公开接口）

| 端点 | 方法 | 说明 | 认证 | 缓存 |
|------|------|------|------|------|
| `/api/scenario-packages/published` | GET | 获取已发布场景包列表 | 无需 | 5分钟 |

#### B端后台管理 API（需认证）

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/scenario-packages` | GET | 分页查询场景包列表 | 需要 |
| `/api/scenario-packages` | POST | 创建场景包 | 需要 |
| `/api/scenario-packages/{id}` | GET | 获取场景包详情 | 需要 |
| `/api/scenario-packages/{id}` | PUT | 更新场景包 | 需要 |
| `/api/scenario-packages/{id}` | DELETE | 删除场景包（软删除） | 需要 |
| `/api/scenario-packages/{id}/image` | POST | 生成图片上传 URL | 需要 |
| `/api/scenario-packages/{id}/image` | PATCH | 确认图片上传 | 需要 |
| `/api/scenario-packages/{id}/rules` | PUT | 配置规则 | 需要 |
| `/api/scenario-packages/{id}/benefits` | POST | 添加硬权益 | 需要 |
| `/api/scenario-packages/{id}/benefits/{benefitId}` | DELETE | 删除硬权益 | 需要 |
| `/api/scenario-packages/{id}/items` | POST | 添加单品 | 需要 |
| `/api/scenario-packages/{id}/items/{itemId}` | DELETE | 删除单品 | 需要 |
| `/api/scenario-packages/{id}/services` | POST | 添加服务 | 需要 |
| `/api/scenario-packages/{id}/services/{serviceId}` | DELETE | 删除服务 | 需要 |

---

## 二、数据模型对比

### 2.1 后端数据模型（数据库）

#### scenario_packages 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| base_package_id | UUID | 版本分组 ID |
| version | INTEGER | 版本号 |
| name | VARCHAR(255) | 场景包名称 |
| description | TEXT | 描述 |
| `image` | TEXT | 图片 URL（原 background_image_url，V4 迁移已重命名） |
| status | ENUM | DRAFT/PUBLISHED/UNPUBLISHED |
| is_latest | BOOLEAN | 是否最新版本 |
| version_lock | INTEGER | 乐观锁 |
| category | ENUM | MOVIE/TEAM/PARTY |
| rating | DECIMAL(3,2) | 评分 0-5 |
| tags | JSONB | 业务标签数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 软删除时间 |
| created_by | VARCHAR(100) | 创建人 |

#### package_pricing 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| package_id | UUID | 场景包 ID（外键） |
| package_price | DECIMAL(10,2) | 打包一口价 |
| reference_price_snapshot | DECIMAL(10,2) | 参考价格 |
| discount_percentage | DECIMAL(5,2) | 折扣百分比 |
| discount_amount | DECIMAL(10,2) | 折扣金额 |

#### 关联表

- `package_benefits` - 硬权益
- `package_items` - 单品
- `package_services` - 服务
- `package_rules` - 规则配置
- `package_hall_associations` - 场馆关联

---

### 2.2 前端数据模型（TypeScript）

#### 前端 types/index.ts（首页使用）

```typescript
interface Scenario {
  id: string
  title: string
  image: string                // ⚠️ 后端返回 backgroundImageUrl
  category: 'MOVIE' | 'TEAM' | 'PARTY'
  tags: string[]
  location: string             // ⚠️ 后端未返回
  rating: number
  packages: ScenarioPackage[]  // ⚠️ 后端未返回
}

interface ScenarioPackage {
  id: string
  name: string
  price: number
  originalPrice: number
  desc: string
  tags: string[]
}
```

#### 前端 types/scenario.ts（API 契约定义）

```typescript
interface ScenarioPackageListItem {
  id: string
  title: string
  category: 'MOVIE' | 'TEAM' | 'PARTY'
  backgroundImageUrl: string
  packagePrice: number
  rating?: number
  tags: string[]
}
```

---

### 2.3 后端 DTO 模型

#### ScenarioPackageListItemDTO.java（C端列表）✅ 已修复

```java
public class ScenarioPackageListItemDTO {
    private UUID id;
    private String title;
    private PackageCategory category;
    private String image;              // ✅ 已从 backgroundImageUrl 重命名
    private BigDecimal packagePrice;
    private BigDecimal rating;
    private List<String> tags;
    private String location;           // ✅ 已新增
    private List<PackageSummary> packages;  // ✅ 已新增
    
    // PackageSummary 内部类
    public static class PackageSummary {
        private String id;
        private String name;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String desc;
        private List<String> tags;
    }
}
```

#### ScenarioPackageDTO.java（B端详情）

```java
public class ScenarioPackageDTO {
    private UUID id;
    private UUID basePackageId;
    private Integer version;
    private Integer versionLock;
    private String name;
    private String description;
    private String backgroundImageUrl;
    private PackageStatus status;
    private Boolean isLatest;
    private PackageRuleDTO rule;
    private List<HallTypeDTO> hallTypes;
    private List<PackageBenefitDTO> benefits;
    private List<PackageItemDTO> items;
    private List<PackageServiceDTO> services;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
}
```

---

## 三、后台管理功能

### 3.1 场景包管理（B端）

| 功能模块 | 说明 | 对应 API |
|---------|------|----------|
| **场景包列表** | 分页查询、搜索、筛选 | GET /api/scenario-packages |
| **创建场景包** | 填写基本信息、上传图片 | POST /api/scenario-packages |
| **编辑场景包** | 修改基本信息 | PUT /api/scenario-packages/{id} |
| **删除场景包** | 软删除 | DELETE /api/scenario-packages/{id} |
| **发布/下架** | 状态变更 | PUT /api/scenario-packages/{id} |
| **图片管理** | Supabase Storage 上传 | POST/PATCH /{id}/image |
| **规则配置** | 时长、人数限制 | PUT /{id}/rules |
| **权益管理** | 添加/删除硬权益 | POST/DELETE /{id}/benefits |
| **单品管理** | 添加/删除单品 | POST/DELETE /{id}/items |
| **服务管理** | 添加/删除服务 | POST/DELETE /{id}/services |

### 3.2 配置项来源分析

前端首页需要的字段与后台配置的关系：

| 前端字段 | 后台配置位置 | 当前状态 |
|---------|-------------|----------|
| `title` | 场景包基本信息 - 名称 | ✅ 已有 |
| `image` | 场景包 - 背景图片上传 | ✅ 已有（字段名不同） |
| `category` | 场景包基本信息 - 分类 | ✅ 已有 |
| `rating` | 场景包基本信息 - 评分 | ✅ 已有 |
| `tags` | 场景包基本信息 - 标签 | ✅ 已有 |
| `location` | **场馆关联** - 场馆名称 | ⚠️ 需从关联表获取 |
| `packages[0].price` | **定价配置** - 打包一口价 | ⚠️ 需从 pricing 表获取 |
| `packages[0].originalPrice` | **定价配置** - 参考价格 | ⚠️ 需从 pricing 表获取 |
| `packages[0].name` | 固定值或配置 | ⚠️ 需新增字段 |
| `packages[0].desc` | 场景包 - 描述 | ✅ 可复用 |

### 3.3 数据来源映射

```
前端 Scenario
├── id          ← scenario_packages.id
├── title       ← scenario_packages.name
├── image       ← scenario_packages.background_image_url
├── category    ← scenario_packages.category
├── rating      ← scenario_packages.rating
├── tags        ← scenario_packages.tags
├── location    ← package_hall_associations → stores.name（需 JOIN）
└── packages[]
    ├── id          ← package_pricing.id
    ├── name        ← 固定"基础套餐" 或新增字段
    ├── price       ← package_pricing.package_price
    ├── originalPrice ← package_pricing.reference_price_snapshot
    ├── desc        ← scenario_packages.description
    └── tags        ← 固定[] 或新增字段
```

---

## 四、字段差异分析

### 4.1 差异总览

| 问题类型 | 数量 | 优先级 |
|---------|------|--------|
| 字段名不一致 | 1 处 | P1 |
| 后端缺失字段 | 2 处 | P1 |
| 数据结构差异 | 1 处 | P2 |

---

### 4.2 详细差异分析

### 2.1 字段名不一致

| 前端使用 | API 契约定义 | 后端返回 | 说明 |
|---------|-------------|---------|------|
| `image` | `backgroundImageUrl` | `backgroundImageUrl` | 前端首页代码使用 `image`，与契约不符 |

**文件位置**:
- 前端: `hall-reserve-taro/src/pages/home/index.tsx` Line 116
- 后端: `ScenarioPackageListItemDTO.java` Line 45

**现状**:
```tsx
// 前端首页使用
<Image src={scenario.image} ... />
```

```java
// 后端返回
private String backgroundImageUrl;
```

---

### 2.2 后端缺失字段

#### (1) `location` 字段 - **P1 高优先级**

| 属性 | 值 |
|-----|---|
| 字段名 | `location` |
| 类型 | `String` |
| 前端用途 | 显示场馆位置（如"耀莱成龙影城（五棵松店）"） |
| 后端现状 | ❌ 缺失 |

**前端使用位置**: `hall-reserve-taro/src/pages/home/index.tsx` Line 152-153
```tsx
<Text className="location-text">{scenario.location}</Text>
```

---

#### (2) `packages` 字段 - **P1 高优先级**

| 属性 | 值 |
|-----|---|
| 字段名 | `packages` |
| 类型 | `Array<Package>` |
| 前端用途 | 显示起价（packages[0].price） |
| 后端现状 | ❌ 缺失（仅有 `packagePrice` 单一价格） |

**Package 结构**:
```typescript
interface Package {
  id: string
  name: string
  price: number        // 当前价格
  originalPrice: number // 原价
  desc: string
  tags: string[]
}
```

**前端使用位置**: `hall-reserve-taro/src/pages/home/index.tsx` Line 156
```tsx
<Text className="price">¥{scenario.packages[0].price}</Text>
```

---

### 2.3 类型定义不一致

#### 前端 types/scenario.ts vs 前端 pages/home/index.tsx

| types/scenario.ts (API 契约) | pages/home/index.tsx (实际使用) |
|-----------------------------|-------------------------------|
| `backgroundImageUrl` | `image` |
| `packagePrice` (number) | `packages[0].price` |
| ❌ 无 | `location` |
| ❌ 无 | `packages` 数组 |

**根本原因**: 前端首页使用的 `Scenario` 类型与 API 契约定义的 `ScenarioPackageListItem` 类型不一致。

---

## 五、修改方案

### 5.1 方案 A: 后端适配前端（推荐）

**修改后端 DTO，返回前端需要的完整数据结构**

#### 3.1 修改 ScenarioPackageListItemDTO.java

**新增字段**:
```java
// 场馆位置（关联 stores 表）
private String location;

// 套餐列表（简化版，仅包含列表展示所需字段）
private List<PackageSummary> packages;
```

**新增内部类 PackageSummary**:
```java
public static class PackageSummary {
    private String id;
    private String name;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String desc;
    private List<String> tags;
    // getters/setters
}
```

#### 3.2 修改 ScenarioPackageService.java

**更新查询逻辑**，从数据库关联查询 location 和 packages 数据。

#### 3.3 字段映射关系

| 后端字段 | 前端字段 | 说明 |
|---------|---------|------|
| `backgroundImageUrl` | `image` | 需要兼容，或修改前端 |
| `location` (新增) | `location` | 从 stores 表关联查询 |
| `packages` (新增) | `packages` | 从 pricing 表关联查询 |
| `packagePrice` | `packages[0].price` | 保持兼容 |

---

### 5.2 方案 B: 前端适配后端

**修改前端代码，使用 API 契约定义的字段**

#### 3.1 修改 pages/home/index.tsx

```tsx
// 修改前
<Image src={scenario.image} ... />
<Text>{scenario.location}</Text>
<Text>¥{scenario.packages[0].price}</Text>

// 修改后
<Image src={scenario.backgroundImageUrl} ... />
<Text>北京（默认值）</Text>  // location 需要另外获取
<Text>¥{scenario.packagePrice}</Text>
```

#### 3.2 修改 types/index.ts

统一使用 `ScenarioPackageListItem` 类型替代 `Scenario` 类型。

---

## 六、推荐方案：后端适配前端 (方案 A)

### 理由

1. **用户体验优先**: 首页需要展示完整信息（位置、套餐价格等）
2. **减少前端复杂度**: 避免前端需要多次 API 调用获取关联数据
3. **符合 BFF 模式**: 后端为前端定制接口是常见做法

### 修改任务清单

| 序号 | 任务 | 文件 | 优先级 |
|------|------|------|--------|
| 1 | 新增 PackageSummary 内部类 | ScenarioPackageListItemDTO.java | P1 |
| 2 | 新增 location 字段 | ScenarioPackageListItemDTO.java | P1 |
| 3 | 新增 packages 字段 | ScenarioPackageListItemDTO.java | P1 |
| 4 | 修改 Service 查询逻辑 | ScenarioPackageService.java | P1 |
| 5 | 更新 API 契约文档 | contracts/api.yaml | P2 |
| 6 | 更新前端类型定义 | types/scenario.ts | P2 |
| 7 | 统一前端 Scenario 类型 | types/index.ts | P2 |

---

## 七、详细修改内容

### 7.1 ScenarioPackageListItemDTO.java 修改

```java
// 新增字段
/**
 * 场馆位置（关联 stores 表获取）
 */
private String location;

/**
 * 图片 URL（兼容前端 image 字段）
 * 通过 Jackson 注解同时返回 image 和 backgroundImageUrl
 */
@JsonProperty("image")
public String getImage() {
    return backgroundImageUrl;
}

/**
 * 套餐列表（简化版）
 */
private List<PackageSummary> packages;

/**
 * 套餐摘要（列表展示用）
 */
public static class PackageSummary {
    private String id;
    private String name;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String desc;
    private List<String> tags;
    
    // constructors, getters, setters
}
```

### 7.2 ScenarioPackageService.java 修改

```java
public List<ScenarioPackageListItemDTO> findPublishedPackagesForTaro() {
    // 1. 查询已发布场景包
    List<ScenarioPackage> packages = repository.findByStatusAndDeletedAtIsNull(Status.PUBLISHED);
    
    // 2. 转换为 DTO，填充 location 和 packages 字段
    return packages.stream()
        .map(this::toListItemDTO)
        .collect(Collectors.toList());
}

private ScenarioPackageListItemDTO toListItemDTO(ScenarioPackage pkg) {
    ScenarioPackageListItemDTO dto = new ScenarioPackageListItemDTO();
    dto.setId(pkg.getId());
    dto.setTitle(pkg.getName());
    dto.setCategory(pkg.getCategory());
    dto.setBackgroundImageUrl(pkg.getBackgroundImageUrl());
    dto.setPackagePrice(pkg.getPackagePrice());
    dto.setRating(pkg.getRating());
    dto.setTags(pkg.getTags());
    
    // 新增：填充 location（从关联 store 获取，或使用默认值）
    dto.setLocation(pkg.getStoreName() != null ? pkg.getStoreName() : "北京·精选场馆");
    
    // 新增：填充 packages（从 pricing 获取）
    dto.setPackages(buildPackageSummaries(pkg));
    
    return dto;
}
```

---

## 八、验收标准

| 序号 | 验收项 | 状态 | 验证日期 |
|------|--------|------|----------|
| 1 | 后端 `/api/scenario-packages/published` 返回包含 `location` 字段 | ✅ 通过 | 2025-12-21 |
| 2 | 后端返回包含 `packages` 数组，每个元素有 `id`, `name`, `price`, `originalPrice`, `desc`, `tags` | ✅ 通过 | 2025-12-21 |
| 3 | 后端返回 `image` 字段（全局重命名，不再返回 backgroundImageUrl） | ✅ 通过 | 2025-12-21 |
| 4 | 前端首页正常显示场馆位置和套餐价格 | ✅ 通过 | 2025-12-21 |
| 5 | Chrome DevTools 测试通过 | ✅ 通过 | 2025-12-21 |
| 6 | CORS 跨域问题已修复（localhost:10086） | ✅ 通过 | 2025-12-21 |
| 7 | message 字段返回空字符串（非 null） | ✅ 通过 | 2025-12-21 |

---

## 九、附录：数据结构对比

### 前端期望（pages/home/index.tsx 使用）

```typescript
interface Scenario {
  id: string
  title: string
  category: 'MOVIE' | 'TEAM' | 'PARTY'
  image: string           // ⚠️ 注意：不是 backgroundImageUrl
  location: string        // ⚠️ 后端缺失
  rating?: number
  tags: string[]
  packages: Package[]     // ⚠️ 后端缺失
}

interface Package {
  id: string
  name: string
  price: number
  originalPrice: number
  desc: string
  tags: string[]
}
```

### 后端当前返回（ScenarioPackageListItemDTO）

```java
class ScenarioPackageListItemDTO {
    UUID id;
    String title;
    PackageCategory category;
    String backgroundImageUrl;   // ⚠️ 前端使用 image
    BigDecimal packagePrice;     // ⚠️ 前端使用 packages[0].price
    BigDecimal rating;
    List<String> tags;
    // ❌ 缺少 location
    // ❌ 缺少 packages
}
```

### 修改后后端返回（当前状态）✅ 已实现

```java
class ScenarioPackageListItemDTO {
    UUID id;
    String title;
    PackageCategory category;
    String image;               // ✅ 已重命名（原 backgroundImageUrl）
    String location;            // ✅ 已新增
    BigDecimal packagePrice;
    BigDecimal rating;
    List<String> tags;
    List<PackageSummary> packages;  // ✅ 已新增
}
```

---

## 十、前端字段映射表

### 10.1 首页场景包卡片字段映射

| 前端字段 | 前端类型 | 后端 DTO 字段 | 后端类型 | 数据来源 | 状态 |
|---------|---------|--------------|---------|---------|------|
| `id` | `string` | `id` | `UUID` | `scenario_packages.id` | ✅ |
| `title` | `string` | `title` | `String` | `scenario_packages.name` | ✅ |
| `category` | `'MOVIE' \| 'TEAM' \| 'PARTY'` | `category` | `PackageCategory` | `scenario_packages.category` | ✅ |
| `image` | `string` | `image` | `String` | `scenario_packages.image` | ✅ |
| `rating` | `number` | `rating` | `BigDecimal` | `scenario_packages.rating` | ✅ |
| `tags` | `string[]` | `tags` | `List<String>` | `scenario_packages.tags (JSONB)` | ✅ |
| `location` | `string` | `location` | `String` | 默认值（待关联 stores 表） | ✅ |
| `packages` | `Package[]` | `packages` | `List<PackageSummary>` | 构建自 pricing 数据 | ✅ |

### 10.2 套餐摘要字段映射 (packages[])

| 前端字段 | 前端类型 | 后端字段 | 后端类型 | 数据来源 | 状态 |
|---------|---------|---------|---------|---------|------|
| `id` | `string` | `id` | `String` | `scenario_packages.id` | ✅ |
| `name` | `string` | `name` | `String` | 固定值 "基础套餐" | ✅ |
| `price` | `number` | `price` | `BigDecimal` | `package_pricing.package_price` | ✅ |
| `originalPrice` | `number` | `originalPrice` | `BigDecimal` | `price * 1.2` 计算 | ✅ |
| `desc` | `string` | `desc` | `String` | `scenario_packages.description` | ✅ |
| `tags` | `string[]` | `tags` | `List<String>` | 固定值 `["推荐"]` | ✅ |

### 10.3 前端 Zod Schema 定义

**文件**: `hall-reserve-taro/src/types/scenario.ts`

```typescript
// 套餐摘要 Schema
export const PackageSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  desc: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// 场景包列表项 Schema
export const ScenarioPackageListItemSchema = z.object({
  id: z.string().min(1, '场景包 ID 不能为空'),
  title: z.string().min(1, '标题不能为空'),
  category: z.enum(['MOVIE', 'TEAM', 'PARTY']),
  image: z.string().url('背景图片 URL 格式不正确'),
  packagePrice: z.number().positive('价格必须为正数'),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
  location: z.string().optional(),
  packages: z.array(PackageSummarySchema).optional(),
})
```

---

## 十一、修改记录

| 日期 | 修改内容 | 修改文件 | 操作人 |
|------|---------|---------|--------|
| 2025-12-21 | CORS 配置添加 localhost:10086 | `CorsConfig.java` | AI |
| 2025-12-21 | ApiResponse.success() 返回空字符串 | `ApiResponse.java` | AI |
| 2025-12-21 | 数据库字段 background_image_url → image | `V4__rename_background_image_url_to_image.sql` | AI |
| 2025-12-21 | 后端模型 backgroundImageUrl → image | `ScenarioPackage.java` | AI |
| 2025-12-21 | 后端 DTO backgroundImageUrl → image | `ScenarioPackageDTO.java`, `ScenarioPackageListItemDTO.java`, `ScenarioPackageSummary.java` | AI |
| 2025-12-21 | 请求 DTO backgroundImageUrl → image | `CreatePackageRequest.java`, `UpdatePackageRequest.java` | AI |
| 2025-12-21 | 新增 location 字段 | `ScenarioPackageListItemDTO.java` | AI |
| 2025-12-21 | 新增 packages 字段和 PackageSummary 类 | `ScenarioPackageListItemDTO.java` | AI |
| 2025-12-21 | Service 填充 location 和 packages | `ScenarioPackageService.java` | AI |
| 2025-12-21 | 前端 Zod Schema 同步更新 | `hall-reserve-taro/src/types/scenario.ts` | AI |

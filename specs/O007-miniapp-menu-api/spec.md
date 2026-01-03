# Feature Specification: 小程序菜单与商品API集成（阶段一）

**Feature Branch**: `O007-miniapp-menu-api`
**Created**: 2026-01-03
**Status**: Draft
**Input**: 基于现有分支 新建分支 完成 miniapp-ordering-taro的API开发与联调 第一阶段 "1. 菜单:获取 "经典特调""精品咖啡""经典饮品""主厨小食" 2. 商品列表:商品列表 API(按分类/分页/上下架/可售渠道) 1. 商品卡片 / 列表项:商品摘要 API(商品id、名称、图、标签、最小售卖单位等)" 要先分析 API是否存在 如果存在字段是否满足并根据这些内容构建需求计划

## 背景与问题

### 现状

基于 O006-miniapp-channel-order 规格，后端已完成渠道商品配置(Channel Product Config)的完整实现，包括:
- 商品数据模型(含分类、规格、价格、图片)
- 完整的 REST API 端点(商品列表、详情、规格)
- 图片上传与存储(Supabase Storage)
- 分类过滤与排序逻辑

`miniapp-ordering-taro` 前端项目需要集成这些后端 API，实现第一阶段的核心功能:展示商品菜单和商品列表卡片。

### 问题

1. **前端未集成后端API**: 小程序 Taro 项目尚未调用后端商品 API，当前使用 mock 数据或无数据
2. **分类名称映射缺失**: 后端使用枚举(`ALCOHOL`, `COFFEE`, `BEVERAGE`, `SNACK`)，设计稿使用中文名("经典特调", "精品咖啡", "经典饮品", "主厨小食")，需要建立映射关系
3. **数据结构不一致**: 前端组件期望的数据结构可能与后端 DTO 不完全匹配，需要适配层
4. **错误处理缺失**: 网络异常、API 超时、数据格式错误等场景未处理

### 核心目标

实现 miniapp-ordering-taro 前端与后端商品 API 的完整集成，使用户能够在小程序中:
- 查看商品分类菜单(4个核心分类:经典特调、精品咖啡、经典饮品、主厨小食)
- 按分类浏览商品列表
- 查看商品卡片信息(图片、名称、价格、标签)

---

## Clarifications

### Session 2026-01-03

- Q: 商品图片访问权限策略? → A: 公开访问URL，无需认证（简化实现，符合商品展示场景）
  - **技术债**: 已记录安全问题到飞书 (Spike, P3) - 需要在后续版本评估私有URL方案
- Q: Token刷新失败后的处理策略? → A: 自动触发静默登录重试（调用wx.login()获取新code，后端换取Token），用户无感知，失败后才提示授权
- Q: 商品数据变更的实时同步策略? → A: 定期后台轮询，每1分钟刷新一次数据（TanStack Query refetchInterval配置），用户无感知，平衡数据新鲜度与性能

---

## User Scenarios & Testing

### User Story 1 - 查看商品分类菜单 (Priority: P1)

作为小程序用户，我希望在点餐页面看到商品分类标签栏，显示"经典特调"、"精品咖啡"、"经典饮品"、"主厨小食"四个核心分类，点击后可以筛选对应类别的商品。

**Why this priority**: 这是商品浏览的入口，是用户使用小程序点餐的第一步，也是最基础的导航功能。没有分类菜单，用户无法高效浏览商品。

**Independent Test**: 用户打开小程序点餐页 → 查看顶部分类标签栏 → 验证显示4个分类 → 点击任一分类 → 验证列表仅显示该类商品。

**Acceptance Scenarios**:

1. **Given** 用户首次打开小程序点餐页，**When** 页面加载完成，**Then** 显示分类标签栏，包含"全部"、"经典特调"、"精品咖啡"、"经典饮品"、"主厨小食"五个选项
2. **Given** 用户在分类标签栏，**When** 默认选中"全部"分类，**Then** 显示所有状态为ACTIVE的小程序渠道商品
3. **Given** 用户点击"经典特调"标签，**When** 调用API筛选ALCOHOL分类，**Then** 列表仅显示ALCOHOL分类的商品，标签高亮显示
4. **Given** 后端某分类无商品，**When** 用户选择该分类，**Then** 显示"暂无该分类商品"的空状态提示
5. **Given** API调用失败，**When** 分类菜单加载，**Then** 显示"加载失败，请重试"提示，并提供重试按钮

---

### User Story 2 - 浏览商品列表卡片 (Priority: P1)

作为小程序用户，我希望在选择分类后，看到该分类下的所有商品以卡片形式展示，每个卡片显示商品图片、名称、价格、推荐标签等信息，方便我快速了解商品。

**Why this priority**: 商品卡片是用户选择商品的关键界面，必须清晰展示商品核心信息，直接影响用户的购买决策。

**Independent Test**: 用户选择任一分类 → 查看商品列表 → 验证每个商品卡片包含图片、名称、价格、推荐标签 → 点击卡片进入详情页。

**Acceptance Scenarios**:

1. **Given** 用户选择"精品咖啡"分类，**When** 商品列表加载，**Then** 显示所有COFFEE分类的商品卡片，按推荐、排序、创建时间排序
2. **Given** 某商品为推荐商品(`isRecommended: true`)，**When** 卡片渲染，**Then** 显示"推荐"角标(左上角或醒目位置)
3. **Given** 商品主图加载失败，**When** 卡片渲染，**Then** 显示默认占位图，不影响其他信息显示
4. **Given** 商品价格为2800分(28元)，**When** 卡片显示价格，**Then** 格式化为"¥28.00"或"¥28"
5. **Given** 用户点击商品卡片，**When** 触发点击事件，**Then** 跳转到商品详情页，传递商品ID参数

---

### User Story 3 - 处理网络异常与加载状态 (Priority: P2)

作为小程序用户，我希望在网络较差或API调用失败时，看到友好的提示信息，而不是白屏或无响应，并且能够手动重试加载。

**Why this priority**: 良好的错误处理能提升用户体验，避免用户因网络问题放弃使用。虽然不是核心功能，但对用户留存有重要影响。

**Independent Test**: 断开网络 → 打开小程序 → 验证显示错误提示和重试按钮 → 恢复网络 → 点击重试 → 验证成功加载数据。

**Acceptance Scenarios**:

1. **Given** 用户打开小程序，**When** 首次加载商品列表，**Then** 显示骨架屏或加载动画(loading状态)，提示"加载中..."
2. **Given** API请求超时(>10秒)，**When** 请求失败，**Then** 隐藏加载状态，显示"网络超时，请检查网络后重试"提示和重试按钮
3. **Given** 后端返回500错误，**When** API调用失败，**Then** 显示"服务异常，请稍后重试"提示
4. **Given** 用户点击重试按钮，**When** 触发重新加载，**Then** 再次调用API，重新显示加载状态
5. **Given** 用户离线，**When** 尝试加载商品，**Then** 显示"网络已断开，请检查网络连接"提示

---

### Edge Cases

- **分类无商品**: 后台某分类下所有商品均为INACTIVE或已删除，前端显示空状态提示"暂无该分类商品"
- **商品图片缺失**: 某商品mainImage为空或null，显示默认占位图(存储在`assets/images/placeholder-product.png`)
- **价格为0**: 商品basePrice为0(如赠品)，显示"免费"或"¥0"
- **商品名称过长**: 商品displayName超过UI卡片宽度，使用省略号截断(如"超长商品名称超长..."，最多显示2行)
- **API返回空数组**: 后端返回`data: []`且total为0，视为正常空数据，显示"暂无商品"空状态
- **Token过期**: API返回401状态码，**自动触发静默登录重试**（调用wx.login()获取新code，后端换取Token），用户无感知；若静默登录失败，显示授权提示引导用户手动授权
- **商品数据变更**: 用户浏览期间商品状态/价格/库存变更，**系统每1分钟后台轮询刷新数据**（TanStack Query refetchInterval），确保数据相对新鲜；用户手动下拉刷新或切换分类会立即更新
- **多次快速切换分类**: 用户快速点击多个分类标签，防抖处理，仅处理最后一次点击的API请求

---

## Requirements

### Functional Requirements

**API集成**:

- **FR-001**: 系统必须调用后端 `GET /api/client/channel-products/mini-program` 接口获取商品列表
- **FR-002**: 系统必须在调用API时携带 `Authorization: Bearer {jwt_token}` 认证头
- **FR-003**: 系统必须支持通过 `?category={ChannelCategory}` 查询参数筛选商品分类
- **FR-004**: 系统必须将后端返回的 `ChannelProductDTO[]` 映射为前端所需的数据结构

**分类菜单**:

- **FR-005**: 系统必须显示5个分类选项:"全部"、"经典特调"(ALCOHOL)、"精品咖啡"(COFFEE)、"经典饮品"(BEVERAGE)、"主厨小食"(SNACK)
- **FR-006**: 系统必须在前端维护分类枚举到显示名称的映射字典
- **FR-007**: 系统必须在用户点击分类时，调用对应category参数的API接口
- **FR-008**: 系统必须高亮显示当前选中的分类标签

**商品卡片展示**:

- **FR-009**: 系统必须在商品卡片中显示:主图(mainImage)、商品名称(displayName)、基础价格(basePrice格式化为元)
- **FR-010**: 系统必须在商品为推荐商品时(`isRecommended: true`)显示"推荐"角标
- **FR-011**: 系统必须在商品主图缺失时显示默认占位图
- **FR-012**: 系统必须将价格从分(cents)转换为元(yuan)显示(如2800分显示为"¥28")
- **FR-013**: 系统必须在商品名称超过2行时使用省略号截断

**数据排序**:

- **FR-014**: 系统必须按后端返回的顺序显示商品(后端已排序:推荐→手动排序→创建时间)
- **FR-015**: 系统不得在前端重新排序商品，除非明确的用户交互(如价格排序，但Phase 1不包含)

**加载与错误处理**:

- **FR-016**: 系统必须在API请求进行中显示加载状态(骨架屏或加载动画)
- **FR-017**: 系统必须在API请求失败时显示友好错误提示和重试按钮
- **FR-018**: 系统必须在Token过期(401)时**自动触发静默登录重试**（调用wx.login()获取新code，后端换取Token），用户无感知；若静默登录失败，显示授权提示引导用户手动授权
- **FR-019**: 系统必须在请求超时(>10秒)或网络错误时显示"网络异常"提示
- **FR-020**: 系统必须在商品列表为空时显示"暂无商品"空状态提示

**性能优化**:

- **FR-021**: 系统必须对快速切换分类的操作进行防抖处理(300ms延迟)
- **FR-022**: 系统必须缓存已加载过的分类数据(使用TanStack Query的staleTime=5分钟)
- **FR-023**: 系统必须懒加载商品图片(进入可视区域才加载)
- **FR-024**: 系统必须每1分钟后台自动轮询刷新商品数据(TanStack Query refetchInterval=60000ms)，确保用户看到相对新鲜的商品状态/价格/库存信息

### Key Entities

- **ChannelProductDTO(渠道商品DTO)**: 后端返回的商品数据对象，包含id(商品ID)、skuId(SKU ID)、channelCategory(分类枚举)、displayName(商品名称)、basePrice(基础价格,单位:分)、mainImage(主图URL)、detailImages(详情图数组)、description(商品描述)、status(状态枚举)、isRecommended(是否推荐)、sortOrder(排序值)、stockStatus(库存状态)
- **ChannelCategory(渠道分类枚举)**: 商品分类枚举值，包含ALCOHOL(酒)、COFFEE(咖啡)、BEVERAGE(饮料)、SNACK(小食)、MEAL(餐品)、OTHER(其他)
- **ProductCard(商品卡片)**: 前端组件数据模型，从ChannelProductDTO映射而来，包含用于UI渲染的字段(如格式化后的价格、图片URL、推荐标签等)
- **CategoryTab(分类标签)**: 前端组件数据模型，包含分类的枚举值、显示名称、是否选中状态

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 用户打开点餐页面后，商品列表首屏加载时间≤2秒(20个商品含图片)
- **SC-002**: 用户切换分类后，新分类商品列表加载时间≤1秒(使用缓存后≤500ms)
- **SC-003**: 商品卡片显示准确率100%(商品名称、价格、图片无错位或错误)
- **SC-004**: API集成成功率≥95%(排除网络异常等非代码问题)
- **SC-005**: 网络异常时，用户能在3秒内看到错误提示和重试按钮
- **SC-006**: 90%的用户能在首次使用时成功浏览商品并理解分类导航
- **SC-007**: 推荐商品角标显示准确率100%(所有`isRecommended: true`的商品均显示角标)
- **SC-008**: 系统能正确处理100个商品的列表渲染，无卡顿或白屏

---

## Dependencies

- **O006-miniapp-channel-order**: 依赖后端渠道商品配置功能和API端点的完整实现
- **O005-channel-product-config**: 依赖后端渠道商品配置的数据模型和业务逻辑
- **后端API**: 依赖 `GET /api/client/channel-products/mini-program` 接口可用且返回符合DTO定义的数据
- **认证服务**: 依赖 Taro 项目的认证模块提供有效的 JWT Token
- **Taro框架**: 依赖 Taro 4.1.9 的网络请求API(Taro.request)和图片组件(Taro.Image)
- **TanStack Query**: 依赖 TanStack Query 进行API数据管理和缓存
- **Zustand**: 依赖 Zustand 管理分类选择状态

---

## Assumptions

- 后端 `GET /api/client/channel-products/mini-program` API 已实现且稳定可用
- 后端返回的 `ChannelProductDTO` 数据格式与文档定义一致
- 小程序用户已通过静默登录或授权登录，所有API请求携带有效Token
- **商品图片URL为Supabase Storage的公开访问链接，无需额外认证** (已澄清: Phase 1使用公开URL简化实现，安全优化已记录为技术债)
- **商品数据通过后台轮询保持新鲜，每1分钟自动刷新** (已澄清: TanStack Query refetchInterval=60000ms，缓存staleTime=5分钟，平衡新鲜度与性能)
- Phase 1 不包含商品详情页，点击商品卡片仅传递ID参数，详情页在Phase 2实现
- Phase 1 不包含商品搜索、价格排序、库存筛选等高级功能
- 后端已对商品进行排序(推荐→排序→时间)，前端不需要重新排序
- 默认占位图存储在前端项目的 `src/assets/images/` 目录
- 用户主要使用微信小程序访问，H5环境为辅助支持

---

## Out of Scope

- 商品详情页实现(Phase 2)
- 商品规格选择功能(Phase 2)
- 加入购物车功能(Phase 2)
- 商品搜索功能(未来版本)
- 价格排序、筛选功能(未来版本)
- 库存数量显示(当前仅显示"有货/无货"状态)
- 商品收藏功能(未来版本)
- 商品评价与评分(未来版本)
- 多门店切换(当前仅支持单门店)
- 后端API的实现与优化(由O005/O006负责)

---

## 后端API现状分析

### 已实现的API端点

根据代码库分析，后端API已100%完成实现:

**商品列表API**:
- **端点**: `GET /api/client/channel-products/mini-program?category={ChannelCategory}`
- **Controller**: `ChannelProductClientController.getMiniProgramProducts()`
- **请求参数**: `category`(可选，ChannelCategory枚举)
- **响应格式**: `{ success: true, data: ChannelProductDTO[], total: number }`
- **后端特性**:
  - ✅ 自动过滤`status=ACTIVE`和`channelType=MINI_PROGRAM`的商品
  - ✅ 按推荐、排序、创建时间三级排序
  - ✅ 支持可选的category参数筛选
  - ❌ 不支持分页参数(返回所有匹配商品)

**商品详情API**(Phase 2使用):
- **端点**: `GET /api/client/channel-products/mini-program/{id}`
- **响应**: `ChannelProductDetailDTO`(包含完整商品信息和规格列表)

### DTO结构

```typescript
interface ChannelProductDTO {
  id: string                        // 商品ID(UUID)
  skuId: string                     // SKU ID
  channelCategory: ChannelCategory  // ALCOHOL|COFFEE|BEVERAGE|SNACK|MEAL|OTHER
  displayName: string               // 商品名称
  basePrice: number                 // 基础价格(分)
  mainImage: string                 // 主图URL
  detailImages: string[]            // 详情图数组
  description: string               // 商品描述
  status: ChannelProductStatus      // ACTIVE|INACTIVE|OUT_OF_STOCK
  isRecommended: boolean            // 是否推荐
  sortOrder: number                 // 排序值
  stockStatus: string               // "IN_STOCK"(当前硬编码)
}
```

### 分类枚举

```java
public enum ChannelCategory {
    ALCOHOL,    // 酒：鸡尾酒、威士忌、啤酒等
    COFFEE,     // 咖啡：拿铁、美式、卡布奇诺等
    BEVERAGE,   // 饮料：果汁、奶茶、汽水等
    SNACK,      // 小食：薯条、爆米花、坚果等
    MEAL,       // 餐品：汉堡、套餐、沙拉等
    OTHER       // 其他商品
}
```

### 字段匹配度分析

| 需求字段 | 后端字段 | 状态 | 备注 |
|---------|---------|------|------|
| 商品ID | `id` | ✅ 满足 | UUID格式 |
| 商品名称 | `displayName` | ✅ 满足 | - |
| 商品图片 | `mainImage` | ✅ 满足 | Supabase Storage URL |
| 商品标签 | `isRecommended` | ✅ 满足 | 可用作"推荐"标签 |
| 最小售卖单位 | ❌ 缺失 | ⚠️ 可忽略 | 可从SKU派生或硬编码"份" |
| 基础价格 | `basePrice` | ✅ 满足 | 需转换分→元 |
| 分类 | `channelCategory` | ✅ 满足 | 需映射枚举→中文名 |
| 上下架状态 | `status` | ✅ 满足 | 后端已自动过滤ACTIVE |
| 可售渠道 | 固定`MINI_PROGRAM` | ✅ 满足 | 后端已自动过滤 |

### 结论

✅ **后端API完全满足Phase 1需求**，前端仅需:
1. 建立分类枚举到中文名的映射
2. 价格格式化(分→元)
3. 处理图片加载失败场景
4. 实现加载状态和错误提示UI

---

## 实施阶段划分

### 阶段一：后端开发与验证

**目标**: 确保后端API完全满足前端需求，补充缺失功能，完成API测试。

**任务清单**:

1. **API验证与测试** (优先级: P0)
   - [ ] 验证 `GET /api/client/channel-products/mini-program` 端点可访问
   - [ ] 测试无category参数时返回所有商品
   - [ ] 测试每个category值(ALCOHOL/COFFEE/BEVERAGE/SNACK)的过滤结果
   - [ ] 验证返回数据格式符合 `ChannelProductDTO` 定义
   - [ ] 验证排序逻辑(推荐→sortOrder→创建时间)
   - [ ] 测试空数据场景(某分类无商品)
   - [ ] 测试认证Token验证(401场景)

2. **字段补充评估** (优先级: P1)
   - [ ] 评估是否需要在DTO中添加"最小售卖单位"字段
   - [ ] 如需添加，从SKU主数据中获取单位信息
   - [ ] 如不添加，前端硬编码为"份"或从SKU API单独获取

3. **性能测试** (优先级: P1)
   - [ ] 测试返回100个商品时的响应时间(目标<1秒)
   - [ ] 测试Supabase Storage图片URL的访问速度
   - [ ] 验证图片URL是否为公开访问(无需额外认证)

4. **API文档完善** (优先级: P2)
   - [ ] 在 `contracts/api.yaml` 中补充商品列表API文档
   - [ ] 添加请求示例、响应示例、错误码说明
   - [ ] 更新分类枚举的中文说明

**验收标准**:
- ✅ 所有API端点返回200状态码且数据格式正确
- ✅ 4个核心分类(ALCOHOL/COFFEE/BEVERAGE/SNACK)的商品数据至少各有3个测试商品
- ✅ 图片URL可通过浏览器直接访问(返回图片，非403/404)
- ✅ API响应时间P95 < 1秒

**产出物**:
- API测试报告(Postman/cURL测试结果截图)
- 性能测试数据(响应时间统计)
- 更新后的API文档(`contracts/api.yaml`)

---

### 阶段二：前端集成与UI实现

**目标**: 在 `miniapp-ordering-taro/` 项目中实现商品菜单和列表功能，集成后端API。

**任务清单**:

1. **项目初始化** (优先级: P0)
   - [ ] 检查 `miniapp-ordering-taro/` 项目结构
   - [ ] 确认Taro 4.1.9环境配置正确
   - [ ] 确认TanStack Query和Zustand依赖已安装
   - [ ] 配置API BaseURL和请求拦截器

2. **类型定义** (优先级: P0)
   - [ ] 创建 `src/types/channelProduct.ts`
   - [ ] 定义 `ChannelProductDTO` 接口(与后端DTO一致)
   - [ ] 定义 `ChannelCategory` 枚举
   - [ ] 定义 `ProductCard` 前端数据模型

3. **工具函数** (优先级: P0)
   - [ ] 创建 `src/utils/categoryMapping.ts` - 分类枚举到中文名映射
   - [ ] 创建 `src/utils/priceFormatter.ts` - 价格格式化(分→元)
   - [ ] 添加单元测试验证映射和格式化逻辑

4. **API服务层** (优先级: P1)
   - [ ] 创建 `src/services/channelProductService.ts`
   - [ ] 实现 `getProductList(category?: ChannelCategory)` 方法
   - [ ] 封装Taro.request，添加Token认证头
   - [ ] 实现错误处理和重试逻辑

5. **状态管理** (优先级: P1)
   - [ ] 创建 `src/stores/productMenuStore.ts` (Zustand)
   - [ ] 管理 `selectedCategory` 状态
   - [ ] 创建 `src/hooks/useProducts.ts` (TanStack Query)
   - [ ] 配置缓存策略(staleTime: 5分钟)

6. **分类菜单组件** (优先级: P1)
   - [ ] 创建 `src/components/CategoryTabs/index.tsx`
   - [ ] 实现5个标签(全部、经典特调、精品咖啡、经典饮品、主厨小食)
   - [ ] 实现选中状态高亮
   - [ ] 实现点击切换分类并调用API
   - [ ] 添加防抖处理(300ms)

7. **商品卡片组件** (优先级: P1)
   - [ ] 创建 `src/components/ProductCard/index.tsx`
   - [ ] 显示商品图片、名称、价格
   - [ ] 显示"推荐"角标(isRecommended=true时)
   - [ ] 实现图片懒加载
   - [ ] 实现图片加载失败时显示占位图
   - [ ] 实现商品名称超长截断(2行)

8. **商品列表组件** (优先级: P1)
   - [ ] 创建 `src/components/ProductList/index.tsx`
   - [ ] 实现网格布局(2列)
   - [ ] 集成加载状态(骨架屏)
   - [ ] 集成空状态("暂无商品")
   - [ ] 集成错误状态(错误提示+重试按钮)

9. **页面集成** (优先级: P1)
   - [ ] 修改 `src/pages/menu/index.tsx`
   - [ ] 集成CategoryTabs组件
   - [ ] 集成ProductList组件
   - [ ] 实现页面加载时默认加载全部商品

10. **样式实现** (优先级: P2)
    - [ ] 创建 `src/components/CategoryTabs/index.module.scss`
    - [ ] 创建 `src/components/ProductCard/index.module.scss`
    - [ ] 确保样式符合UI设计稿(使用rpx单位)

11. **错误处理** (优先级: P2)
    - [ ] 实现Token过期自动刷新
    - [ ] 实现网络超时提示(>10秒)
    - [ ] 实现500错误提示
    - [ ] 实现离线状态检测

12. **测试与优化** (优先级: P2)
    - [ ] 测试4个分类的切换流程
    - [ ] 测试图片加载失败场景
    - [ ] 测试网络异常场景
    - [ ] 性能优化(图片懒加载、防抖优化)

**验收标准**:
- ✅ 分类菜单显示正确的5个标签，点击后列表正确过滤
- ✅ 商品卡片显示图片、名称、价格，推荐商品有角标
- ✅ 首屏加载时间≤2秒(20个商品)
- ✅ 分类切换加载时间≤1秒(有缓存≤500ms)
- ✅ 网络异常时显示友好提示和重试按钮
- ✅ 图片加载失败时显示占位图
- ✅ 商品卡片显示准确率100%

**产出物**:
- 完整的前端代码(组件、服务、状态管理)
- 单元测试代码和测试报告
- 集成测试截图(不同分类、不同状态)
- 性能测试数据(加载时间统计)

---

## 阶段依赖关系

```
阶段一：后端开发与验证 (预计1-2天)
    ↓
  API验证通过
    ↓
阶段二：前端集成与UI实现 (预计3-5天)
    ↓
  联调测试
    ↓
  功能验收
```

**关键里程碑**:
1. **M1 - 后端API验证完成**: 所有API端点测试通过，有测试数据
2. **M2 - 前端基础组件完成**: CategoryTabs和ProductCard组件开发完成
3. **M3 - API集成完成**: 前端成功调用后端API并显示数据
4. **M4 - 功能验收通过**: 所有验收标准达成，可交付使用

---

**总结**: 本规格将实施分为**后端开发与验证**和**前端集成与UI实现**两个阶段。阶段一确保后端API完全就绪并有测试数据；阶段二专注于前端组件开发、API集成和UI实现。两阶段串行执行，确保前端开发时后端API稳定可用。

# Feature Specification: 场景包小程序首页活动 API 集成

**Feature Branch**: `018-hall-reserve-homepage`
**Created**: 2025-12-20
**Status**: Draft
**Input**: User description: "实现/Users/lining/qoder/Cinema_Bussiness_Center_Platform/hall-reserve-taro 首页的活动通过API实现"

## Clarifications

### Session 2025-12-21

- Q: 小程序首页 API 应该返回哪种数据模型？（选项 A：使用 ScenarioPackage 作为根实体 vs 选项 B：使用 Scenario 包含嵌套 ScenarioPackage[] vs 选项 C：扁平化结构） → A: 使用 ScenarioPackage 作为根实体（与 017 规格一致）
- Q: 小程序首页 API 应该返回哪些字段？（选项 A：仅列表摘要字段 vs 选项 B：完整数据 vs 选项 C：部分字段混合方案） → A: 仅返回列表摘要字段（id、title、category、backgroundImageUrl、起价、评分、标签），详细信息在详情页加载
- Q: API 应该如何处理场景包状态过滤？（选项 A：服务端过滤 vs 选项 B：客户端过滤 vs 选项 C：查询参数控制） → A: 服务端过滤 - API 仅返回 status = PUBLISHED 的场景包
- Q: 评分（rating）字段的数据来源是什么？（选项 A：运营配置固定评分 vs 选项 B：默认占位评分 vs 选项 C：暂不支持） → A: 使用运营人员手动配置的固定评分 - 在 017 场景包管理中新增评分配置字段
- Q: 小程序首页应该调用哪个 API 端点？（选项 A：GET /api/scenario-packages vs 选项 B：带版本号 vs 选项 C：按客户端分组） → A: GET /api/scenario-packages（符合 RESTful 规范）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 浏览场景包列表 (Priority: P1)

用户打开小程序首页时，系统从后端 API 获取并展示可预订的场景包列表（如企业年会、求婚策划、粉丝应援等），替换现有的硬编码 Mock 数据。用户可以看到每个场景包的图片、标题、分类标签、评分、地点和起价等信息。

**Why this priority**: 这是小程序的核心功能入口，用户需要看到真实的场景包数据才能进行后续预订操作。没有真实数据,小程序无法投入实际使用。

**Independent Test**: 可通过启动小程序首页，验证是否成功从 API 加载场景包列表并展示，且数据来自后端而非前端常量。可通过网络请求抓包工具（如微信开发者工具的 Network 面板）确认 API 调用成功。

**Acceptance Scenarios**:

1. **Given** 用户首次打开小程序首页, **When** 页面加载, **Then** 系统显示加载状态，调用后端 API 获取场景包列表，并在加载完成后展示所有可用场景包
2. **Given** 后端返回多个场景包数据, **When** 数据加载成功, **Then** 页面按照场景包的分类（私人订制、商务团建、派对策划）展示卡片，每个卡片包含图片、标题、标签、评分、地点、起价等信息
3. **Given** 用户已浏览首页一次（数据已缓存）, **When** 用户再次进入首页, **Then** 系统优先展示缓存数据（5分钟内），避免重复请求，提升加载速度
4. **Given** 用户点击某个场景包卡片, **When** 跳转到详情页, **Then** 将场景包 ID 传递给详情页，以便详情页通过 API 获取该场景包的详细信息

---

### User Story 2 - API 错误处理与降级 (Priority: P2)

当后端 API 服务不可用、网络异常或返回错误时，系统向用户展示友好的错误提示，并提供重试机制或降级方案（如展示缓存数据），确保用户体验不被完全中断。

**Why this priority**: 生产环境中网络故障和服务异常不可避免，良好的错误处理能提升用户满意度，避免用户因加载失败而直接离开小程序。

**Independent Test**: 可通过模拟网络故障（关闭后端服务或使用开发者工具断网功能）测试错误提示是否正常展示，以及重试功能是否可用。

**Acceptance Scenarios**:

1. **Given** 用户打开首页但网络不可用, **When** API 请求失败, **Then** 系统显示"网络连接失败，请检查网络设置"提示，并提供"重试"按钮
2. **Given** 后端 API 返回 500 错误, **When** 请求失败, **Then** 系统显示"服务暂时不可用，请稍后重试"提示，并记录错误日志用于后续排查
3. **Given** API 请求超时（超过 10 秒）, **When** 请求未在规定时间内返回, **Then** 系统自动终止请求并显示超时提示
4. **Given** 用户点击重试按钮, **When** 重新发起 API 请求, **Then** 系统清除错误状态并重新加载数据

---

### User Story 3 - API 数据缓存与更新策略 (Priority: P3)

系统实现智能缓存策略，在用户首次加载数据后，5 分钟内不重复请求后端 API，而是展示缓存数据。超过 5 分钟后，系统自动在后台刷新数据，保持场景包信息的时效性（如价格变动、库存状态更新）。

**Why this priority**: 缓存策略可减少不必要的网络请求，降低后端负载，提升小程序响应速度。同时确保数据在一定时间内保持新鲜度。

**Independent Test**: 可通过首次加载后等待 5 分钟，再次进入首页，观察网络请求是否发起以及数据是否更新。

**Acceptance Scenarios**:

1. **Given** 用户首次加载场景包列表, **When** 数据成功返回, **Then** 系统将数据缓存到本地，并记录缓存时间戳
2. **Given** 用户在 5 分钟内重新进入首页, **When** 检查缓存时间戳, **Then** 系统直接展示缓存数据，不发起新的 API 请求
3. **Given** 用户在 5 分钟后重新进入首页, **When** 缓存已过期, **Then** 系统在后台发起新的 API 请求，同时先展示旧缓存数据，待新数据返回后静默更新页面
4. **Given** 用户手动触发页面刷新（下拉刷新）, **When** 触发刷新操作, **Then** 系统强制清除缓存并重新请求最新数据

---

### Edge Cases

- 当后端返回空数组（无可用场景包）时，首页如何展示？
  - 展示空状态占位图和提示文案"暂无可用场景包，敬请期待"（可能原因：所有场景包都是草稿或已下架状态，服务端过滤后返回空数组）
- 当某个场景包的图片 URL 加载失败时如何处理？
  - 使用默认占位图片，避免显示破图
- 当用户设备时间与服务器时间不同步，导致缓存策略失效时如何处理？
  - 使用服务器返回的时间戳作为缓存基准，而非设备本地时间
- 当 API 返回的数据结构与前端类型定义不匹配时如何处理？
  - 使用 Zod 进行运行时数据验证，捕获格式错误并记录日志，展示错误提示
- 当用户在弱网环境下请求超时，但部分数据已返回时如何处理？
  - 如果响应体已部分返回但不完整，视为失败，提示用户重试
- 当场景包未配置评分（rating 字段为 null 或未设置）时如何展示？
  - 前端不显示评分区域，或显示"暂无评分"占位文案，避免显示空值或 0 分造成误解

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 提供 RESTful API 接口，返回场景包列表摘要数据，仅包含首页展示所需的字段：场景包 ID、标题、分类、背景图片 URL、起价（packagePrice）、评分（rating）、标签（tags），不包含完整的 pricing、rules、benefits、items、services 嵌套对象。API MUST 在服务端过滤，仅返回 status = PUBLISHED（已发布）的场景包，不返回草稿或已下架状态的数据
- **FR-002**: 前端小程序 MUST 在首页加载时调用场景包列表 API，并将返回的 JSON 数据解析为 TypeScript 类型定义的 `ScenarioPackageListItem[]` 数组（列表摘要数据）
- **FR-003**: 系统 MUST 在 API 请求期间展示加载状态（如"加载中..."提示），避免用户误以为页面无响应
- **FR-004**: 系统 MUST 支持 API 请求失败时的错误处理，向用户展示友好的错误提示信息，并提供重试机制
- **FR-005**: 系统 MUST 使用 TanStack Query 实现数据缓存策略，缓存时间为 5 分钟，避免频繁请求后端
- **FR-006**: 系统 MUST 使用 Zod 对 API 返回的数据进行运行时验证，确保数据结构符合前端类型定义，不符合则抛出错误并记录日志
- **FR-007**: 前端 MUST 将 API 请求逻辑封装在 `scenarioService.ts` 中，调用 `GET /api/scenario-packages` 端点，使用 `Taro.request` 进行网络请求，支持 H5 和微信小程序双端
- **FR-008**: API 响应格式 MUST 遵循统一的响应格式规范（如 `{ success: boolean, data: ScenarioPackageListItem[], message?: string }`），确保前后端契约一致
- **FR-009**: 系统 MUST 在请求超时（超过 10 秒）时自动终止请求并提示用户
- **FR-010**: 系统 MUST 支持用户手动触发页面刷新（下拉刷新），强制清除缓存并重新加载最新数据
- **FR-011**: 后端 API MUST 返回场景包的评分（rating）字段，该评分为运营人员在 017 场景包管理后台手动配置的固定评分值（0-5分），而非来自用户评价系统

### Key Entities *(include if feature involves data)*

- **ScenarioPackageListItem（场景包列表项）**: 小程序首页展示的场景包摘要数据，包含：
  - **id** (string): 场景包唯一标识符
  - **title** (string): 场景包标题
  - **category** (enum): 分类（MOVIE/TEAM/PARTY 或其他业务定义的分类）
  - **backgroundImageUrl** (string): 背景图片 URL
  - **packagePrice** (number): 打包一口价（起价）
  - **rating** (number, optional): 运营人员配置的固定评分（0-5分，由 017 场景包管理后台配置）
  - **tags** (string[]): 标签列表（如"生日派对"、"企业年会"等）
- **API Response（API 响应）**: 后端返回的标准化响应结构，包含成功标识（success）、数据体（data: ScenarioPackageListItem[]）、错误信息（message）、时间戳（timestamp）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户打开小程序首页后，场景包列表在正常网络环境下 2 秒内完成加载并展示（从发起请求到数据渲染完成）
- **SC-002**: 系统在 5 分钟缓存有效期内，用户重新进入首页时无需发起新的 API 请求，页面加载时间缩短至 500 毫秒以内
- **SC-003**: 在网络故障或 API 错误情况下，95% 的用户能够看到明确的错误提示信息，并成功使用重试功能恢复正常
- **SC-004**: API 返回数据格式与前端类型定义完全一致，通过 Zod 验证的数据格式错误率为 0（生产环境上线前）
- **SC-005**: 系统在弱网环境（3G 网络）下仍能在 5 秒内完成首次数据加载或展示超时提示
- **SC-006**: 场景包数据更新后（如价格调整、新增场景包），用户在 5 分钟内能够看到更新后的数据（缓存过期后自动刷新）
- **SC-007**: 用户使用下拉刷新功能后，页面能在 2 秒内展示最新数据，无需重启小程序

## Assumptions

1. **后端 API 已存在或将同步开发**: 后端提供符合 RESTful 规范的场景包列表接口 `GET /api/scenario-packages`，返回 JSON 格式数据
2. **数据格式为列表摘要**: API 返回的是场景包列表摘要数据（ScenarioPackageListItem），仅包含首页展示所需字段，不包含完整的 017 后端数据模型中的所有嵌套对象（pricing、rules、benefits、items、services 等详细信息在详情页 API 中获取）
3. **使用 Supabase 作为后端数据源**: 基于项目宪法要求，假设后端使用 Spring Boot + Supabase 架构，场景包数据存储在 Supabase PostgreSQL 数据库中。后端通过 SQL 查询条件 `WHERE status = 'PUBLISHED'` 在服务端过滤场景包状态
4. **网络环境**: 假设目标用户群体网络环境以 4G/5G 和 WiFi 为主，但需兼容 3G 弱网场景
5. **缓存策略**: 假设 5 分钟的缓存时效性对场景包数据（价格、库存等）足够合理，不会导致严重的数据滞后问题
6. **错误处理**: 假设常见错误类型包括网络超时、服务器 5xx 错误、数据格式错误，其他异常情况（如权限错误）可在后续迭代中补充
7. **评分字段来源**: 评分（rating）字段由运营人员在 017 场景包管理后台手动配置，作为场景包的固定属性存储。这与真实用户评价系统无关（017 将评价系统列为超出范围），仅用于运营展示推荐度

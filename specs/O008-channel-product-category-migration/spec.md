# Feature Specification: B端商品配置 - 动态菜单分类集成

**Feature Branch**: `O008-channel-product-category-migration`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "基于【O002】B端商品配置页面 - 渠道分类改为菜单分类待办项，将 B端 商品配置页面从硬编码的 ChannelCategory 枚举改为使用动态 MenuCategory 数据"

## Clarifications

### Session 2026-01-04
- Q: US3 (兼容旧数据显示和编辑) 和 US4 (分类数量统计) 是否需要实现？ → A: 不需要。系统处于开发阶段，旧数据和不用的表可以直接删除，只需保证系统可用
- Q: 现有的 ChannelProductConfig 数据表结构如何处理？ → A: 直接删除 `channel_category` 字段，仅保留 `category_id` 字段
- Q: 后端商品配置 API 端点的修改范围？ → A: 仅修改商品 CRUD API，复用现有的 `/api/admin/menu-categories` 获取分类列表

### Follow-up Actions (待办项)
- **TODO**: 清理旧的 `channel_category` 枚举定义和相关代码
- **TODO**: 删除或重构不再使用的数据库表结构
- **TODO**: 移除与旧数据兼容相关的逻辑代码

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 管理员使用动态分类创建商品 (Priority: P1)

**场景**: 作为商品管理员，我希望在创建新商品时能够从当前可用的菜单分类中选择，而不是受限于固定的分类列表，这样可以适应不断变化的业务需求。

**Why this priority**: 这是核心功能，直接影响商品创建流程。没有此功能，管理员无法利用新的动态菜单分类系统。

**Independent Test**: 可以通过创建一个新商品并选择任意可见的菜单分类来独立测试，验证商品是否成功关联到选定的分类。

**Acceptance Scenarios**:

1. **Given** 管理员在商品配置页面点击"新建商品"，**When** 打开分类选择下拉框，**Then** 显示所有 `is_visible=true` 的菜单分类（而不是硬编码的枚举值）
2. **Given** 管理员选择了"精品咖啡"分类并填写商品信息，**When** 提交表单，**Then** 商品创建成功，且 `category_id` 字段保存为所选分类的 UUID
3. **Given** 某个分类被管理员设置为隐藏（`is_visible=false`），**When** 管理员打开商品创建表单，**Then** 该分类不在选项列表中显示

---

### User Story 2 - 管理员编辑商品分类 (Priority: P1)

**场景**: 作为商品管理员，我希望能够修改已存在商品的分类归属，以便根据业务调整进行商品重新分类。

**Why this priority**: 与创建功能同等重要，确保商品分类的灵活性和可维护性。

**Independent Test**: 可以通过编辑现有商品并更改其分类来独立测试，验证更改是否持久化并正确显示。

**Acceptance Scenarios**:

1. **Given** 管理员打开已存在商品的编辑表单，**When** 查看分类字段，**Then** 当前分类被正确选中（显示为 `displayName`）
2. **Given** 管理员将商品从"经典特调"改为"精品咖啡"分类，**When** 保存更改，**Then** 商品的 `category_id` 更新为新分类的 UUID
3. **Given** 商品当前关联的分类被隐藏（`is_visible=false`），**When** 管理员编辑该商品，**Then** 分类下拉框中仍然显示该隐藏分类（避免丢失关联），但标记为"（已隐藏）"

---

### Edge Cases

- **分类被删除后商品关联**：如果某个分类被删除，关联的商品自动迁移到默认分类（"其他商品"）
- **并发编辑冲突**：两个管理员同时编辑同一商品的分类，后保存的编辑覆盖前一个（使用乐观锁版本控制）
- **API 超时或失败**：获取菜单分类列表时 API 失败，显示友好错误提示"无法加载分类列表，请刷新重试"
- **无可见分类**：如果所有分类都被隐藏（`is_visible=false`），仅显示默认分类供选择
- **分类名称过长**：分类 `displayName` 超过 50 字符时，下拉框中自动截断并显示省略号

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须从 `GET /api/admin/menu-categories` 获取菜单分类列表，而不是使用硬编码的枚举值
- **FR-002**: 商品创建表单的分类选择字段必须仅显示 `is_visible=true` 的菜单分类
- **FR-003**: 商品编辑表单的分类选择字段必须显示当前商品关联的分类（即使该分类 `is_visible=false`），并标记为"（已隐藏）"
- **FR-004**: 商品创建时，系统必须提交 `categoryId`（UUID 格式）字段
- **FR-005**: 商品编辑时，系统必须读取和更新 `category_id` 字段
- **FR-006**: 商品列表页面必须显示每个商品的分类名称（`displayName`），通过关联 `category_id` 查询获取
- **FR-007**: 系统必须在分类列表加载失败时显示用户友好的错误提示，并提供重试机制
- **FR-008**: 系统必须验证提交的 `categoryId` 是否存在于 `menu_category` 表中，避免无效关联
- **FR-009**: 分类选择下拉框必须按照 `sort_order` 字段升序排列分类选项
- **FR-010**: 系统必须缓存菜单分类列表数据（有效期 5 分钟），减少重复 API 调用

### Key Entities

- **ChannelProductConfig（渠道商品配置）**:
  - 代表在特定销售渠道（小程序）中配置的商品信息
  - 字段：`category_id`（UUID，外键关联 `menu_category.id`）
  - 关系：一个商品配置关联一个菜单分类（Many-to-One）

- **MenuCategory（菜单分类）**:
  - 代表动态可管理的商品分类
  - 关键属性：`id`（UUID）、`code`（唯一编码）、`displayName`（显示名称）、`isVisible`（是否可见）、`sortOrder`（排序序号）
  - 关系：一个分类可以关联多个商品配置（One-to-Many）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 管理员可以在商品创建表单中从动态菜单分类列表中选择分类，选项数量与 `menu_category` 表中 `is_visible=true` 的记录数一致
- **SC-002**: 商品创建和编辑操作的成功率达到 99.9%
- **SC-003**: 商品列表页面加载时间不超过 2 秒（包含分类名称显示），即使存在 1000+ 商品记录
- **SC-004**: 分类列表 API 调用次数减少 80%（通过前端缓存），降低服务器负载
- **SC-005**: 管理员在选择分类时能够在 1 秒内看到下拉框选项，无明显延迟
- **SC-006**: 系统能够处理分类被删除后的商品自动迁移，商品不会出现"无分类"状态
- **SC-007**: 前端表单验证能够在提交前拦截 95% 以上的无效分类选择（如已隐藏或已删除的分类）

## Non-Functional Requirements

### Performance
- 分类列表 API 响应时间 < 500ms（P95）
- 前端分类下拉框渲染时间 < 100ms（支持 100+ 分类）
- 商品列表页面批量查询分类名称时，数据库查询时间 < 1 秒（1000 商品）

### Usability
- 分类选择下拉框支持搜索/过滤功能（输入关键词快速定位）
- 商品编辑表单自动回填当前分类（无需管理员重新选择）
- 错误提示清晰明确（如"分类已删除，请选择其他分类"）

### Compatibility
- 商品数据使用 `category_id` 字段关联分类

## Assumptions

- 假设 `menu_category` 表已由 **O002-miniapp-menu-config** 功能完全实现并投入使用
- 假设后端 API `GET /api/admin/menu-categories` 和 `GET /api/client/menu-categories` 已经可用且稳定
- 假设商品配置页面使用 React + Ant Design 技术栈
- 假设前端状态管理使用 TanStack Query，已支持 API 数据缓存
- 假设默认分类（`is_default=true`）始终存在且不可删除

## Dependencies

- **O002-miniapp-menu-config**: 必须先完成菜单分类管理功能（创建、编辑、删除、排序、可见性控制）
- **前端组件库**: 依赖 Ant Design 的 `Select` 组件和 TanStack Query 的数据获取 Hook

## Out of Scope

- **C端小程序商品显示**：小程序端已通过 `GET /api/client/menu-categories` 支持动态分类，本功能仅聚焦 B端管理后台
- **分类多选**：当前设计每个商品只能属于一个分类，不支持多分类标签
- **分类层级结构**：不支持父子分类或多级分类树，仅支持平铺的一级分类
- **分类权限控制**：不涉及不同管理员角色对分类的访问权限限制
- **批量修改商品分类**：不支持一次性修改多个商品的分类（未来可作为独立功能）

## Risks & Mitigation

### Risk 1: API 缓存过期导致分类列表不同步
**Mitigation**:
- 前端缓存时间设置为 5 分钟，平衡性能和数据新鲜度
- 提供手动刷新按钮，允许管理员强制更新分类列表
- 当分类修改操作完成时，自动触发缓存失效（使用 TanStack Query 的 `invalidateQueries`）

### Risk 2: 分类被删除后商品无法显示
**Mitigation**:
- 后端 API 在删除分类前自动将关联商品迁移到默认分类
- 前端在商品列表中增加容错逻辑，如果 `category_id` 无效，显示"未知分类"并标记为异常
- 提供数据修复工具，定期检查并修复孤立的商品记录

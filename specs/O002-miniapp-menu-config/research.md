# Research: 小程序菜单分类动态配置

**@spec O002-miniapp-menu-config**
**Date**: 2026-01-03

## Overview

本文档记录 O002 功能开发过程中的技术研究和决策。

---

## 1. 分类系统设计方案选择

### Decision
采用**方案二：完全动态分类整合** - 将 `ChannelCategory` 枚举迁移到 `menu_category` 数据库表

### Rationale
1. **统一数据源**: 数据库表成为分类的唯一事实来源，消除前后端硬编码分歧
2. **运营灵活性**: 管理员可随时增删改分类，无需代码部署
3. **可扩展性**: 支持未来添加更多分类属性（图标、描述、多语言等）
4. **向后兼容**: 保留旧 API 参数支持，平滑迁移

### Alternatives Considered
1. **方案一：保持枚举 + 独立菜单配置表**
   - 优点：改动小，风险低
   - 缺点：数据冗余，需要同步维护枚举和表
   - **拒绝原因**：长期维护成本高，容易产生数据不一致

2. **方案三：完全前端驱动**
   - 优点：后端改动最小
   - 缺点：分类管理无法动态化，仍需代码部署
   - **拒绝原因**：不满足"可配置"的核心需求

---

## 2. 数据库表设计

### Decision
创建 `menu_category` 表，包含以下核心字段：
- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE) - 分类编码，兼容旧枚举
- `display_name` (VARCHAR) - 中文显示名
- `sort_order` (INTEGER) - 排序序号
- `is_visible` (BOOLEAN) - 是否可见
- `is_default` (BOOLEAN) - 是否为默认分类
- `icon_url` (TEXT, nullable)
- `description` (TEXT, nullable)
- 审计字段 (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`)

### Rationale
1. **`code` 字段保留枚举语义**: 允许旧 API (`?category=COFFEE`) 继续工作
2. **软删除设计**: 使用 `deleted_at` 而非物理删除，保留审计轨迹
3. **唯一默认分类约束**: 通过 partial unique index 确保只有一个 `is_default=true`

### Alternatives Considered
1. **无 `code` 字段，仅用 `id`**
   - 拒绝原因：破坏向后兼容性，旧客户端无法工作

2. **物理删除**
   - 拒绝原因：无法审计，无法支持误删恢复

---

## 3. 商品关联字段迁移策略

### Decision
修改 `channel_product_config` 表：
- 新增 `category_id` (UUID, FK → menu_category.id)
- 保留 `channel_category` 枚举字段（过渡期）
- 迁移完成后设置 `category_id NOT NULL`

### Rationale
1. **渐进式迁移**: 新老字段并存，降低部署风险
2. **回滚能力**: 保留旧字段允许快速回滚
3. **数据完整性**: 迁移后强制外键约束

### Migration Steps
1. 添加 `category_id` 列（nullable）
2. 创建 `menu_category` 表并插入初始数据
3. 更新所有 `channel_product_config` 记录的 `category_id`
4. 验证迁移完整性
5. 设置 `category_id NOT NULL`
6. (可选) 删除 `channel_category` 列（建议保留 6 个月）

---

## 4. API 向后兼容策略

### Decision
商品列表 API 同时支持两种参数：
- `categoryId` (UUID) - 新方式，优先
- `category` (String) - 旧方式，兼容枚举编码

### Rationale
1. **零中断部署**: 现有小程序无需立即更新
2. **渐进式迁移**: 新客户端使用 `categoryId`，旧客户端继续使用 `category`
3. **明确优先级**: 同时传递时 `categoryId` 优先，避免歧义

### Implementation
```java
// 伪代码
if (categoryId != null) {
    products = findByCategoryId(categoryId);
} else if (category != null) {
    MenuCategory cat = findByCode(category);
    products = findByCategoryId(cat.getId());
} else {
    products = findAll();
}
```

---

## 5. 分类删除策略

### Decision
删除分类时，自动将关联商品迁移到默认分类（"其他商品"）

### Rationale
1. **数据完整性**: 避免产生孤儿商品记录
2. **用户体验**: 商品不会从小程序消失，只是换了分类
3. **操作透明**: 删除确认对话框显示受影响商品数量

### Edge Cases Handled
- 默认分类不可删除
- 删除空分类直接删除，无迁移
- 大批量商品迁移需要性能优化（批量更新）

---

## 6. 缓存策略

### Decision
C端 API 使用 TanStack Query 缓存：
- `staleTime`: 5 分钟
- `refetchInterval`: 1 分钟（后台轮询）
- 页面刷新或重新进入时强制刷新

### Rationale
1. **性能优化**: 减少 API 调用，提升加载速度
2. **数据新鲜度**: 1 分钟轮询确保分类变更在合理时间内可见
3. **用户体验**: 避免每次切换分类都请求 API

---

## 7. 审计日志设计

### Decision
创建 `category_audit_log` 表记录所有分类配置变更

### Fields
- `category_id` - 被操作的分类
- `action` - 操作类型 (CREATE, UPDATE, DELETE, REORDER)
- `before_data`, `after_data` - JSON 快照
- `affected_product_count` - 受影响商品数
- `operator_id`, `operator_name` - 操作人
- `created_at` - 操作时间

### Rationale
1. **可追溯性**: 了解谁在何时做了什么变更
2. **问题排查**: 出现问题时可追溯历史
3. **合规要求**: 满足运营审计需求

---

## 8. 技术栈确认

### Backend
- **Framework**: Spring Boot 3.x + Java 17
- **Database**: Supabase (PostgreSQL)
- **ORM**: Spring Data JPA with Hibernate
- **API Style**: RESTful

### Frontend (B端)
- **Framework**: React 19 + TypeScript
- **UI Library**: Ant Design 6
- **State Management**: Zustand + TanStack Query
- **Form**: React Hook Form + Zod

### Frontend (C端)
- **Framework**: Taro 4.x + React
- **State Management**: Zustand + TanStack Query
- **Storage**: Taro.setStorageSync

---

## References

- [O007 Spec](../O007-miniapp-menu-api/spec.md) - 现有分类实现
- [O005 Spec](../O005-channel-product-config/spec.md) - 商品配置表结构
- [Constitution](../../.specify/memory/constitution.md) - 项目宪法

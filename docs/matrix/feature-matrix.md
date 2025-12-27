# 产品功能矩阵 (Feature Matrix)

**生成日期**: 2025-12-26
**总功能数**: 37
**文档版本**: 1.0

---

## 统计概览

| 系统 | 模块数 | 功能数 |
|------|--------|--------|
| 商品管理中台 | 4 | 37 |

### 按模块统计

| 模块 | 功能数 | 占比 |
|------|--------|------|
| 通用功能 | 28 | 75.7% |
| 库存管理 | 4 | 10.8% |
| 用户/预订管理 | 3 | 8.1% |
| 工具/基础设施 | 2 | 5.4% |

### 完整度统计

| 工件类型 | 数量 | 占比 |
|----------|------|------|
| 有 plan.md | 5 | 13.5% |
| 有 data-model.md | 5 | 13.5% |
| 有 API 契约 | 3 | 8.1% |

---

## 功能清单

### 库存管理 (4 个功能)

| 功能编码 | 功能名称 | 简述 | 工件 | 路径 |
|---------|---------|------|------|------|
| P001-sku-master-data | SKU主数据管理 | - | Plan | [specs/P001-sku-master-data](../../specs/P001-sku-master-data) |
| P002-unit-conversion | 单位换算配置 | - | - | [specs/P002-unit-conversion](../../specs/P002-unit-conversion) |
| P003-inventory-query | 门店SKU库存查询 | - | - | [specs/P003-inventory-query](../../specs/P003-inventory-query) |
| P004-inventory-adjustment | 库存调整管理 | - | - | [specs/P004-inventory-adjustment](../../specs/P004-inventory-adjustment) |

### 用户/预订管理 (3 个功能)

| 功能编码 | 功能名称 | 简述 | 工件 | 路径 |
|---------|---------|------|------|------|
| U001-reservation-order-management | 预订订单管理 | - | - | [specs/U001-reservation-order-management](../../specs/U001-reservation-order-management) |
| U002-reservation-card-ui-compact | 预订卡片 UI 紧凑化 | - | - | [specs/U002-reservation-card-ui-compact](../../specs/U002-reservation-card-ui-compact) |
| U003-wechat-miniapp-login | 微信小程序登录 | - | - | [specs/U003-wechat-miniapp-login](../../specs/U003-wechat-miniapp-login) |

### 工具/基础设施 (2 个功能)

| 功能编码 | 功能名称 | 简述 | 工件 | 路径 |
|---------|---------|------|------|------|
| T001-doc-writer-enhance | Doc-Writer 功能增强 | - | - | [specs/T001-doc-writer-enhance](../../specs/T001-doc-writer-enhance) |
| T001-ops-expert-skill | Ops Expert 技能 | - | - | [specs/T001-ops-expert-skill](../../specs/T001-ops-expert-skill) |

### 通用功能 (28 个功能)

| 功能编码 | 功能名称 | 简述 | 工件 | 路径 |
|---------|---------|------|------|------|
| 001-claude-cleanup-script | Claude 清理脚本 | - | Plan, Data | [specs/001-claude-cleanup-script](../../specs/001-claude-cleanup-script) |
| [###-feature-name] | E2E 测试文档 | - | - | [specs/001-e2e-testing-docs](../../specs/001-e2e-testing-docs) |
| 001-menu-navigation | 功能导航系统 | - | Plan, Data, API | [specs/001-menu-navigation](../../specs/001-menu-navigation) |
| 001-scenario-package-tabs | 场景包标签页 | - | Plan, Data, API | [specs/001-scenario-package-tabs](../../specs/001-scenario-package-tabs) |
| 001-skill-doc-generator | Skill 文档生成器 | - | - | [specs/001-skill-doc-generator](../../specs/001-skill-doc-generator) |
| 001-ui-framework-upgrade | UI 框架升级 | - | Plan, Data | [specs/001-ui-framework-upgrade](../../specs/001-ui-framework-upgrade) |
| 002-upgrade-ant6 | Ant Design 6 升级 | - | - | [specs/002-upgrade-ant6](../../specs/002-upgrade-ant6) |
| 003-inventory-management | 库存管理 | - | - | [specs/003-inventory-management](../../specs/003-inventory-management) |
| 004-spu-management | SPU 管理 | - | - | [specs/004-spu-management](../../specs/004-spu-management) |
| 005-sku-management | SKU 管理 | - | - | [specs/005-sku-management](../../specs/005-sku-management) |
| 006-frontend-structure-refactor | 前端结构重构 | - | - | [specs/006-frontend-structure-refactor](../../specs/006-frontend-structure-refactor) |
| 007-category-management-by-claude | 类目管理 | - | Plan, API | [specs/007-category-management-by-claude](../../specs/007-category-management-by-claude) |
| 008-env-preset-commands | 环境预设命令 | - | - | [specs/008-env-preset-commands](../../specs/008-env-preset-commands) |
| 009-brand-management | 品牌管理 | - | - | [specs/009-brand-management](../../specs/009-brand-management) |
| 010-attribute-dict-management | 属性字典管理 | - | - | [specs/010-attribute-dict-management](../../specs/010-attribute-dict-management) |
| 011-uninstall-env-cleanup | 卸载环境清理 | - | - | [specs/011-uninstall-env-cleanup](../../specs/011-uninstall-env-cleanup) |
| 012-set-config-enhancement | 配置设置增强 | - | - | [specs/012-set-config-enhancement](../../specs/012-set-config-enhancement) |
| 013-schedule-management | 排期管理 | - | - | [specs/013-schedule-management](../../specs/013-schedule-management) |
| 014-hall-store-backend | 影厅门店后端 | - | - | [specs/014-hall-store-backend](../../specs/014-hall-store-backend) |
| 015-store-reservation-settings | 门店预订设置 | - | - | [specs/015-store-reservation-settings](../../specs/015-store-reservation-settings) |
| 016-store-reservation-settings | 门店预订设置 | - | - | [specs/016-store-reservation-settings](../../specs/016-store-reservation-settings) |
| 017-scenario-package | 场景包 | - | - | [specs/017-scenario-package](../../specs/017-scenario-package) |
| 018-hall-reserve-homepage | 影厅预订首页 | - | - | [specs/018-hall-reserve-homepage](../../specs/018-hall-reserve-homepage) |
| 019-store-association | 门店关联 | - | - | [specs/019-store-association](../../specs/019-store-association) |
| 020-store-address | 门店地址 | - | - | [specs/020-store-address](../../specs/020-store-address) |
| 021-activity-type | 活动类型 | - | - | [specs/021-activity-type](../../specs/021-activity-type) |
| 022-store-crud | 门店 CRUD | - | - | [specs/022-store-crud](../../specs/022-store-crud) |
| F001-miniapp-tab-bar | 小程序 TabBar | - | - | [specs/F001-miniapp-tab-bar](../../specs/F001-miniapp-tab-bar) |
| claude-1-purchase-management | 采购管理 | - | - | [specs/claude-1-purchase-management](../../specs/claude-1-purchase-management) |

---

## 版本路线图

### 已完成功能
- *(待更新)*

### 开发中功能
- P003-inventory-query - 门店SKU库存查询
- P004-inventory-adjustment - 库存调整管理

### 计划功能
- *(待更新)*

---

## 文档索引

### 设计文档
| 功能编码 | TDD | 架构设计 | API 设计 | 数据库设计 |
|---------|-----|---------|---------|-----------|
| P003 | [TDD](../tdd/P003-inventory-query.md) | - | - | - |
| P004 | [TDD](../tdd/P004-inventory-adjustment.md) | - | - | - |

### 用户文档
| 功能编码 | 用户手册 | README |
|---------|---------|--------|
| *(待生成)* | - | - |

---

## 使用说明

### 图例
- **Plan**: 有技术方案文档 (plan.md)
- **Data**: 有数据模型文档 (data-model.md)
- **API**: 有 API 契约 (contracts/api.yaml)

### 更新说明
本矩阵由 doc-writer 自动生成。要更新矩阵，请运行：
```bash
/doc matrix
```

---

*本文档由 [doc-writer](../../.claude/skills/doc-writer) 自动生成 | 最后更新: 2025-12-26*

# Tasks: 渠道商品配置

**@spec O005-channel-product-config**

**Date**: 2026-01-01

## Task Overview

本任务清单分为两大部分：
1. **新功能开发**: 渠道商品配置功能
2. **历史代码清理**: 清理 beverage 相关历史代码

---

## Phase 1: 数据库与后端 (Priority: P1)

### T001: 创建数据库表和迁移脚本
- [ ] 创建 `channel_product_config` 表迁移脚本
- [ ] 添加索引和约束
- [ ] 编写种子数据脚本（可选）
- **文件**: `backend/src/main/resources/db/migration/V2026_01_01_001__create_channel_product_config.sql`
- **依赖**: 无
- **估计**: 0.5 天

### T002: 创建后端实体和 Repository
- [ ] 创建 `ChannelProductConfig` 实体类
- [ ] 创建 `ChannelProductConfigRepository` 接口
- [ ] 添加 JPA 注解和验证
- **文件**: `backend/src/main/java/com/cinema/channel/`
- **依赖**: T001
- **估计**: 0.5 天

### T003: 创建后端 Service 层
- [ ] 创建 `ChannelProductConfigService` 接口和实现
- [ ] 实现 CRUD 操作
- [ ] 实现 SKU 关联校验（必须是 finished_product 类型）
- [ ] 实现规格价格计算逻辑
- **文件**: `backend/src/main/java/com/cinema/channel/service/`
- **依赖**: T002
- **估计**: 1 天

### T004: 创建后端 Controller 层
- [ ] 创建 `ChannelProductConfigController`
- [ ] 实现 RESTful API 端点
- [ ] 添加请求验证和错误处理
- [ ] 编写 API 文档注释
- **文件**: `backend/src/main/java/com/cinema/channel/controller/`
- **依赖**: T003
- **估计**: 0.5 天

### T005: 后端单元测试
- [ ] 编写 Service 层单元测试
- [ ] 编写 Controller 层集成测试
- [ ] 确保测试覆盖率 ≥ 80%
- **文件**: `backend/src/test/java/com/cinema/channel/`
- **依赖**: T004
- **估计**: 1 天

---

## Phase 2: 前端开发 (Priority: P1)

### T006: 创建前端模块结构
- [ ] 创建 `frontend/src/features/channel-product-config/` 目录
- [ ] 创建类型定义 `types/`
- [ ] 创建 API 服务 `services/`
- [ ] 创建组件目录 `components/`
- [ ] 创建页面目录 `pages/`
- **依赖**: T004
- **估计**: 0.5 天

### T007: 实现 SKU 选择器组件
- [ ] 创建 `SkuSelector` 组件
- [ ] 仅显示 `finished_product` 类型的 SKU
- [ ] 支持搜索和分页
- [ ] 显示 SKU 图片、名称、编码、价格
- **文件**: `frontend/src/features/channel-product-config/components/SkuSelector.tsx`
- **依赖**: T006
- **估计**: 1 天

### T008: 实现渠道商品表单组件
- [ ] 创建 `ChannelProductForm` 组件
- [ ] 包含字段：展示名称、渠道分类、渠道价格、图片上传、描述、推荐标签、状态
- [ ] 集成 SKU 选择器
- [ ] 表单验证
- **文件**: `frontend/src/features/channel-product-config/components/ChannelProductForm.tsx`
- **依赖**: T007
- **估计**: 1 天

### T009: 实现规格配置组件
- [ ] 创建 `SpecConfigPanel` 组件
- [ ] 支持添加多种规格类型
- [ ] 支持为每个规格添加选项
- [ ] 支持设置价格调整、默认选项
- [ ] 支持规格排序
- **文件**: `frontend/src/features/channel-product-config/components/SpecConfigPanel.tsx`
- **依赖**: T006
- **估计**: 1.5 天

### T010: 实现渠道商品列表页
- [ ] 创建 `ChannelProductListPage` 页面
- [ ] 实现商品列表展示
- [ ] 实现分类、状态筛选
- [ ] 实现搜索功能
- [ ] 实现新增、编辑、删除、上下架操作
- **文件**: `frontend/src/features/channel-product-config/pages/ChannelProductListPage.tsx`
- **依赖**: T008, T009
- **估计**: 1.5 天

### T011: 更新路由配置
- [ ] 添加 `/channel-products/mini-program` 路由
- [ ] 添加 `/channel-products/mini-program/create` 路由
- [ ] 添加 `/channel-products/mini-program/:id/edit` 路由
- [ ] 配置路由守卫（如有需要）
- **文件**: `frontend/src/router/index.tsx`
- **依赖**: T010
- **估计**: 0.5 天

### T012: 更新菜单配置
- [ ] 添加"渠道商品配置"菜单项
- [ ] 添加"小程序商品"子菜单
- [ ] 设置菜单图标
- [ ] 移除旧"饮品管理"菜单项（Phase 3）
- **文件**: `frontend/src/components/layout/AppLayout.tsx`
- **依赖**: T011
- **估计**: 0.5 天

### T013: 前端单元测试
- [ ] 编写组件单元测试
- [ ] 编写 Hook 测试
- [ ] 确保测试覆盖率 ≥ 70%
- **文件**: `frontend/src/features/channel-product-config/__tests__/`
- **依赖**: T010
- **估计**: 1 天

---

## Phase 3: 小程序端适配 (Priority: P1)

### T014: 更新小程序商品数据源
- [ ] 修改商品查询 API 调用，从 `channel_product_config` 获取数据
- [ ] 适配新的数据结构
- [ ] 处理展示名称、渠道价格逻辑（空值回退到 SKU 数据）
- **文件**: `hall-reserve-taro/src/services/productService.ts`
- **依赖**: T004
- **估计**: 0.5 天

### T015: 更新小程序规格选择器
- [ ] 适配新的规格数据结构（specs JSONB）
- [ ] 支持必选/可选规格
- [ ] 支持单选/多选规格
- [ ] 正确计算规格价格调整
- **文件**: `hall-reserve-taro/src/components/SpecSelector.tsx`
- **依赖**: T014
- **估计**: 1 天

### T016: 更新小程序商品列表和详情页
- [ ] 适配新的分类系统（ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER）
- [ ] 更新商品卡片显示
- [ ] 更新商品详情页
- **文件**: `hall-reserve-taro/src/pages/products/`
- **依赖**: T015
- **估计**: 1 天

### T017: 小程序端测试
- [ ] 测试商品列表展示
- [ ] 测试规格选择和价格计算
- [ ] 测试下单流程
- **依赖**: T016
- **估计**: 0.5 天

---

## Phase 4: 历史代码清理 (Priority: P2)

> **重要**: 此阶段必须在 Phase 1-3 完成并验证后执行

### T018: 删除前端 beverage-config 模块
- [ ] 删除 `frontend/src/features/beverage-config/` 目录
- [ ] 删除相关导入和引用
- [ ] 更新 TypeScript 配置（如有路径别名）
- **依赖**: T010 验证通过
- **估计**: 0.5 天

### T019: 清理 beverage-order-management 冗余代码
- [ ] 审查 `frontend/src/features/beverage-order-management/` 目录
- [ ] 保留订单管理相关组件（OrderListPage, PendingOrdersPage, SalesStatisticsPage）
- [ ] 删除与饮品配置相关的冗余组件
- [ ] 更新组件引用
- **依赖**: T018
- **估计**: 0.5 天

### T020: 清理路由配置
- [ ] 删除 `/beverage/list` 路由
- [ ] 删除 `/beverage/*` 相关路由
- [ ] 添加 `/beverage/*` → `/channel-products/mini-program` 重定向（可选）
- **文件**: `frontend/src/router/index.tsx`
- **依赖**: T019
- **估计**: 0.5 天

### T021: 清理菜单配置
- [ ] 删除"饮品管理"菜单项
- [ ] 更新菜单结构
- **文件**: `frontend/src/components/layout/AppLayout.tsx`
- **依赖**: T020
- **估计**: 0.5 天

### T022: 清理数据库迁移脚本
- [ ] 创建清理脚本，删除以下表：
  - `beverages`
  - `beverage_specs`
  - `beverage_recipes`
  - `beverage_sku_mapping`（O004 遗留）
- [ ] 清理相关数据
- **文件**: `backend/src/main/resources/db/migration/V2026_01_01_002__cleanup_beverage_tables.sql`
- **依赖**: Phase 1-3 验证通过
- **估计**: 0.5 天

### T023: 清理后端 beverage 模块
- [ ] 删除 `backend/src/main/java/com/cinema/beverage/` 目录（如存在）
- [ ] 删除相关 DTO、Entity、Repository、Service、Controller
- [ ] 更新 Spring 配置（如有）
- **依赖**: T022
- **估计**: 0.5 天

### T024: 代码验证
- [ ] 运行 `npm run build` 确保前端编译成功
- [ ] 运行 `npm run lint` 确保无 lint 错误
- [ ] 运行 `npm run test` 确保测试通过
- [ ] 运行 `./mvnw clean package` 确保后端编译成功
- [ ] 运行 `./mvnw test` 确保后端测试通过
- **依赖**: T023
- **估计**: 0.5 天

### T025: 更新文档
- [ ] 更新 CLAUDE.md 中的相关说明
- [ ] 归档 O003, O004 规格文档（标记为已废弃/已迁移）
- [ ] 更新 API 文档
- **依赖**: T024
- **估计**: 0.5 天

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: 后端 | T001-T005 | 3.5 天 |
| Phase 2: 前端 | T006-T013 | 7.5 天 |
| Phase 3: 小程序 | T014-T017 | 3 天 |
| Phase 4: 清理 | T018-T025 | 4 天 |
| **Total** | **25 Tasks** | **18 天** |

---

## Dependencies Graph

```
T001 (DB)
  └── T002 (Entity)
        └── T003 (Service)
              └── T004 (Controller)
                    ├── T005 (Backend Tests)
                    └── T006 (Frontend Structure)
                          ├── T007 (SKU Selector)
                          │     └── T008 (Product Form)
                          │           └── T010 (List Page)
                          └── T009 (Spec Config)
                                └── T010 (List Page)
                                      └── T011 (Routes)
                                            └── T012 (Menu)
                                                  └── T013 (Frontend Tests)

T004 (Controller)
  └── T014 (Mini-program API)
        └── T015 (Spec Selector)
              └── T016 (Product Pages)
                    └── T017 (Mini-program Tests)

Phase 1-3 验证通过
  └── T018 (Delete beverage-config)
        └── T019 (Cleanup beverage-order)
              └── T020 (Cleanup Routes)
                    └── T021 (Cleanup Menu)
                          └── T022 (Cleanup DB)
                                └── T023 (Cleanup Backend)
                                      └── T024 (Verify)
                                            └── T025 (Docs)
```

---

## Risk Mitigation

1. **数据丢失风险**: Phase 4 清理前必须确认所有功能正常
2. **引用遗漏风险**: 使用全局搜索确认无遗留引用
3. **回滚计划**: 保留 Git 分支，可随时回滚

---

## Checklist Before Cleanup

- [ ] 渠道商品配置功能完整可用
- [ ] 小程序端商品展示正常
- [ ] 小程序端下单流程正常
- [ ] 所有测试通过
- [ ] 产品验收通过
- [ ] 备份现有数据（如需要）

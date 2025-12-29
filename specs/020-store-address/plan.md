# Implementation Plan: 门店地址信息管理

**Branch**: `020-store-address` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-store-address/spec.md`
**Extends**: 014-hall-store-backend

## Summary

扩展现有门店（Store）实体，增加完整的地址信息字段（省份、城市、区县、详细地址、联系电话），支持 B端门店管理界面的地址配置，以及 C端门店详情页的地址展示、复制和拨号功能。

**技术方案**:
- 后端: 扩展 Store 领域模型和 DTO，添加地址字段，通过 Supabase Migration 更新数据库
- B端: 在门店编辑页面添加地址表单，使用 Ant Design Form 组件
- C端: 在 hall-reserve-taro 中创建门店详情页，使用 Taro API 实现复制和拨号

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 21 + Spring Boot 3.x (backend)
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 4.x + React (multi-platform mini-program/H5)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1, Spring Boot Web, Supabase Java/HTTP client
- C端: Taro 4.1.9, Zod, TanStack Query, Taro.request wrapper

**Storage**: Supabase (PostgreSQL) - 扩展 stores 表添加 province, city, district, address, phone 字段

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests)
- C端: H5 浏览器测试 + 微信开发者工具
- 后端: JUnit 5 + Spring Boot Test

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge)
- C端: 微信小程序 + H5

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 020-store-address 与 active_spec 020-store-address 一致
- [x] **测试驱动开发**: 将为地址表单组件和 API 编写单元测试和集成测试
- [x] **组件化架构**: B端使用 AddressForm 分子组件，C端使用 StoreDetail 页面组件
- [x] **前端技术栈分层**: B端使用 React + Ant Design，C端使用 Taro 框架，严格分离
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理门店数据的获取和缓存
- [x] **代码质量工程化**: 使用 TypeScript 类型检查，Zod 进行电话格式校验
- [x] **后端技术栈约束**: 使用 Spring Boot + Supabase，通过 WebClient 访问数据库

### 性能与标准检查：

- [x] **性能标准**: 门店列表页加载 < 500ms，地址表单渲染 < 100ms
- [x] **安全标准**: 使用 Zod 校验电话格式，防止 XSS
- [x] **可访问性标准**: 表单字段有 label 和 aria 属性

## Project Structure

### Documentation (this feature)

```text
specs/020-store-address/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Research findings ✓
├── data-model.md        # Data model design ✓
├── quickstart.md        # Development quickstart ✓
├── contracts/           # API contracts
│   └── api.yaml         # OpenAPI specification ✓
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist ✓
└── tasks.md             # Development tasks (via /speckit.tasks)
```

### Source Code Changes

```text
# Backend (扩展)
backend/src/main/java/com/cinema/hallstore/
├── domain/Store.java                    # 添加地址字段
├── dto/StoreDTO.java                    # 添加地址字段 + addressSummary
├── dto/UpdateStoreRequest.java          # 新建：更新门店请求
├── repository/StoreRepository.java      # 更新：支持新字段
├── service/StoreService.java            # 更新：地址校验逻辑
└── controller/StoreController.java      # 更新：PUT 端点

backend/src/main/resources/db/migration/
└── V6__add_store_address_fields.sql     # 数据库迁移

# B端 Frontend (扩展)
frontend/src/
├── types/store.ts                       # 更新 Store 类型
├── features/store-management/
│   ├── components/
│   │   └── AddressForm.tsx              # 新建：地址表单组件
│   └── hooks/
│       └── useUpdateStore.ts            # 新建：更新门店 hook
└── pages/stores/
    └── edit.tsx                         # 更新：添加地址表单区域

# C端 Taro (扩展)
hall-reserve-taro/src/
├── types/store.ts                       # 新建：Store 类型
├── pages/store-detail/
│   ├── index.tsx                        # 新建：门店详情页
│   └── index.scss                       # 新建：样式
└── utils/phone.ts                       # 新建：拨号工具
```

## Research Findings

详见 [research.md](./research.md)

关键决策:
1. 扩展 stores 表而非新建关联表
2. 保留 region 字段以向后兼容
3. addressSummary 为派生字段，不存储
4. 电话格式支持手机号、座机、400热线

## Artifacts Generated

| Artifact | Path | Status |
|----------|------|--------|
| Research | research.md | ✓ Complete |
| Data Model | data-model.md | ✓ Complete |
| API Contract | contracts/api.yaml | ✓ Complete |
| Quickstart | quickstart.md | ✓ Complete |

## Next Steps

运行 `/speckit.tasks` 生成任务分解

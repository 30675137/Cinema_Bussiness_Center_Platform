# Implementation Plan: SKU 类型重构 - 移除 SPU productType

**@spec P008-sku-type-refactor**
**Branch**: `P008-sku-type-refactor` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/P008-sku-type-refactor/spec.md`

## Summary

移除 SPU 的 `productType` 字段，让产品类型完全由 SKU 的 `skuType` 枚举管理。SKU 创建时必须选择类型（原料/包材/成品/套餐），创建后类型不可修改。根据类型动态显示不同的表单字段（BOM 配置、标准成本等）。

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Hook Form 7.68.0, Zod 4.1.13
- 后端: Spring Boot Web, Spring Data JPA, Supabase (PostgreSQL)

**Storage**: Supabase (PostgreSQL) 作为主要后端数据源

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests)
- 后端: JUnit 5

**Target Platform**:
- B端: Web browser + Spring Boot backend API

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend)

## Constitution Check

*GATE: Must pass before implementation.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 分支 `P008-sku-type-refactor` 与 active_spec `specs/P008-sku-type-refactor` 匹配
- [x] **测试驱动开发**: 修改需先编写单元测试验证
- [x] **组件化架构**: SKU 类型选择器遵循原子设计
- [x] **前端技术栈分层**: B端使用 React + Ant Design
- [x] **数据驱动状态管理**: 使用 TanStack Query 管理服务器状态
- [x] **代码质量工程化**: 所有文件包含 @spec 归属标识
- [x] **后端技术栈约束**: 使用 Spring Boot + Supabase

### 性能与标准检查：
- [x] **性能标准**: SKU 类型选择不影响表单加载性能
- [x] **安全标准**: 使用 Zod 验证表单数据
- [x] **可访问性标准**: 选择器支持键盘导航

## Implementation Phases

### Phase 1: 后端修改 (优先级: P0)

#### 1.1 更新 SPU 实体
- 移除 `Spu.java` 中的 `productType` 字段及 getter/setter
- 更新 `SpuController.java` 移除 productType 参数
- 更新 `SpuService.java` 移除 productType 逻辑

#### 1.2 更新 SKU 服务
- 在 `SkuService.updateSku()` 添加 skuType 不可变校验
- 返回业务异常 `SKU_BIZ_001: SKU类型创建后不可修改`

#### 1.3 后端测试
- 编写 `SkuServiceTest` 验证 skuType 不可变
- 编写 `SpuControllerTest` 验证 productType 已移除

### Phase 2: 前端类型定义修改 (优先级: P0)

#### 2.1 更新 SPU 类型
- `frontend/src/types/spu.ts`: 移除 `ProductType` 和 `PRODUCT_TYPE_OPTIONS`
- `frontend/src/types/spu.ts`: 从 `SPUItem` 和 `SPUCreationForm` 移除 productType

#### 2.2 更新 SPU 服务
- `frontend/src/services/spuService.ts`: 移除 productType 相关处理

### Phase 3: SKU 表单增强 (优先级: P1)

#### 3.1 添加 SKU 类型选择器
- `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx`: 添加类型选择器
- 创建模式: 可选择
- 编辑模式: 只读显示

#### 3.2 更新表单 Schema
- `frontend/src/components/sku/SkuForm/schema.ts`: 添加 skuType 必填校验
- 添加条件验证: 原料/包材类型必须填写 standardCost

#### 3.3 条件表单字段
- 根据 skuType 显示/隐藏 BOM 配置 Tab
- 根据 skuType 显示/隐藏套餐配置 Tab
- 根据 skuType 显示/隐藏标准成本字段

### Phase 4: SPU 表单清理 (优先级: P2)

#### 4.1 移除产品类型选择器
- 从 SPU 创建表单移除 productType 字段
- 从 SPU 编辑表单移除 productType 字段

#### 4.2 移除列表显示
- 从 SPU 列表移除产品类型列

### Phase 5: 测试与验收 (优先级: P2)

#### 5.1 单元测试
- SKU 类型选择器组件测试
- SKU 表单 schema 验证测试

#### 5.2 E2E 测试 (可选)
- SKU 创建流程测试
- SKU 编辑流程测试（验证类型只读）

## Files to Modify

### 后端

| 文件 | 修改类型 | Phase |
|------|---------|-------|
| `backend/src/main/java/com/cinema/hallstore/domain/Spu.java` | 删除字段 | 1 |
| `backend/src/main/java/com/cinema/hallstore/controller/SpuController.java` | 更新 | 1 |
| `backend/src/main/java/com/cinema/hallstore/service/SpuService.java` | 更新 | 1 |
| `backend/src/main/java/com/cinema/hallstore/service/SkuService.java` | 更新 | 1 |
| `backend/src/main/java/com/cinema/hallstore/controller/SkuController.java` | 更新 | 1 |

### 前端

| 文件 | 修改类型 | Phase |
|------|---------|-------|
| `frontend/src/types/spu.ts` | 更新 | 2 |
| `frontend/src/services/spuService.ts` | 更新 | 2 |
| `frontend/src/components/sku/SkuForm/BasicInfoTab.tsx` | 更新 | 3 |
| `frontend/src/components/sku/SkuForm/schema.ts` | 更新 | 3 |
| `frontend/src/components/sku/SkuForm/index.tsx` | 更新 | 3 |
| SPU 表单组件 | 更新 | 4 |
| SPU 列表组件 | 更新 | 4 |

## Risk Assessment

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 前端遗漏 productType 引用 | 编译错误 | TypeScript 严格模式检查 |
| 现有 SKU 无 skuType | 运行时错误 | 数据验证脚本 |
| 后端 DTO 遗漏更新 | 序列化错误 | 单元测试覆盖 |

## Success Metrics

- [ ] SKU 创建流程完成时间不超过 2 分钟
- [ ] 100% 的 SKU 创建请求包含有效的 skuType
- [ ] 所有现有 SKU 数据正常显示和编辑
- [ ] SPU 创建/编辑页面加载时间不增加
- [ ] 用户首次使用 SKU 类型选择功能成功率达到 95%

## Related Documents

- [spec.md](./spec.md) - 功能规格
- [research.md](./research.md) - 代码研究
- [data-model.md](./data-model.md) - 数据模型
- [contracts/api.yaml](./contracts/api.yaml) - API 契约
- [quickstart.md](./quickstart.md) - 开发指南

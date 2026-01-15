# Research: 供应商编辑功能

**@spec N003-supplier-edit**
**Date**: 2026-01-11

## 技术决策

### 1. 后端 API 设计

**决策**: 使用 RESTful 风格 API

| 操作 | 方法 | 端点 | 说明 |
|------|------|------|------|
| 创建供应商 | POST | `/api/suppliers` | 新建供应商记录 |
| 更新供应商 | PUT | `/api/suppliers/{id}` | 更新现有供应商 |

**理由**:
- 遵循项目现有 API 设计规范
- 与 `SupplierController.java` 已有的 `GET /api/suppliers` 风格一致
- PUT 语义用于完整更新资源

### 2. 数据传输对象 (DTO)

**决策**: 创建独立的 Request DTO

```
SupplierCreateRequest.java  - 新建请求 DTO
SupplierUpdateRequest.java  - 更新请求 DTO
```

**理由**:
- 分离请求和实体对象，便于验证
- 更新 DTO 不包含 `code` 字段（编码不可修改）
- 遵循项目 DTO 命名规范

### 3. 前端状态管理

**决策**: 复用现有 `supplierStore` + TanStack Query 刷新

**理由**:
- 保存成功后调用 `fetchSuppliers()` 刷新列表
- 无需添加新的 mutation state
- 简单直接，符合现有架构

### 4. 表单验证

**决策**: 前后端双重验证

| 位置 | 技术 | 验证项 |
|------|------|--------|
| 前端 | Ant Design Form rules | 必填、手机号格式 |
| 后端 | Jakarta Validation | 必填、长度限制、枚举值 |

**理由**:
- 前端即时反馈提升用户体验
- 后端验证保证数据完整性

## 现有代码分析

### 后端现状

- `SupplierEntity.java`: 实体已定义所有需要的字段
- `SupplierController.java`: 仅有 GET 列表接口
- `SupplierRepository.java`: JPA Repository 已存在

**需要新增**:
1. `SupplierService.java` - create/update 方法
2. `SupplierCreateRequest.java` - 创建请求 DTO
3. `SupplierUpdateRequest.java` - 更新请求 DTO
4. Controller 新增 POST/PUT 端点

### 前端现状

- `SupplierList.tsx`: 编辑模态框 UI 已实现，`handleModalOk` 未实现保存逻辑
- `supplierApi.ts`: 仅有 fetch 函数，缺少 create/update
- `supplierStore.ts`: 已有 `fetchSuppliers` action

**需要修改**:
1. `supplierApi.ts` - 添加 `createSupplier`、`updateSupplier` 函数
2. `SupplierList.tsx` - 实现 `handleModalOk` 保存逻辑

## 无需额外研究

所有技术决策已明确：
- ✅ 后端技术栈已确定 (Spring Boot + JPA)
- ✅ 前端技术栈已确定 (React + Ant Design)
- ✅ 数据模型已存在 (SupplierEntity)
- ✅ API 响应格式已定义 (ApiResponse<T>)

## 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|---------|
| 编码唯一性冲突 | 中 | 中 | 后端返回 409 错误，前端显示提示 |
| 并发更新冲突 | 低 | 低 | 使用 updatedAt 字段检测，返回错误提示 |
| 网络请求失败 | 低 | 中 | 前端保留模态框，显示错误提示允许重试 |

# Research: 门店地址信息管理

**Feature**: 020-store-address
**Date**: 2025-12-22

## Research Summary

### R1: 现有 Store 模型分析

**发现**:
- 后端 `Store.java` 当前字段: id, code, name, region, status, createdAt, updatedAt
- 后端仅有简单的 `region` 字段（如 "北京"）
- 前端 `frontend/src/types/store.ts` 已定义完整的 `StoreAddress` 接口
- 前端已预期 province, city, district, street, building, postalCode 字段

**Decision**: 扩展后端 Store 模型以匹配前端已有定义
**Rationale**: 前端类型定义已经较为完善，后端需要补齐以实现前后端一致性
**Alternatives considered**:
- 新建独立的 StoreAddress 表 - 拒绝，增加复杂度
- 仅使用单一 address 字段 - 拒绝，无法支持按区域筛选

---

### R2: 数据库扩展方案

**发现**:
- Supabase stores 表当前结构: id, code, name, region, status, created_at, updated_at
- 需要添加列: province, city, district, address, phone
- region 字段可保留用于向后兼容，或在迁移脚本中转换为 province

**Decision**: 通过 Supabase Migration 添加新列，保留 region 字段
**Rationale**:
- 保留 region 确保向后兼容
- city 字段与 region 可能重复，region 可用于更粗粒度的区域划分（如华东、华北）
**Alternatives considered**:
- 删除 region 并用 province 替代 - 拒绝，破坏向后兼容性

**Migration Schema**:
```sql
ALTER TABLE stores
ADD COLUMN province VARCHAR(50),
ADD COLUMN city VARCHAR(50),
ADD COLUMN district VARCHAR(50),
ADD COLUMN address TEXT,
ADD COLUMN phone VARCHAR(20);
```

---

### R3: API 响应格式对齐

**发现**:
- 现有 GET /api/stores 返回 StoreDTO（不含地址详情）
- 需要扩展 StoreDTO 添加地址字段
- 列表 API 需要额外的 addressSummary 派生字段

**Decision**:
- StoreDTO 添加 province, city, district, address, phone 字段
- 添加 getAddressSummary() 方法生成 "城市 区县" 格式

**Rationale**: 保持 API 向后兼容，新字段为可选（nullable）

---

### R4: 前端类型对齐

**发现**:
- B端前端 `StoreAddress` 接口已存在，字段包括 street, building, postalCode
- 规格要求的字段为: province, city, district, address(详细地址), phone
- 需要对齐命名: street → address, 暂不实现 building/postalCode

**Decision**:
- B端: 调整现有 StoreAddress 接口或创建简化版本
- C端: 在 hall-reserve-taro 中新增 Store 类型定义

**Rationale**: 简化实现，聚焦核心字段

---

### R5: C端 Taro 实现方案

**发现**:
- hall-reserve-taro 项目存在，用于 C端场景包预约
- 需要新增门店详情页展示地址
- Taro API: `Taro.setClipboardData` (复制), `Taro.makePhoneCall` (拨号)

**Decision**:
- 在 hall-reserve-taro 中添加 StoreDetail 页面
- 使用 Taro 原生 API 实现复制和拨号功能

**Rationale**: 遵循 Taro 最佳实践，确保多端兼容

---

### R6: 电话号码格式验证

**发现**:
- 中国大陆手机号: 1开头的11位数字，如 13812345678
- 座机号: 区号(3-4位) + 号码(7-8位)，如 010-12345678 或 021-87654321
- 400/800 服务热线: 400-xxx-xxxx 或 800-xxx-xxxx

**Decision**:
- 后端正则: `^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$`
- 允许带或不带连字符的格式
- 前端同步校验

**Rationale**: 覆盖主流电话格式，不过度限制

---

## Technology Decisions Summary

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 数据存储 | 扩展 stores 表 | 简单，无需额外关联 |
| region 字段 | 保留 | 向后兼容 |
| addressSummary | 派生字段 | 减少冗余存储 |
| 电话验证 | 正则表达式 | 灵活支持多种格式 |
| C端复制/拨号 | Taro 原生 API | 确保多端兼容 |

## Dependencies

- 014-hall-store-backend: Store 基础模型
- Supabase: 数据库迁移
- Taro: C端 API (setClipboardData, makePhoneCall)

## Risks & Mitigations

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| 数据迁移影响现有数据 | 低 | 中 | 新字段设为 nullable，渐进迁移 |
| 电话格式过于严格 | 中 | 低 | 使用宽松正则，提供清晰错误提示 |
| C端 API 兼容性 | 低 | 中 | 使用 Taro 封装的跨平台 API |

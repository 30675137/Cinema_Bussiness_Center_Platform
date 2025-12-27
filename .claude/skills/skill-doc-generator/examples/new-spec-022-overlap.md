# Feature Specification: 门店扩展信息

**Feature Branch**: `022-store-extension`
**Created**: 2025-12-22

## Requirements

### Key Entities

- **Store（门店）扩展**:
  - city（城市，字符串，必填） ← 同名字段，应保留原定义
  - district（区县，字符串，必填） ← 同名字段，应保留原定义
  - address（详细地址，字符串，选填） ← 新字段
  - phone（联系电话，字符串，选填） ← 新字段
  - openingHours（营业时间，字符串，选填） ← 新字段
  - capacity（容纳人数，整型，选填） ← 新字段

**业务规则**：
- openingHours 格式为 "HH:mm-HH:mm"（如 "09:00-22:00"）
- capacity 表示门店最大容纳人数，用于场景包预订限制

**关系**：
- 与 Scenario 的关系：一对多 - 一个门店可以有多个场景包 ← 与原 Store 定义重复

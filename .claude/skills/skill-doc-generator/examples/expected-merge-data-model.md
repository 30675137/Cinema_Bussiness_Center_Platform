# 数据/领域模型说明

## 文档信息
- 功能标识：020-store-address, 022-store-extension
- 生成时间：2025-12-22T11:00:00Z
- 基于规格：specs/020-store-address/spec.md, specs/022-store-extension/spec.md

## 领域概述

本功能扩展门店实体（Store），添加地址信息和运营信息相关字段。

## 核心实体

### Store（门店）

**说明**：门店实体扩展，新增地址信息字段

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| province | String | 是 | 省份 | 中国大陆省份名称 |
| city | String | 是 | 城市 | 与原 014 规格中 region/city 字段对齐 |
| district | String | 是 | 区县 | 三级行政区划 |
| address | String | 否 | 详细地址 | 街道门牌号等详细信息 （来源：022-store-extension） |
| phone | String | 否 | 联系电话 | （来源：022-store-extension） |
| openingHours | String | 否 | 营业时间 | （来源：022-store-extension） |
| capacity | Integer | 否 | 容纳人数 | （来源：022-store-extension） |

**业务规则**：
- province、city、district 三级行政区划为必填项，确保地址信息完整性
- openingHours 格式为 "HH:mm-HH:mm"（如 "09:00-22:00"）（来源：022-store-extension）
- capacity 表示门店最大容纳人数，用于场景包预订限制（来源：022-store-extension）

**关系**：
- 与 User 的关系：多对一 - 一个门店属于一个用户（运营人员）
- 与 Scenario 的关系：一对多 - 一个门店可以有多个场景包

---

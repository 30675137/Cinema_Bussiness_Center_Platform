# 门店地址管理 API Postman 测试集合

## 概述

本目录包含 020-store-address 功能的 Postman API 测试集合，用于验证门店地址管理相关 API 的正确性。

## 文件说明

| 文件 | 说明 |
|------|------|
| `020-store-address.postman_collection.json` | Postman 测试集合 |
| `020-local.postman_environment.json` | 本地开发环境配置 |

## 测试用例

### 1. 获取门店列表
- **请求**: `GET /api/stores`
- **验证点**:
  - 响应状态码 200
  - 响应包含 success 字段
  - 每个门店包含 addressSummary 字段

### 2. 获取门店详情
- **请求**: `GET /api/stores/{storeId}`
- **验证点**:
  - 响应状态码 200
  - 门店数据包含完整地址字段 (province, city, district, address, phone, addressSummary)

### 3. 更新门店地址
- **请求**: `PUT /api/stores/{storeId}`
- **验证点**:
  - 响应状态码 200
  - 更新后的门店包含新地址信息

### 4. 无效电话格式验证
- **请求**: `PUT /api/stores/{storeId}` (phone: "invalid-phone")
- **验证点**:
  - 响应状态码 400
  - 响应包含电话格式错误信息

### 5. 缺少必填字段验证
- **请求**: `PUT /api/stores/{storeId}` (缺少 city, district)
- **验证点**:
  - 响应状态码 400
  - 响应包含验证错误信息

## 使用方法

### 方法一：Postman GUI

1. 打开 Postman
2. 导入 `020-store-address.postman_collection.json`
3. 导入 `020-local.postman_environment.json`
4. 选择 "020-local" 环境
5. 确保后端服务运行在 `http://localhost:8080`
6. 运行集合中的测试

### 方法二：Newman CLI

```bash
# 安装 Newman
npm install -g newman

# 运行测试
newman run 020-store-address.postman_collection.json \
  -e 020-local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `baseUrl` | API 基础地址 | `http://localhost:8080` |
| `storeId` | 门店 ID（由获取列表接口自动设置） | - |

## 注意事项

1. 运行测试前确保后端服务已启动
2. 测试用例按顺序执行，"获取门店列表" 会设置 `storeId` 环境变量供后续测试使用
3. 如需测试特定门店，可手动设置 `storeId` 环境变量

## 相关文档

- [API 契约文档](../contracts/api.yaml)
- [功能规格文档](../spec.md)
- [快速验证指南](../quickstart.md)
